variable "gcp_project_id" {
  type        = string
  description = "Google Cloud Platform project id"
}

variable "slack_token" {
  type        = string
  description = "Slack token"
}

variable "youtube_api_key" {
  type        = string
  description = "YouTube API key"
}

variable "ence_pelaa_slackbot_channel_id" {
  type        = string
  description = "Slack channel id for Ence pelaa slackbot"
}

variable "niilo22_slackbot_channel_id" {
  type        = string
  description = "Slack channel id for Niilo22 slackbot"
}

variable "solita_slackbot_channel_id" {
  type        = string
  description = "Slack channel id for Solita slackbot"
}

variable "gofore_slackbot_channel_id" {
  type        = string
  description = "Slack channel id for Gofore slackbot"
}

variable "meme_generator_slackbot_slack_token" {
  type        = string
  description = "Meme Generator slackbot Slack token"
}

variable "meme_generator_slackbot_slack_signing_secret" {
  type        = string
  description = "Meme Generator slackbot Slack signing secret"
}

variable "sotaraportti_slackbot_channel_id" {
  type        = string
  description = "Slack channel id for Sotaraportti slackbot"
}
