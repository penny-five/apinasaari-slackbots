data "google_project" "project" {
}

resource "null_resource" "build" {
  provisioner "local-exec" {
    command     = var.build_cmd
    working_dir = var.build_dir
  }
  triggers = {
    always_run = timestamp()
  }
}

resource "null_resource" "zip_files" {
  provisioner "local-exec" {
    command     = <<EOT
      jq '.dependencies|=with_entries(select(.key|test("@apinasaari-slackbots/.*")|not))' package.json > dist/package.json
      zip --junk-paths dist/app.zip dist/*
    EOT
    working_dir = var.build_dir
  }
  depends_on = [
    null_resource.build
  ]
  triggers = {
    always_run = timestamp()
  }
}

resource "google_storage_bucket" "sources" {
  name                        = "${data.google_project.project.project_id}-${var.name}-sources"
  location                    = var.region
  uniform_bucket_level_access = true
}

resource "google_storage_bucket_object" "archive" {
  name   = "${var.name}-${uuid()}"
  source = "${var.build_dir}/dist/app.zip"
  bucket = google_storage_bucket.sources.name
  depends_on = [
    null_resource.zip_files
  ]
}

resource "google_cloudfunctions_function" "function" {
  name                  = var.name
  description           = var.name
  runtime               = "nodejs12"
  available_memory_mb   = var.memory_mb
  service_account_email = var.service_account_email
  source_archive_bucket = google_storage_bucket.sources.name
  source_archive_object = google_storage_bucket_object.archive.name
  entry_point           = var.entry_point
  trigger_http          = var.http_trigger
  dynamic "event_trigger" {
    for_each = var.event_trigger_type == null ? [] : [1]
    content {
      event_type = var.event_trigger_type
      resource   = var.event_trigger_resource
    }
  }
  environment_variables = merge(
    { GCP_PROJECT_ID = data.google_project.project.project_id },
    var.environment_variables,
    { for secret_name in var.secrets :
      format("SECRET_ID_%s", replace(upper(secret_name), "-", "_")) =>
      format("projects/%s/secrets/%s-slackbot-%s", data.google_project.project.project_id, var.name, secret_name)
    }
  )
}

resource "google_cloudfunctions_function_iam_member" "service_account_invoker" {
  cloud_function = google_cloudfunctions_function.function.name
  role           = "roles/cloudfunctions.invoker"
  member         = "serviceAccount:${var.service_account_email}"
}

resource "google_cloudfunctions_function_iam_member" "all_users_invoker" {
  count          = var.http_trigger == true ? 1 : 0
  cloud_function = google_cloudfunctions_function.function.name
  role           = "roles/cloudfunctions.invoker"
  member         = "allUsers"
}
