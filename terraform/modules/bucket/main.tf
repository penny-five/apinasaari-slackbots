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

resource "google_storage_bucket_iam_binding" "public" {
  count   = var.public == true ? 1 : 0
  bucket  = google_storage_bucket.bucket.name
  role    = "roles/storage.objectViewer"
  members = ["allUsers"]
}
