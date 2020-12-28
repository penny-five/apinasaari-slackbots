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

module "apinasaari_slackbot_meme_generator_assets_bucket" {
  source         = "./modules/slackbot-assets-bucket"
  gcp_project_id = var.gcp_project_id
  region         = local.region
  slackbot_name  = "meme-generator"
  assets_dir     = "${path.module}/../apinasaari-slackbots-meme-generator/assets"
}

module "apinasaari_slackbot_meme_generator_output_bucket" {
  source         = "./modules/bucket"
  gcp_project_id = var.gcp_project_id
  region         = local.region
  bucket_name    = "${var.gcp_project_id}-meme-generator-output"
}

module "apinasaari_slackbot_meme_generator" {
  source         = "./modules/interactive-slackbot"
  gcp_project_id = var.gcp_project_id
  region         = local.region
  slackbot_name  = "meme-generator"
  memory_mb      = 512
  build_dir      = "${path.module}/../apinasaari-slackbots-meme-generator"
  build_cmd      = "yarn build"
  entry_point    = "default"
  secrets = {
    slack-token          = var.meme_generator_slackbot_slack_token
    slack-signing-secret = var.meme_generator_slackbot_slack_signing_secret
  }
  environment_variables = {
    GCP_PROJECT_ID     = var.gcp_project_id
    ASSETS_BUCKET_NAME = module.apinasaari_slackbot_meme_generator_assets_bucket.name
    OUTPUT_BUCKET_NAME = module.apinasaari_slackbot_meme_generator_output_bucket.name
  }
}

module "apinasaari_slackbot_meme_generator_output_bucket_bindings" {
  source          = "./modules/bucket-bindings"
  gcp_project_id  = var.gcp_project_id
  region          = local.region
  bucket_name     = module.apinasaari_slackbot_meme_generator_output_bucket.name
  object_viewers  = ["allUsers"]
  object_creators = ["serviceAccount:${module.apinasaari_slackbot_meme_generator.email}"]
}
