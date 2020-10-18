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

variable "schedule" {
  type        = string
  description = "Invokation schedule in cron format in Europe/Helsinki tz"
}

variable "environment_variables" {
  type        = map(string)
  description = "Environment variables"
  default     = {}
}

variable "secrets" {
  type        = map(string)
  description = "Secrets in (secret_name, value) map. Slackbot service account is granted access to all secrets."
  default     = {}
}

variable "build_dir" {
  type        = string
  description = "Build directory"
}

variable "build_cmd" {
  type        = string
  description = "Build command"
}
