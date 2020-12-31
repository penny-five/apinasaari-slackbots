provider "google-beta" {
  version = "3.39.0"
  project = var.gcp_project_id
  region  = var.region
}

resource "google_storage_bucket" "bucket" {
  provider                    = google-beta
  name                        = var.bucket_name
  location                    = var.region
  uniform_bucket_level_access = true
  force_destroy               = true
}

resource "google_storage_bucket_iam_binding" "viewers" {
  bucket  = google_storage_bucket.bucket.name
  role    = "roles/storage.objectViewer"
  members = var.object_viewers
}

resource "google_storage_bucket_iam_binding" "creators" {
  bucket  = google_storage_bucket.bucket.name
  role    = "roles/storage.objectCreator"
  members = var.object_creators
}
