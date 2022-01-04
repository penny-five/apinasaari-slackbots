module "slackbot" {
  source        = "../../modules/scheduled-slackbot"
  region        = "europe-west1"
  slackbot_name = "game-pass"
  schedule      = "0 * * * *"
  build_dir     = "${path.module}/../../../packages/apinasaari-slackbots-game-pass"
  build_cmd     = "yarn build"
  secrets = {
    slack-token = var.slack_token
  }
  environment_variables = {
    SLACK_CHANNEL_ID = var.slack_channel_id
  }
}
