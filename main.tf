terraform {
  required_version = "~>0.13"
  backend "gcs" {}
}

locals {
  region = "europe-west1"
}

provider "google-beta" {
  version = "3.39.0"
  project = var.gcp_project_id
  region  = local.region
}

resource "google_storage_bucket" "sources" {
  name                        = "${var.gcp_project_id}-sources"
  project                     = var.gcp_project_id
  location                    = "EU"
  uniform_bucket_level_access = true
}

resource "google_secret_manager_secret" "slack_token" {
  provider  = google-beta
  secret_id = "slack-token"
  replication {
    user_managed {
      replicas {
        location = local.region
      }
    }
  }
}

resource "google_secret_manager_secret_version" "slack_token" {
  secret      = google_secret_manager_secret.slack_token.id
  secret_data = var.slack_token
}

module "apinasaari-slackbot-ence-pelaa" {
  source                = "./apinasaari-slackbot-ence-pelaa"
  gcp_project_id        = var.gcp_project_id
  region                = local.region
  sources_bucket_name   = google_storage_bucket.sources.name
  slack_token_secret_id = google_secret_manager_secret.slack_token.id
  slack_channel_id      = var.ence_pelaa_slackbot_channel_id
}

