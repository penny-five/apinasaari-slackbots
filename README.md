# apinasaari-slackbots

Collection of slackbots to `apinasaari` slack workspace.

All bots are deployed to the same Google Cloud Platform project.

# Getting started

## Prepare Google Cloud Platform project

```sh
# Enable required services
gcloud services enable \
   iam.googleapis.com \
   cloudresourcemanager.googleapis.com \
   secretmanager.googleapis.com \
   cloudscheduler.googleapis.com \
   cloudbuild.googleapis.com

# Create App Engine application
gcloud app create --project=$GCP_PROJECT_ID --region=europe-west


# Create Terraform state bucket
gsutil mb -b on -l europe-west1 -p $GCP_PROJECT_ID gs://$GCP_PROJECT_ID-tfstate/
```

## Create Terraform service account

```sh
# Create a service account
gcloud iam service-accounts create terraform --display-name="Terraform service account"

# Grant access to the state bucket for the service account
gsutil iam ch serviceAccount:terraform@$GCP_PROJECT_ID.iam.gserviceaccount.com:admin gs://$GCP_PROJECT_ID-tfstate/

# Grant required roles to the service account

# gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
#    --member serviceAccount:terraform@$GCP_PROJECT_ID.iam.gserviceaccount.com \
#    --role roles/storage.admin

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
   --member serviceAccount:terraform@$GCP_PROJECT_ID.iam.gserviceaccount.com \
   --role roles/iam.serviceAccountAdmin

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
   --member serviceAccount:terraform@$GCP_PROJECT_ID.iam.gserviceaccount.com \
   --role roles/resourcemanager.projectIamAdmin

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
   --member serviceAccount:terraform@$GCP_PROJECT_ID.iam.gserviceaccount.com \
   --role roles/cloudfunctions.admin

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
   --member serviceAccount:terraform@$GCP_PROJECT_ID.iam.gserviceaccount.com \
   --role roles/iam.serviceAccountUser

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
   --member serviceAccount:terraform@$GCP_PROJECT_ID.iam.gserviceaccount.com \
   --role roles/secretmanager.admin

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
   --member serviceAccount:terraform@$GCP_PROJECT_ID.iam.gserviceaccount.com \
   --role roles/pubsub.editor

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
   --member serviceAccount:terraform@$GCP_PROJECT_ID.iam.gserviceaccount.com \
   --role roles/cloudscheduler.admin

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
   --member serviceAccount:terraform@$GCP_PROJECT_ID.iam.gserviceaccount.com \
   --role roles/cloudfunctions.admin

```
