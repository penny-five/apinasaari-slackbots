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

variable "public" {
  type        = bool
  description = "Make bucket public"
  default     = false
}