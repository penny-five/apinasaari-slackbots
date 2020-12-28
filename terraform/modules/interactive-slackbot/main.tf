provider "google-beta" {
  version = "3.39.0"
  project = var.gcp_project_id
  region  = var.region
}

module "slackbot" {
  source = "../slackbot"

  gcp_project_id = var.gcp_project_id
  region         = var.region

  slackbot_name         = var.slackbot_name
  memory_mb             = var.memory_mb
  environment_variables = var.environment_variables
  secrets               = var.secrets
  build_dir             = var.build_dir
  build_cmd             = var.build_cmd
  entry_point           = var.entry_point
  http_trigger          = true
}
