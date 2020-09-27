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
  account_id   = "niilo22-slackbot"
  display_name = "Niilo22 slackbot service account"
}

resource "google_project_iam_member" "cloud_functions_invoker" {
  provider = google-beta
  role     = "roles/cloudfunctions.invoker"
  member   = "serviceAccount:${google_service_account.slackbot.email}"
}

resource "google_secret_manager_secret_iam_member" "slack_token" {
  provider  = google-beta
  secret_id = var.slack_token_secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.slackbot.email}"
}

resource "google_secret_manager_secret_iam_member" "youtube_api_key" {
  provider  = google-beta
  secret_id = var.youtube_api_key_secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.slackbot.email}"
}

resource "google_pubsub_topic" "invoke" {
  provider = google-beta
  name     = "niilo22-slackbot-topic"
}

resource "google_cloud_scheduler_job" "invoke" {
  provider    = google-beta
  name        = "niilo22-slackbot-job"
  description = "Triggers Niilo22 slackbot every sunday evening"
  schedule    = "0 20 * * SUN"
  time_zone   = "Europe/Helsinki"

  pubsub_target {
    topic_name = google_pubsub_topic.invoke.id
    data       = base64encode("ping")
  }
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
  name     = "niilo22-${uuid()}"
  source   = "${path.module}/dist/app.zip"
  bucket   = var.sources_bucket_name
  depends_on = [
    null_resource.archive
  ]
}

resource "google_cloudfunctions_function" "slackbot" {
  provider              = google-beta
  name                  = "niilo22-slackbot"
  description           = "Niilo22 slackbot"
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
    GCP_PROJECT_ID            = var.gcp_project_id
    SLACK_CHANNEL_ID          = var.slack_channel_id
    SLACK_TOKEN_SECRET_ID     = var.slack_token_secret_id
    YOUTUBE_API_KEY_SECRET_ID = var.youtube_api_key_secret_id
  }
}
