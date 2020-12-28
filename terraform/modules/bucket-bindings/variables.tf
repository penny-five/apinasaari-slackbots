variable "gcp_project_id" {
  type        = string
  description = "Google Cloud Platform project id"
}

variable "region" {
  type        = string
  description = "Google Cloud Platform region"
}

variable "bucket_name" {
  type        = string
  description = "Name of the bucket"
}

variable "object_viewers" {
  type        = list(string)
  description = "List of users with objectViewer roles"
  default     = []
}

variable "object_creators" {
  type        = list(string)
  description = "List of users with objectViewer roles"
  default     = []
}
