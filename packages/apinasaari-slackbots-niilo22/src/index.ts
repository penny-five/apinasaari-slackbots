import logger from '@apinasaari-slackbots/common-logger';
import { getLatestSecretVersion } from '@apinasaari-slackbots/common-secrets';
import { YoutubeApi, YoutubeVideoStats } from '@apinasaari-slackbots/common-apis';
import { EventFunction } from '@google-cloud/functions-framework/build/src/functions';
import * as Slack from '@slack/web-api';
import { DateTime } from 'luxon';

const NIILO22_PLAYLIST_ID = 'UU7WlCq3wvnxgBEbVA9Dyo9w';

const computeVideoRank = (stats: YoutubeVideoStats) => {
  const multiplier = Math.max(stats.likeCount, stats.dislikeCount) / Math.min(stats.likeCount, stats.dislikeCount);
  return stats.viewCount * multiplier;
};

const handler: EventFunction = async () => {
  const slackToken = await getLatestSecretVersion(process.env.SECRET_ID_SLACK_TOKEN);

  const slackClient = new Slack.WebClient(slackToken);

  const youtubeApiKey = await getLatestSecretVersion(process.env.SECRET_ID_YOUTUBE_API_KEY);

  const youtube = new YoutubeApi(youtubeApiKey);

  const allVideos = await youtube.getPlaylistItems(NIILO22_PLAYLIST_ID);

  const weekAgo = DateTime.local().minus({ days: 7 });

  const newVideos = allVideos.filter(video => video.publishedAt > weekAgo);

  if (newVideos.length === 0) {
    logger.info('No new videos');
    return;
  }

  const stats = await youtube.batchGetVideoStatistics(newVideos.map(video => video.id));

  const videosIncludingStats = newVideos.map(video => ({
    video,
    stats: stats.find(({ id }) => id === video.id)
  }));

  const highlights = [...videosIncludingStats]
    .sort((a, b) => computeVideoRank(b.stats) - computeVideoRank(a.stats))
    .slice(0, 5);

  const blocks: Slack.KnownBlock[] = [];

  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `:koppalakkikostaja22: *Tärkeimmät Niilo-hetket viimeisen viikon ajalta* :koppalakkikostaja22:\n`
    }
  });

  blocks.push({
    type: 'divider'
  });

  highlights.forEach(({ video, stats }, index) => {
    let text = '';
    text += `${index + 1}. *<${video.url}|${video.title}>*`;
    text += ` | *${stats.viewCount}* katselua | `;
    text += `:thumbsup: *${stats.likeCount}* :thumbsdown: *${stats.dislikeCount}*`;

    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text
      }
    });
  });

  await slackClient.chat.postMessage({
    channel: process.env.SLACK_CHANNEL_ID,
    username: 'niilobot',
    icon_emoji: 'tatti22',
    unfurl_links: false,
    unfurl_media: false,
    text: null,
    blocks
  });
};

export default handler;
