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
  account_id   = var.slackbot_name
  display_name = "${var.slackbot_name} slackbot service account"
}

module "secret" {
  source = "../secret"

  for_each = var.secrets

  id              = "${var.slackbot_name}-slackbot-${each.key}"
  value           = each.value
  region          = var.region
  accessor_member = "serviceAccount:${google_service_account.slackbot.email}"
}

resource "google_storage_bucket" "state" {
  provider                    = google-beta
  name                        = "${var.gcp_project_id}-${var.slackbot_name}-state"
  location                    = var.region
  uniform_bucket_level_access = true
  force_destroy               = true
}

resource "google_storage_bucket_iam_binding" "state_bucket_admin" {
  provider = google-beta
  bucket   = google_storage_bucket.state.name
  role     = "roles/storage.admin"
  members = [
    "serviceAccount:${google_service_account.slackbot.email}",
  ]
}

resource "null_resource" "build" {
  provisioner "local-exec" {
    command     = var.build_cmd
    working_dir = var.build_dir
  }
  triggers = {
    always_run = timestamp()
  }
}

resource "null_resource" "zip_files" {
  provisioner "local-exec" {
    command     = <<EOT
      jq '.dependencies|=with_entries(select(.key|test("@apinasaari-slackbots/.*")|not))' package.json > dist/package.json
      zip --junk-paths dist/app.zip dist/*
    EOT
    working_dir = var.build_dir
  }
  depends_on = [
    null_resource.build
  ]
  triggers = {
    always_run = timestamp()
  }
}

resource "google_storage_bucket" "sources" {
  name                        = "${var.gcp_project_id}-${var.slackbot_name}-sources"
  project                     = var.gcp_project_id
  location                    = var.region
  uniform_bucket_level_access = true
}

resource "google_storage_bucket_object" "archive" {
  provider = google-beta
  name     = "${var.slackbot_name}-${uuid()}"
  source   = "${var.build_dir}/dist/app.zip"
  bucket   = google_storage_bucket.sources.name
  depends_on = [
    null_resource.zip_files
  ]
}

resource "google_cloudfunctions_function" "slackbot" {
  provider              = google-beta
  name                  = "${var.slackbot_name}-slackbot"
  description           = "${var.slackbot_name} slackbot"
  runtime               = "nodejs12"
  available_memory_mb   = var.memory_mb
  service_account_email = google_service_account.slackbot.email
  source_archive_bucket = google_storage_bucket.sources.name
  source_archive_object = google_storage_bucket_object.archive.name
  entry_point           = var.entry_point
  trigger_http          = var.http_trigger
  dynamic "event_trigger" {
    for_each = var.event_trigger_type == null ? [] : [1]
    content {
      event_type = var.event_trigger_type
      resource   = var.event_trigger_resource
    }
  }
  environment_variables = merge(
    var.environment_variables,
    { STATE_BUCKET_NAME = google_storage_bucket.state.id },
    { for secret_name, secret_value in var.secrets :
      format("SECRET_ID_%s", replace(upper(secret_name), "-", "_")) =>
      format("projects/%s/secrets/%s-slackbot-%s", var.gcp_project_id, var.slackbot_name, secret_name)
    }
  )
}

resource "google_cloudfunctions_function_iam_member" "service_account_invoker" {
  cloud_function = google_cloudfunctions_function.slackbot.name
  role           = "roles/cloudfunctions.invoker"
  member         = "serviceAccount:${google_service_account.slackbot.email}"
}

resource "google_cloudfunctions_function_iam_member" "all_users_invoker" {
  count          = var.http_trigger == true ? 1 : 0
  cloud_function = google_cloudfunctions_function.slackbot.name
  role           = "roles/cloudfunctions.invoker"
  member         = "allUsers"
}
