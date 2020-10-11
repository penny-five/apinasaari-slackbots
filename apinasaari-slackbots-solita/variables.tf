variable "gcp_project_id" {
  type        = string
  description = "Google Cloud Platform project id"
}

variable "region" {
  type        = string
  description = "Google Cloud Platform region"
}

variable "slack_channel_id" {
  type        = string
  description = "Slack channel where to send messages"
}

variable "slack_token" {
  type        = string
  description = "Slack token"
}

