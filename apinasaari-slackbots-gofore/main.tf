module "scheduled_slackbot" {
  source         = "../tf-modules/scheduled-slackbot"
  gcp_project_id = var.gcp_project_id
  region         = var.region
  slackbot_name  = "gofore"
  schedule       = "*/15 * * * *"
  build_dir      = path.module
  build_cmd      = "yarn build"
  secrets = {
    slack-token = var.slack_token
  }
  environment_variables = {
    GCP_PROJECT_ID   = var.gcp_project_id
    SLACK_CHANNEL_ID = var.slack_channel_id
  }
}
