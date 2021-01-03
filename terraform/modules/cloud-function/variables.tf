variable "region" {
  type        = string
  description = "Google Cloud Platform region"
}

variable "name" {
  type        = string
  description = "Function name (has to be unique within GCP project)"
}

variable "service_account_email" {
  type        = string
  description = "Service account to be used as function identity"
}

variable "memory_mb" {
  type        = number
  description = "Allocated memory in MB"
  default     = 128
}

variable "environment_variables" {
  type        = map(string)
  description = "Environment variables in (variable_name, value) map"
  default     = {}
}

variable "secrets" {
  type        = list(string)
  description = "Secret names in list. Pointers to secrets are added to env vars"
  default     = []
}

variable "build_dir" {
  type        = string
  description = "Build directory"
}

variable "build_cmd" {
  type        = string
  description = "Build command"
  default     = "yarn build"
}

variable "entry_point" {
  type        = string
  description = "Entry point function name"
  default     = "default"
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
