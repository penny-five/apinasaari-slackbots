variable "gcp_project_id" {
  type        = string
  description = "Google Cloud Platform project id"
}

variable "region" {
  type        = string
  description = "Google Cloud Platform region"
}

variable "sources_bucket_name" {
  type        = string
  description = "Source code bucket name"
}

variable "slack_token_secret_id" {
  type        = string
  description = "Slack token secret id"
}

variable "slack_channel_id" {
  type        = string
  description = "Channel where to send messages"
}