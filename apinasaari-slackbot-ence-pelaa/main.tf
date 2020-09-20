provider "google-beta" {
  version = "3.39.0"
  project = var.gcp_project_id
  region  = var.region
}

provider "null" {
  version = "2.1.2"
}

resource "google_service_account" "slackbot" {
  provider     = google-beta
  account_id   = "ence-pelaa-slackbot"
  display_name = "Ence pelaa slackbot service account"
}

resource "google_project_iam_member" "slackbot_cloud_functions_invoker" {
  provider = google-beta
  role     = "roles/cloudfunctions.invoker"
  member   = "serviceAccount:${google_service_account.slackbot.email}"
}

resource "google_secret_manager_secret_iam_binding" "slackbot_slack_token_accessor" {
  provider  = google-beta
  secret_id = var.slack_token_secret_id
  role      = "roles/secretmanager.secretAccessor"
  members = [
    "serviceAccount:${google_service_account.slackbot.email}",
  ]
}

resource "google_pubsub_topic" "invoke" {
  provider = google-beta
  name     = "ence-pelaa-slackbot-topic"
}

resource "google_cloud_scheduler_job" "invoke" {
  provider    = google-beta
  name        = "ence-pelaa-slackbot-job"
  description = "Triggers Ence pelaa slackbot once per hour"
  schedule    = "0 * * * *"

  pubsub_target {
    topic_name = google_pubsub_topic.invoke.id
    data       = base64encode("ping")
  }
}

resource "google_storage_bucket" "state" {
  provider                    = google-beta
  name                        = "${var.gcp_project_id}-ence-pelaa-state"
  location                    = "EU"
  uniform_bucket_level_access = true
}

resource "google_storage_bucket_iam_binding" "slackbot_state_bucket_admin" {
  provider = google-beta
  bucket   = google_storage_bucket.state.name
  role     = "roles/storage.admin"
  members = [
    "serviceAccount:${google_service_account.slackbot.email}",
  ]
}

resource "null_resource" "build" {
  provisioner "local-exec" {
    command     = "yarn build"
    working_dir = path.module
  }
  triggers = {
    always_run = timestamp()
  }
}

resource "null_resource" "archive" {
  provisioner "local-exec" {
    command     = "zip --junk-paths dist/app.zip dist/*.js package.json"
    working_dir = path.module
  }
  depends_on = [
    null_resource.build
  ]
  triggers = {
    always_run = timestamp()
  }
}

resource "google_storage_bucket_object" "source" {
  provider = google-beta
  name     = "ence-pelaa-${uuid()}"
  source   = "${path.module}/dist/app.zip"
  bucket   = var.sources_bucket_name
  depends_on = [
    null_resource.archive
  ]
}

resource "google_cloudfunctions_function" "slackbot" {
  provider              = google-beta
  name                  = "ence-pelaa-slackbot"
  description           = "Ence pelaa slackbot"
  runtime               = "nodejs12"
  available_memory_mb   = 128
  service_account_email = google_service_account.slackbot.email
  source_archive_bucket = var.sources_bucket_name
  source_archive_object = google_storage_bucket_object.source.name
  entry_point           = "start"
  event_trigger {
    event_type = "google.pubsub.topic.publish"
    resource   = google_pubsub_topic.invoke.name
  }
  environment_variables = {
    GCP_PROJECT_ID        = var.gcp_project_id
    STATE_BUCKET_NAME     = google_storage_bucket.state.name
    SLACK_CHANNEL_ID      = var.slack_channel_id
    SLACK_TOKEN_SECRET_ID = var.slack_token_secret_id
  }
}
