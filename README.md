# apinasaari-slackbots

This repository contains a collection of Slack bots for Apinasaari workspace.

## Tech Stack

The tech stack in this project is designed to be lightweight and cheap to run. A sub 5 € per month VM in Hetzner Cloud is sufficient to run the entire stack.

The stack includes:

- n8n for workflow automation
- Node.js for custom services, when n8n is not enough
- Turborepo for monorepo management
- Caddy for reverse proxy and TLS termination
- Docker Compose for container orchestration
- Hetzner Cloud for virtual machines
- Debian as the base operating system
- Terraform CDK for infrastructure as code

## Workflows

n8n workflows are located in the `./workflows` directory. Workflows can be imported into n8n via the web interface.

Workflows include:

- `new-game-pass-games-to-slack`: Send a message to selected Slack channel when new Game Pass games become available.
- `new-free-epic-store-games-to-slack`: Send a message to selected Slack channel when new free Epic Store games become available.

## Installation

1. Clone the repository:

   ```bash
   git clone git@github.com:penny-five/apinasaari-slackbots.git
   ```

2. Install dependencies:

   ```bash
   cd apinasaari-slackbots && \
    pnpm install
   ```

3. Manually create a new project in Hetzner Cloud

4. Create a new admin SSH key. This will be used to manually access the VM but also
   to allow Terraform to access the VM for provisioning.

   ```bash
   ssh-keygen -t ed25519 -f ~/.ssh/apinasaari-slackbots-admin-key -C "admin@apinasaari-slackbots"
   ```

5. Copy the `env.template` file to `.env` in `./cdk` directory and fill in the required values:

   ```bash
    cp cdk/env.template cdk/.env
   ```

6. Run the Terraform configuration to set up the infrastructure:

   ```bash
   cd apinasaari-slackbots/cdk && \
     pnpm cdk:get && \
     pnpm cdk:deploy
   ```

7. Configure DNS to point to the VM.
8. Configure n8n by accessing the web interface at `http://<your-domain>:5678`.
9. Import n8n workflow files from the `./workflows` directory.

## Updating the Stack

1. Run Terraform to update the infrastructure:

   ```bash
   cd apinasaari-slackbots/cdk && pnpm cdk:deploy
   ```

   This will apply any changes to the infrastructure defined in the Terraform CDK and also pull the latest code from the repository.
