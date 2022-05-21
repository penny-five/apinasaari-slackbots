import got, { Got } from 'got';

interface AmpparitPaginatedResponse<T> {
  data: {
    results: {
      items: T[];
    };
  };
}

export interface AmpparitSearchResult {
  id: string;
  timestamp: number;
  title: string;
  link: string;
  source: string;
  category: string;
}

export class AmpparitApi {
  private static readonly API_BASE_URL = 'http://www.ampparit.com/api';

  private readonly httpClient: Got;

  constructor() {
    this.httpClient = got.extend({
      prefixUrl: AmpparitApi.API_BASE_URL
    });
  }

  async search(searchphrase: string) {
    const response = await this.httpClient
      .get('search', {
        searchParams: {
          q: searchphrase,
          // Cannot be set below 25 or Ampparit API will throw HTTP 403 (Forbidden)
          limit: 30
        }
      })
      .json<AmpparitPaginatedResponse<AmpparitSearchResult>>();

    return response.data.results.items;
  }
}
