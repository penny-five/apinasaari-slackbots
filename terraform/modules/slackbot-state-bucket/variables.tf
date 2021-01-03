variable "region" {
  type        = string
  description = "Google Cloud Platform region"
}

variable "slackbot_name" {
  type        = string
  description = "Slackbot name"
}

variable "slackbot_service_account_email" {
  type        = string
  description = "Slackbot service account. Is granted storage.admin access to the bucket"
}
