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

module "apinasaari_slackbot_ence_pelaa" {
  source           = "./slackbots/ence-pelaa"
  gcp_project_id   = var.gcp_project_id
  slack_token      = var.slack_token
  slack_channel_id = var.ence_pelaa_slackbot_channel_id
}

module "apinasaari_slackbot_niilo22" {
  source           = "./slackbots/niilo22"
  gcp_project_id   = var.gcp_project_id
  slack_token      = var.slack_token
  slack_channel_id = var.niilo22_slackbot_channel_id
  youtube_api_key  = var.youtube_api_key
}

module "apinasaari_slackbot_solita" {
  source           = "./slackbots/solita"
  gcp_project_id   = var.gcp_project_id
  slack_token      = var.slack_token
  slack_channel_id = var.solita_slackbot_channel_id
}

module "apinasaari_slackbot_gofore" {
  source           = "./slackbots/gofore"
  gcp_project_id   = var.gcp_project_id
  slack_token      = var.slack_token
  slack_channel_id = var.gofore_slackbot_channel_id
}

module "apinasaari_slackbot_meme_generator" {
  source               = "./slackbots/meme-generator"
  gcp_project_id       = var.gcp_project_id
  slack_token          = var.meme_generator_slackbot_slack_token
  slack_signing_secret = var.meme_generator_slackbot_slack_signing_secret
}
