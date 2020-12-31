# apinasaari-slackbots

<div align="center">
  <img height="40" src="https://raw.githubusercontent.com/gilbarbara/logos/master/logos/slack-icon.svg"/>
  <img height="40" src="https://raw.githubusercontent.com/gilbarbara/logos/master/logos/google-cloud-platform.svg"/>
  <img height="40" src="https://raw.githubusercontent.com/gilbarbara/logos/master/logos/typescript-icon.svg"/>
  <img height="40" src="https://raw.githubusercontent.com/gilbarbara/logos/master/logos/terraform.svg"/>
  <img height="40" src="https://raw.githubusercontent.com/gilbarbara/logos/master/logos/webpack.svg"/>
  <img height="40" src="https://raw.githubusercontent.com/gilbarbara/logos/master/logos/yarn.svg"/>
  <img height="40" src="https://raw.githubusercontent.com/gilbarbara/logos/master/logos/prettier.svg"/>
  <img height="40" src="https://raw.githubusercontent.com/gilbarbara/logos/master/logos/eslint.svg"/>
</div>

[![Status](https://github.com/penny-five/apinasaari-slackbots/workflows/deploy/badge.svg)](https://github.com/penny-five/apinasaari-slackbots/actions)

Collection of slackbots to `apinasaari` slack workspace.

All bots are deployed to the same Google Cloud Platform project.

# Getting started

## Prepare a Google Cloud Platform project

```sh
# Set correct project
gcloud config set project $GCP_PROJECT_ID

# Enable required services
gcloud services enable \
   iam.googleapis.com \
   cloudresourcemanager.googleapis.com \
   secretmanager.googleapis.com \
   cloudscheduler.googleapis.com \
   cloudbuild.googleapis.com \
   cloudfunctions.googleapis.com \
   youtube.googleapis.com

# Create App Engine application
gcloud app create --region=europe-west

# Create Terraform state bucket
gsutil mb -b on -l europe-west1 gs://$GCP_PROJECT_ID-tfstate/
```

## Create Terraform service account

```sh
# Set correct project
gcloud config set project $GCP_PROJECT_ID

# Create a service account
gcloud iam service-accounts create terraform --display-name="Terraform service account"

# Grant access to the state bucket for the service account
gsutil iam ch serviceAccount:terraform@$GCP_PROJECT_ID.iam.gserviceaccount.com:admin gs://$GCP_PROJECT_ID-tfstate/

# Grant required roles to the service account

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
   --member serviceAccount:terraform@$GCP_PROJECT_ID.iam.gserviceaccount.com \
   --role roles/iam.serviceAccountAdmin

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
   --member serviceAccount:terraform@$GCP_PROJECT_ID.iam.gserviceaccount.com \
   --role roles/iam.serviceAccountUser

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
   --member serviceAccount:terraform@$GCP_PROJECT_ID.iam.gserviceaccount.com \
   --role roles/storage.admin

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
   --member serviceAccount:terraform@$GCP_PROJECT_ID.iam.gserviceaccount.com \
   --role roles/resourcemanager.projectIamAdmin

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
   --member serviceAccount:terraform@$GCP_PROJECT_ID.iam.gserviceaccount.com \
   --role roles/cloudfunctions.admin

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
   --member serviceAccount:terraform@$GCP_PROJECT_ID.iam.gserviceaccount.com \
   --role roles/secretmanager.admin

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
   --member serviceAccount:terraform@$GCP_PROJECT_ID.iam.gserviceaccount.com \
   --role roles/pubsub.admin

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
   --member serviceAccount:terraform@$GCP_PROJECT_ID.iam.gserviceaccount.com \
   --role roles/cloudscheduler.admin

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
   --member serviceAccount:terraform@$GCP_PROJECT_ID.iam.gserviceaccount.com \
   --role roles/cloudfunctions.admin
```

## Deploy from GitHub

To enable deploy using GitHub actions following secrets are required:

### Shared

| Secret                 | Description                                           |
| :--------------------- | :---------------------------------------------------- |
| `GCP_PROJECT_ID`       | Google Cloud Platform project ID                      |
| `GCP_SA_KEY`           | Google Cloud Platform service account key file (json) |
| `TF_STATE_BUCKET_NAME` | Terraform state bucket name                           |
| `SLACK_TOKEN`          | Slack token                                           |

### Ence pelaa slackbot

| Secret                           | Description                                            |
| :------------------------------- | :----------------------------------------------------- |
| `ENCE_PELAA_SLACKBOT_CHANNEL_ID` | Slack channel id for Ence Pelaa slackbot notifications |

### Niilo22 slackbot

| Secret                        | Description                                         |
| :---------------------------- | :-------------------------------------------------- |
| `NIILO22_SLACKBOT_CHANNEL_ID` | Slack channel id for Niilo22 slackbot notifications |
| `YOUTUBE_API_KEY`             | YouTube API key                                     |

### Solita slackbot

| Secret                       | Description                                        |
| :--------------------------- | :------------------------------------------------- |
| `SOLITA_SLACKBOT_CHANNEL_ID` | Slack channel id for Solita slackbot notifications |

### Gofore slackbot

| Secret                       | Description                                        |
| :--------------------------- | :------------------------------------------------- |
| `GOFORE_SLACKBOT_CHANNEL_ID` | Slack channel id for Gofore slackbot notifications |

### Meme generator slackbot

| Secret                                         | Description          |
| :--------------------------------------------- | :------------------- |
| `MEME_GENERATOR_SLACKBOT_SLACK_TOKEN`          | Slack token          |
| `MEME_GENERATOR_SLACKBOT_SLACK_SIGNING_SECRET` | Slack signing secret |
