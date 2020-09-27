import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { WebClient, KnownBlock } from '@slack/web-api';
import got, { Got } from 'got';
import { DateTime } from 'luxon';

const NIILO22_PLAYLIST_ID = 'UU7WlCq3wvnxgBEbVA9Dyo9w';

interface YoutubeArrayResponse<T> {
  items: T[];
}

interface YoutubePlaylistItemListResponseItem {
  id: string;
  kind: string;
  snippet?: {
    channelId: string;
    publishedAt: string;
    title: string;
    resourceId: {
      kind: string;
      videoId: string;
    };
  };
}

interface YoutubeGetVideosResponseItem {
  kind: string;
  id: string;
  statistics?: {
    viewCount: string;
    likeCount: string;
    dislikeCount: string;
    favoriteCount: string;
    commentCount: string;
  };
}

interface YoutubePlaylistVideo {
  id: string;
  title: string;
  url: string;
  publishedAt: DateTime;
}

interface YoutubeVideoStats {
  id: string;
  viewCount: number;
  likeCount: number;
  dislikeCount: number;
}

class YoutubeApi {
  private readonly YOUTUBE_API_V3_BASE_URL = 'https://www.googleapis.com/youtube/v3';

  private readonly instance: Got;

  constructor(apiKey: string) {
    this.instance = got.extend({
      prefixUrl: this.YOUTUBE_API_V3_BASE_URL,
      searchParams: {
        key: apiKey
      }
    });
  }

  async getPlaylistItems(playlistId: string): Promise<YoutubePlaylistVideo[]> {
    const response = await this.instance
      .get(`playlistItems`, {
        searchParams: {
          part: 'snippet',
          playlistId,
          maxResults: 50
        }
      })
      .json<YoutubeArrayResponse<YoutubePlaylistItemListResponseItem>>();

    return response.items.map(item => ({
      id: item.snippet.resourceId.videoId,
      url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
      publishedAt: DateTime.fromISO(item.snippet.publishedAt),
      title: item.snippet.title
    }));
  }

  async getVideoStatistics(videoIds: string[]): Promise<YoutubeVideoStats[]> {
    const response = await this.instance
      .get('videos', {
        searchParams: {
          part: 'statistics',
          id: videoIds.join(','),
          maxResults: videoIds.length
        }
      })
      .json<YoutubeArrayResponse<YoutubeGetVideosResponseItem>>();

    return response.items.map(item => ({
      id: item.id,
      viewCount: parseInt(item.statistics.viewCount, 10),
      likeCount: parseInt(item.statistics.likeCount, 10),
      dislikeCount: parseInt(item.statistics.dislikeCount, 10)
    }));
  }
}

const computeVideoRank = (stats: YoutubeVideoStats) => {
  const multiplier =
    Math.max(stats.likeCount, stats.dislikeCount) / Math.min(stats.likeCount, stats.dislikeCount);
  return stats.viewCount * multiplier;
};

export const start = async () => {
  const secretManagerClient = new SecretManagerServiceClient();

  const [slackTokenSecretResponse] = await secretManagerClient.accessSecretVersion({
    name: `${process.env.SLACK_TOKEN_SECRET_ID}/versions/latest`
  });

  const slackClient = new WebClient(slackTokenSecretResponse.payload.data.toString());

  const [youtubeApiKeySecretResponse] = await secretManagerClient.accessSecretVersion({
    name: `${process.env.YOUTUBE_API_KEY_SECRET_ID}/versions/latest`
  });

  const youtubeApi = new YoutubeApi(youtubeApiKeySecretResponse.payload.data.toString());

  const allVideos = await youtubeApi.getPlaylistItems(NIILO22_PLAYLIST_ID);

  const weekAgo = DateTime.local().minus({ days: 7 });

  const newVideos = allVideos.filter(video => video.publishedAt > weekAgo);

  if (newVideos.length === 0) {
    console.log('No new videos');
    return;
  }

  const stats = await youtubeApi.getVideoStatistics(newVideos.map(video => video.id));

  const videosIncludingStats = newVideos.map(video => ({
    video,
    stats: stats.find(({ id }) => id === video.id)
  }));

  const highlights = [...videosIncludingStats]
    .sort(({ stats }) => computeVideoRank(stats))
    .slice(0, 5);

  const blocks: KnownBlock[] = [];

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
    text += `${index + 1}. <${video.url}|${video.title}> `;
    text += `(${stats.viewCount} katselua, `;
    text += `${stats.likeCount} yläpeukkua, `;
    text += `${stats.dislikeCount} alapeukkua)`;

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
