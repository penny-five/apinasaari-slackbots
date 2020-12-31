module "slackbot" {
  source         = "../../modules/scheduled-slackbot"
  gcp_project_id = var.gcp_project_id
  region         = "europe-west1"
  slackbot_name  = "gofore"
  schedule       = "*/15 * * * *"
  build_dir      = "${path.module}/../../../apinasaari-slackbots-gofore"
  build_cmd      = "yarn build"
  secrets = {
    slack-token = var.slack_token
  }
  environment_variables = {
    SLACK_CHANNEL_ID = var.slack_channel_id
  }
}
