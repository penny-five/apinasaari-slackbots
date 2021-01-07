import { logger } from '@apinasaari-slackbots/common-logger';
import { getLatestSecretVersion } from '@apinasaari-slackbots/common-secrets';
import { StateManager } from '@apinasaari-slackbots/common-state-manager';
import { EventFunction } from '@google-cloud/functions-framework/build/src/functions';
import * as Slack from '@slack/web-api';
import { DateTime } from 'luxon';
import scrapeIt from 'scrape-it';

const TOTUUDEN_ETSIJAT_CHANNEL_ID = 'totuudenetsijat';

interface AppState {
  latestNotifiedSotaraporttiDate: string;
}

interface BitChuteVideo {
  id: string;
  title: string;
  date: DateTime;
}

class BitChuteScraper {
  async getChannelVideos(channelId: string) {
    const channelUrl = `https://www.bitchute.com/channel/${channelId}`;
    const scrapeResult = await scrapeIt<{ videos: BitChuteVideo[] }>(channelUrl, {
      videos: {
        listItem: '.channel-videos-list .channel-videos-container .channel-videos-text-container',
        data: {
          id: {
            selector: '.channel-videos-title a',
            attr: 'href',
            convert: (value: string) => value.split('/')[2]
          },
          title: '.channel-videos-title a',
          date: {
            selector: '.channel-videos-details.text-right span',
            convert: (value: string) => DateTime.fromFormat(value, 'LLL dd, yyyy')
          }
        }
      }
    });

    return scrapeResult.data;
  }
}

const handler: EventFunction = async () => {
  const stateManager = new StateManager<AppState>(process.env.STATE_BUCKET_NAME);

  const state = await stateManager.loadState();

  let latestNotifiedSotaraporttiDate: DateTime;

  if (state != null) {
    latestNotifiedSotaraporttiDate = DateTime.fromISO(state.latestNotifiedSotaraporttiDate);
  } else {
    // Use sane default latestNotified timestamp when slackbot is run for the first time.
    latestNotifiedSotaraporttiDate = DateTime.local().setZone('Europe/Helsinki').minus({ hours: 24 });
  }

  const scraper = new BitChuteScraper();

  const { videos } = await scraper.getChannelVideos(TOTUUDEN_ETSIJAT_CHANNEL_ID);

  const sotaraporttiVideos = videos.filter(video => video.title.toLowerCase().startsWith('sotaraportti'));

  if (sotaraporttiVideos.length === 0) {
    logger.error('Something went wrong');
    return;
  }

  const newSotaraporttiVideos = sotaraporttiVideos.filter(video => video.date > latestNotifiedSotaraporttiDate);

  if (newSotaraporttiVideos.length === 0) {
    logger.info('No new videos');
    return;
  }

  const slackToken = await getLatestSecretVersion(process.env.SECRET_ID_SLACK_TOKEN);

  const slackClient = new Slack.WebClient(slackToken);

  for (const video of newSotaraporttiVideos) {
    const message = `https://www.bitchute.com/video/${video.id}/`;

    await slackClient.chat.postMessage({
      channel: process.env.SLACK_CHANNEL_ID,
      username: 'sotarapsabot',
      icon_emoji: 'sotarapsabot',
      text: message,
      unfurl_links: true,
      unfurl_media: true,
      parse: 'full'
    });

    logger.info(`Sent message: ${message}`);
  }

  await stateManager.saveState({
    latestNotifiedSotaraporttiDate: newSotaraporttiVideos[0].date.toISO()
  });
};

export default handler;
