# Meme generator slackbot

![screenshot](screenshot.png)

Generates image memes on demand.

## Setup

### Step 1: Slack

- Create a new Slack app
- Generate signing secret ("Settings" -> "Basic Information")
- Setup OAuth permissions ("Features" -> "OAuth & Permissions")
  - Add `chat:write` and `chat:write.public` scopes
  - Generate access token
- Install app to workspace

### Step 2: Github

- Add the signing secret and the access token to Github secrets
- Deploy with GitHub actions

### Step 3: Slack
- Enable interactivity ("Features" -> "Interactivity & Shortcuts").
  - Set "Request URL" to `<CLOUD_FUNCTION_PUBLIC_URL>/interactions`.
- Create a new slash command ("Features" -> "Slash Commands")
  - Set "Command" to e.g. `/meme`
  - Set "Request URL" to `<CLOUD_FUNCTION_PUBLIC_URL>/slash-command`.
