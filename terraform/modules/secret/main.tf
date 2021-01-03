resource "google_secret_manager_secret" "secret" {
  secret_id = var.id
  replication {
    user_managed {
      replicas {
        location = var.region
      }
    }
  }
}

resource "google_secret_manager_secret_version" "version" {
  secret      = google_secret_manager_secret.secret.id
  secret_data = var.value
}

resource "google_secret_manager_secret_iam_binding" "accessors" {
  secret_id = google_secret_manager_secret.secret.id
  role      = "roles/secretmanager.secretAccessor"
  members   = var.accessors
}
