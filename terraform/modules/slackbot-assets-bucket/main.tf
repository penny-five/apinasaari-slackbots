data "google_project" "project" {
}

module "assets_bucket" {
  source         = "../bucket"
  region         = var.region
  bucket_name    = "${data.google_project.project.project_id}-${var.slackbot_name}-assets"
  object_viewers = ["allUsers"]
}

resource "google_storage_bucket_object" "asset" {
  for_each = fileset(var.assets_dir, "**")
  name     = basename(each.value)
  source   = join("/", [var.assets_dir, each.value])
  bucket   = module.assets_bucket.name
}
