# apinasaari-slackbots

<div align="center">
  <img height="40" src="https://cdn.svgporn.com/logos/slack-icon.svg"/>
  <img height="40" src="https://cdn.svgporn.com/logos/google-cloud.svg"/>
  <img height="40" src="https://cdn.svgporn.com/logos/google-cloud-functions.svg"/>
  <img height="40" src="https://cdn.svgporn.com/logos/typescript-icon.svg"/>
  <img height="40" src="https://cdn.svgporn.com/logos/terraform-icon.svg"/>
  <img height="40" src="https://cdn.svgporn.com/logos/lerna.svg"/>
</div>

<br>

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

## Secrets

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

### Solita slackbot

| Secret                       | Description                                        |
| :--------------------------- | :------------------------------------------------- |
| `SOLITA_SLACKBOT_CHANNEL_ID` | Slack channel id for Solita slackbot notifications |

### Gofore slackbot

| Secret                       | Description                                        |
| :--------------------------- | :------------------------------------------------- |
| `GOFORE_SLACKBOT_CHANNEL_ID` | Slack channel id for Gofore slackbot notifications |

### Game Pass slackbot

| Secret                          | Description                                           |
| :------------------------------ | :---------------------------------------------------- |
| `GAME_PASS_SLACKBOT_CHANNEL_ID` | Slack channel id for Game Pass slackbot notifications |

### Meme generator slackbot

| Secret                                         | Description          |
| :--------------------------------------------- | :------------------- |
| `MEME_GENERATOR_SLACKBOT_SLACK_TOKEN`          | Slack token          |
| `MEME_GENERATOR_SLACKBOT_SLACK_SIGNING_SECRET` | Slack signing secret |

## Testing

All slackbots use [Functions Framework for Node.js](https://github.com/GoogleCloudPlatform/functions-framework-nodejs) and can be started locally with `yarn dev`.

For local testing of functions that use Pub/Sub see the instructions [here](https://github.com/GoogleCloudPlatform/functions-framework-nodejs/blob/master/docs/events.md).
