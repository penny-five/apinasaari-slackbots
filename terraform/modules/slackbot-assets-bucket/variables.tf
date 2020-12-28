variable "gcp_project_id" {
  type        = string
  description = "Google Cloud Platform project id"
}

variable "region" {
  type        = string
  description = "Google Cloud Platform region"
}

variable "slackbot_name" {
  type        = string
  description = "Unique slackbot name"
}

variable "assets_dir" {
  type        = string
  description = "Assets folder path"
}
