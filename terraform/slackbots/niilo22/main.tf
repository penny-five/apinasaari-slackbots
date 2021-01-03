module "slackbot" {
  source        = "../../modules/scheduled-slackbot"
  region        = "europe-west1"
  slackbot_name = "niilo22"
  schedule      = "0 20 * * SUN"
  build_dir     = "${path.module}/../../../apinasaari-slackbots-niilo22"
  build_cmd     = "yarn build"
  secrets = {
    youtube-api-key = var.youtube_api_key
    slack-token     = var.slack_token
  }
  environment_variables = {
    SLACK_CHANNEL_ID = var.slack_channel_id
  }
}
