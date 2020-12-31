variable "gcp_project_id" {
  type        = string
  description = "Google Cloud Platform project id"
}

variable "slack_token" {
  type        = string
  description = "Slack token"
}

variable "slack_channel_id" {
  type        = string
  description = "Channel where to post messages"
}
