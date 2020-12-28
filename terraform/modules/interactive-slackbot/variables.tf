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

variable "memory_mb" {
  type        = number
  description = "Allocated memory in MB"
  default     = 128
}

variable "environment_variables" {
  type        = map(string)
  description = "Environment variables"
  default     = null
}

variable "secrets" {
  type        = map(string)
  description = "Secrets in (secret_name, value) map. Slackbot service account is granted access to all secrets."
  default     = null
}

variable "build_dir" {
  type        = string
  description = "Build directory"
}

variable "build_cmd" {
  type        = string
  description = "Build command"
}

variable "entry_point" {
  type        = string
  description = "Entry point function name"
  default     = "start"
}
