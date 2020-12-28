import { getLatestSecretVersion } from '@apinasaari-slackbots/common/src/secrets';
import * as Slack from '@slack/web-api';
import _ from 'lodash';

export const getSlackClient = _.memoize(async () => {
  const token = await getLatestSecretVersion(process.env.SECRET_ID_SLACK_TOKEN);
  const client = new Slack.WebClient(token);
  return client;
});
