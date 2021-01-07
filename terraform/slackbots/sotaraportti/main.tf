module "slackbot" {
  source        = "../../modules/scheduled-slackbot"
  region        = "europe-west1"
  slackbot_name = "sotaraportti"
  schedule      = "*/30 * * * *"
  build_dir     = "${path.module}/../../../apinasaari-slackbots-sotaraportti"
  build_cmd     = "yarn build"
  secrets = {
    slack-token = var.slack_token
  }
  environment_variables = {
    SLACK_CHANNEL_ID = var.slack_channel_id
  }
}
