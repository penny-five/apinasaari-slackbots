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
  default     = {}
}

variable "secrets" {
  type        = map(string)
  description = "Secrets in (secret_name, value) map. Slackbot service account is granted access to all secrets."
  default     = {}
}

variable "entry_point" {
  type        = string
  description = "Entry point function name"
  default     = "start"
}

variable "build_dir" {
  type        = string
  description = "Build directory"
}

variable "build_cmd" {
  type        = string
  description = "Build command"
}

variable "event_trigger_type" {
  type        = string
  description = "Event trigger type"
  default     = null
}

variable "event_trigger_resource" {
  type        = string
  description = "Event trigger resource"
  default     = null
}

variable "http_trigger" {
  type        = bool
  description = "Enable if slackbot is striggered through http endpoint"
  default     = null
}
