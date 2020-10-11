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

provider "google" {
  version = "3.39.0"
  project = var.gcp_project_id
  region  = local.region
}

module "apinasaari-slackbot-ence-pelaa" {
  source           = "./apinasaari-slackbots-ence-pelaa"
  gcp_project_id   = var.gcp_project_id
  region           = local.region
  slack_channel_id = var.ence_pelaa_slackbot_channel_id
  slack_token      = var.slack_token
}

module "apinasaari-slackbot-niilo22" {
  source           = "./apinasaari-slackbots-niilo22"
  gcp_project_id   = var.gcp_project_id
  region           = local.region
  slack_channel_id = var.niilo22_slackbot_channel_id
  slack_token      = var.slack_token
  youtube_api_key  = var.youtube_api_key
}

module "apinasaari-slackbot-solita" {
  source           = "./apinasaari-slackbots-solita"
  gcp_project_id   = var.gcp_project_id
  region           = local.region
  slack_channel_id = var.solita_slackbot_channel_id
  slack_token      = var.slack_token
}
