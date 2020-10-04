variable "region" {
  type        = string
  description = "Google Cloud Platform region"
}

variable "id" {
  type        = string
  description = "Secret id"
}

variable "value" {
  type        = string
  description = "Secret value"
}

variable "accessor_member" {
  type        = string
  description = "Secret accessor member name"
}

