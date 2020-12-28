provider "google-beta" {
  version = "3.39.0"
  project = var.gcp_project_id
  region  = var.region
}

resource "google_storage_bucket_iam_binding" "viewers" {
  bucket  = var.bucket_name
  role    = "roles/storage.objectViewer"
  members = var.object_viewers
}

resource "google_storage_bucket_iam_binding" "creators" {
  bucket  = var.bucket_name
  role    = "roles/storage.objectCreator"
  members = var.object_creators
}
