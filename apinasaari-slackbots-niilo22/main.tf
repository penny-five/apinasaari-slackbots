module "scheduled_slackbot" {
  source         = "../tf-modules/scheduled-slackbot"
  gcp_project_id = var.gcp_project_id
  region         = var.region
  slackbot_name  = "niilo22"
  schedule       = "0 20 * * SUN"
  build_dir      = path.module
  build_cmd      = "yarn build"
  secrets = {
    youtube-api-key = var.youtube_api_key
    slack-token     = var.slack_token
  }
  environment_variables = {
    GCP_PROJECT_ID   = var.gcp_project_id
    SLACK_CHANNEL_ID = var.slack_channel_id
  }
}
