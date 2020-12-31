provider "google-beta" {
  version = "3.39.0"
  project = var.gcp_project_id
  region  = var.region
}

resource "google_storage_bucket" "bucket" {
  provider                    = google-beta
  name                        = "${var.gcp_project_id}-${var.slackbot_name}-state"
  location                    = var.region
  uniform_bucket_level_access = true
  force_destroy               = true
}

resource "google_storage_bucket_iam_binding" "bucket_admin" {
  provider = google-beta
  bucket   = google_storage_bucket.bucket.name
  role     = "roles/storage.admin"
  members = [
    "serviceAccount:${var.slackbot_service_account_email}",
  ]
}
