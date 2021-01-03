data "google_project" "project" {
}

resource "google_storage_bucket" "bucket" {
  name                        = "${data.google_project.project.project_id}-${var.slackbot_name}-state"
  location                    = var.region
  uniform_bucket_level_access = true
  force_destroy               = true
}

resource "google_storage_bucket_iam_binding" "bucket_admin" {
  bucket = google_storage_bucket.bucket.name
  role   = "roles/storage.admin"
  members = [
    "serviceAccount:${var.slackbot_service_account_email}",
  ]
}
