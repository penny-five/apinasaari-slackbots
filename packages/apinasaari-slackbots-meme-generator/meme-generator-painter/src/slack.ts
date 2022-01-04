import * as Slack from '@slack/web-api';

export const client = new Slack.WebClient(process.env.SLACK_TOKEN);
