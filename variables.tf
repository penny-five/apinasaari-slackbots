variable "gcp_project_id" {
  type        = string
  description = "Google Cloud Platform project id"
}

variable "slack_token" {
  type        = string
  description = "Slack token for slackbots"
}

variable "youtube_api_key" {
  type = string
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
