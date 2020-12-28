provider "google-beta" {
  version = "3.39.0"
  project = var.gcp_project_id
  region  = var.region
}

provider "null" {
  version = "2.1.2"
}

resource "google_pubsub_topic" "invoke" {
  provider = google-beta
  name     = "${var.slackbot_name}-slackbot-topic"
}

resource "google_cloud_scheduler_job" "invoke" {
  provider  = google-beta
  name      = "${var.slackbot_name}-slackbot-job"
  schedule  = var.schedule
  time_zone = "Europe/Helsinki"

  pubsub_target {
    topic_name = google_pubsub_topic.invoke.id
    data       = base64encode("ping")
  }
}

module "slackbot" {
  source = "../slackbot"

  gcp_project_id = var.gcp_project_id
  region         = var.region

  slackbot_name          = var.slackbot_name
  memory_mb              = var.memory_mb
  environment_variables  = var.environment_variables
  secrets                = var.secrets
  build_dir              = var.build_dir
  build_cmd              = var.build_cmd
  entry_point            = var.entry_point
  event_trigger_type     = "google.pubsub.topic.publish"
  event_trigger_resource = google_pubsub_topic.invoke.name
}
