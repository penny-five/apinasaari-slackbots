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
  source         = "./modules/scheduled-slackbot"
  gcp_project_id = var.gcp_project_id
  region         = local.region
  slackbot_name  = "ence-pelaa"
  schedule       = "0 * * * *"
  build_dir      = "${path.module}/../apinasaari-slackbots-ence-pelaa"
  build_cmd      = "yarn build"
  secrets = {
    slack-token = var.slack_token
  }
  environment_variables = {
    GCP_PROJECT_ID   = var.gcp_project_id
    SLACK_CHANNEL_ID = var.ence_pelaa_slackbot_channel_id
  }
}

module "apinasaari_slackbot_niilo22" {
  source         = "./modules/scheduled-slackbot"
  gcp_project_id = var.gcp_project_id
  region         = local.region
  slackbot_name  = "niilo22"
  schedule       = "0 20 * * SUN"
  build_dir      = "${path.module}/../apinasaari-slackbots-niilo22"
  build_cmd      = "yarn build"
  secrets = {
    youtube-api-key = var.youtube_api_key
    slack-token     = var.slack_token
  }
  environment_variables = {
    GCP_PROJECT_ID   = var.gcp_project_id
    SLACK_CHANNEL_ID = var.niilo22_slackbot_channel_id
  }
}

module "apinasaari_slackbot_solita" {
  source         = "./modules/scheduled-slackbot"
  gcp_project_id = var.gcp_project_id
  region         = local.region
  slackbot_name  = "solita"
  schedule       = "*/15 * * * *"
  build_dir      = "${path.module}/../apinasaari-slackbots-solita"
  build_cmd      = "yarn build"
  secrets = {
    slack-token = var.slack_token
  }
  environment_variables = {
    GCP_PROJECT_ID   = var.gcp_project_id
    SLACK_CHANNEL_ID = var.solita_slackbot_channel_id
  }
}

module "apinasaari_slackbot_gofore" {
  source         = "./modules/scheduled-slackbot"
  gcp_project_id = var.gcp_project_id
  region         = local.region
  slackbot_name  = "gofore"
  schedule       = "*/15 * * * *"
  build_dir      = "${path.module}/../apinasaari-slackbots-gofore"
  build_cmd      = "yarn build"
  secrets = {
    slack-token = var.slack_token
  }
  environment_variables = {
    GCP_PROJECT_ID   = var.gcp_project_id
    SLACK_CHANNEL_ID = var.gofore_slackbot_channel_id
  }
}
