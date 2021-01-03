resource "google_service_account" "slackbot" {
  account_id   = var.slackbot_name
  display_name = "${var.slackbot_name} slackbot service account"
}

module "secret" {
  source    = "../secret"
  for_each  = var.secrets
  id        = "${var.slackbot_name}-slackbot-${each.key}"
  value     = each.value
  region    = var.region
  accessors = ["serviceAccount:${google_service_account.slackbot.email}"]
}

module "state_bucket" {
  source                         = "../slackbot-state-bucket"
  region                         = var.region
  slackbot_name                  = var.slackbot_name
  slackbot_service_account_email = google_service_account.slackbot.email
}

resource "google_pubsub_topic" "invoke" {
  name = "${var.slackbot_name}-slackbot-topic"
}

resource "google_cloud_scheduler_job" "invoke" {
  name      = "${var.slackbot_name}-slackbot-job"
  schedule  = var.schedule
  time_zone = "Europe/Helsinki"
  pubsub_target {
    topic_name = google_pubsub_topic.invoke.id
    data       = base64encode("ping")
  }
}

module "cloud_function" {
  source                 = "../cloud-function"
  name                   = var.slackbot_name
  region                 = var.region
  service_account_email  = google_service_account.slackbot.email
  memory_mb              = var.memory_mb
  build_dir              = var.build_dir
  build_cmd              = var.build_cmd
  entry_point            = var.entry_point
  event_trigger_type     = "google.pubsub.topic.publish"
  event_trigger_resource = google_pubsub_topic.invoke.name
  secrets                = keys(var.secrets)
  environment_variables = merge(
    var.environment_variables,
    { STATE_BUCKET_NAME = module.state_bucket.name }
  )
}
