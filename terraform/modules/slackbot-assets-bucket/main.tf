provider "google-beta" {
  version = "3.39.0"
  project = var.gcp_project_id
  region  = var.region
}

module "assets_bucket" {
  source         = "../bucket"
  gcp_project_id = var.gcp_project_id
  region         = var.region
  bucket_name    = "${var.gcp_project_id}-${var.slackbot_name}-assets"
  public         = true
}

resource "google_storage_bucket_object" "asset" {
  for_each = fileset(var.assets_dir, "**")

  name   = basename(each.value)
  source = join("/", [var.assets_dir, each.value])
  bucket = module.assets_bucket.name
}
