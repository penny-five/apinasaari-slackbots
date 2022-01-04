module "slackbot" {
  source        = "../../modules/scheduled-slackbot"
  region        = "europe-west1"
  slackbot_name = "solita"
  schedule      = "*/15 * * * *"
  build_dir     = "${path.module}/../../../packages/apinasaari-slackbots-solita"
  build_cmd     = "yarn build"
  secrets = {
    slack-token = var.slack_token
  }
  environment_variables = {
    SLACK_CHANNEL_ID = var.slack_channel_id
  }
}
