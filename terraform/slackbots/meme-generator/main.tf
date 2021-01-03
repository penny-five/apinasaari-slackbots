locals {
  slackbot_name = "meme-generator"
}

data "google_project" "project" {
}

resource "google_service_account" "webhook" {
  account_id   = "${local.slackbot_name}-slack-webhook"
  display_name = "Meme generator slackbot Slack webhook service account"
}

resource "google_service_account" "painter" {
  account_id   = "${local.slackbot_name}-painter"
  display_name = "Meme generator slackbot service account"
}

module "assets_bucket" {
  source        = "../../modules/slackbot-assets-bucket"
  region        = "europe-west1"
  slackbot_name = local.slackbot_name
  assets_dir    = "${path.module}/../../../apinasaari-slackbots-meme-generator/assets"
}

module "output_bucket" {
  source          = "../../modules/bucket"
  region          = "europe-west1"
  bucket_name     = "${data.google_project.project.project_id}-${local.slackbot_name}-output"
  object_viewers  = ["allUsers"]
  object_creators = ["serviceAccount:${google_service_account.painter.email}"]
}

resource "google_pubsub_topic" "tasks" {
  name = "${local.slackbot_name}-tasks"
}

resource "google_pubsub_topic_iam_member" "publisher" {
  topic  = google_pubsub_topic.tasks.name
  role   = "roles/pubsub.publisher"
  member = "serviceAccount:${google_service_account.webhook.email}"
}

module "slack_webhook_function" {
  source                = "../../modules/cloud-function"
  region                = "europe-west1"
  name                  = "${local.slackbot_name}-slack-webhook"
  service_account_email = google_service_account.webhook.email
  memory_mb             = 512
  build_dir             = "${path.module}/../../../apinasaari-slackbots-meme-generator/meme-generator-slack-webhook"
  build_cmd             = "yarn build"
  http_trigger          = true
  environment_variables = {
    ASSETS_BUCKET_NAME = module.assets_bucket.name,
    TASKS_TOPIC_NAME   = google_pubsub_topic.tasks.name
    #
    # These would be stored in Secret Manager if accessing the Secret Manager
    # didn't take 2-3 seconds. Slack webhooks have timeout of 3000ms and that
    # timeout is reached if Secret Manager is used. Caching the values doesn't
    # help because the initial access would still take several seconds.
    #
    SLACK_TOKEN          = var.slack_token
    SLACK_SIGNING_SECRET = var.slack_signing_secret
  }
}

module "painter_function" {
  source                 = "../../modules/cloud-function"
  region                 = "europe-west1"
  name                   = "${local.slackbot_name}-painter"
  service_account_email  = google_service_account.painter.email
  memory_mb              = 512
  build_dir              = "${path.module}/../../../apinasaari-slackbots-meme-generator/meme-generator-painter"
  build_cmd              = "yarn build"
  event_trigger_type     = "google.pubsub.topic.publish"
  event_trigger_resource = google_pubsub_topic.tasks.name
  environment_variables = {
    ASSETS_BUCKET_NAME = module.assets_bucket.name
    OUTPUT_BUCKET_NAME = module.output_bucket.name
    # See the comment above in module.slack_webhook_function
    SLACK_TOKEN = var.slack_token
  }
}
