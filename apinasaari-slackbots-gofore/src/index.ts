import { AmpparitApi } from '@apinasaari-slackbots/common/src/apis/ampparit';
import { logger } from '@apinasaari-slackbots/common/src/logger';
import { getLatestSecretVersion } from '@apinasaari-slackbots/common/src/secrets';
import { StateManager } from '@apinasaari-slackbots/common/src/state';
import { EventFunction } from '@google-cloud/functions-framework/build/src/functions';
import * as Slack from '@slack/web-api';
import { DateTime } from 'luxon';

interface AppState {
  lastNotifiedTimestamp: string;
}

const handler: EventFunction = async () => {
  const stateManager = new StateManager<AppState>(process.env.STATE_BUCKET_NAME);

  const state = await stateManager.loadState();

  let lastNotified: DateTime;

  if (state != null) {
    lastNotified = DateTime.fromISO(state.lastNotifiedTimestamp);
  } else {
    // Use sane default lastNotified timestamp when slackbot is run for the first time.
    lastNotified = DateTime.local().setZone('Europe/Helsinki').minus({ hours: 24 });
  }

  const ampparit = new AmpparitApi();

  const searchResults = await ampparit.search('gofore');

  const newResults = searchResults.filter(result => DateTime.fromMillis(result.timestamp * 1000) > lastNotified);

  if (newResults.length === 0) {
    logger.info('No new results');
    return;
  }

  const slackToken = await getLatestSecretVersion(process.env.SECRET_ID_SLACK_TOKEN);

  const slackClient = new Slack.WebClient(slackToken);

  for (const result of newResults) {
    const message = `${result.source}: <${result.link}|${result.title}>`;

    await slackClient.chat.postMessage({
      channel: process.env.SLACK_CHANNEL_ID,
      username: 'goforebot',
      icon_emoji: 'gofore',
      text: message,
      unfurl_links: false,
      unfurl_media: false,
      parse: 'none'
    });
  }

  const updatedLatestNotified = newResults.reduce((timestamp, result) => {
    return Math.max(timestamp, result.timestamp * 1000);
  }, null as number);

  await stateManager.saveState({
    lastNotifiedTimestamp: DateTime.fromMillis(updatedLatestNotified).toISO()
  });
};

export default handler;
