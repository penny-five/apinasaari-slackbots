import got, { Got } from 'got';
import { DateTime } from 'luxon';

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

export interface YoutubePlaylistVideo {
  id: string;
  title: string;
  url: string;
  publishedAt: DateTime;
}

export interface YoutubeVideoStats {
  id: string;
  viewCount: number;
  likeCount: number;
  dislikeCount: number;
}

export class YoutubeApi {
  private readonly YOUTUBE_API_V3_BASE_URL = 'https://www.googleapis.com/youtube/v3';

  private readonly httpClient: Got;

  constructor(apiKey: string) {
    this.httpClient = got.extend({
      prefixUrl: this.YOUTUBE_API_V3_BASE_URL,
      searchParams: {
        key: apiKey
      }
    });
  }

  async getPlaylistItems(playlistId: string): Promise<YoutubePlaylistVideo[]> {
    const response = await this.httpClient
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

  async batchGetVideoStatistics(videoIds: string[]): Promise<YoutubeVideoStats[]> {
    const response = await this.httpClient
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
