terraform {
  required_version = "~>0.14.3"
  backend "gcs" {}

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "3.51.0"
    }
    null = {
      source  = "hashicorp/null"
      version = "3.0.0"
    }
  }
}

provider "google" {
  region  = local.region
  project = var.gcp_project_id
}

locals {
  region = "europe-west1"
}

module "apinasaari_slackbot_ence_pelaa" {
  source           = "./slackbots/ence-pelaa"
  slack_token      = var.slack_token
  slack_channel_id = var.ence_pelaa_slackbot_channel_id
}

module "apinasaari_slackbot_niilo22" {
  source           = "./slackbots/niilo22"
  slack_token      = var.slack_token
  slack_channel_id = var.niilo22_slackbot_channel_id
  youtube_api_key  = var.youtube_api_key
}

module "apinasaari_slackbot_solita" {
  source           = "./slackbots/solita"
  slack_token      = var.slack_token
  slack_channel_id = var.solita_slackbot_channel_id
}

module "apinasaari_slackbot_gofore" {
  source           = "./slackbots/gofore"
  slack_token      = var.slack_token
  slack_channel_id = var.gofore_slackbot_channel_id
}

module "apinasaari_slackbot_meme_generator" {
  source               = "./slackbots/meme-generator"
  slack_token          = var.meme_generator_slackbot_slack_token
  slack_signing_secret = var.meme_generator_slackbot_slack_signing_secret
}

module "apinasaari_slackbot_sotaraportti" {
  source           = "./slackbots/sotaraportti"
  slack_token      = var.slack_token
  slack_channel_id = var.sotaraportti_slackbot_channel_id
}
