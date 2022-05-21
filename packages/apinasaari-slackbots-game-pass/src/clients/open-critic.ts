import got from 'got';

interface OpenCriticSearchResult {
  id: number;
  dist: number;
  name: string;
  relation: 'game' | 'critic';
}

interface OpenCriticGame {
  id: string;
  name: string;
  firstReleaseDate: string;
  medianScore: number;
  topCriticScore: number;
  numReviews: number;
  numTopCriticReviews: number;
  percentile: number;
  percentRecommended: number;
}

export class OpenCriticClient {
  private client: typeof got;

  constructor() {
    this.client = got.extend({
      prefixUrl: 'https://api.opencritic.com',
      /**
       * Add few headers. This should fool the API into thinking we're a browser.
       */
      headers: {
        authority: 'api.opencritic.com',
        referer: 'https://api.opencritic.com/',
        'user-agent': [
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'AppleWebKit/537.36 (KHTML, like Gecko)',
          'Chrome/80.0.3987.132',
          'Safari/537.36'
        ].join(' ')
      }
    });
  }

  async search(criteria: string) {
    const response = await this.client('api/meta/search', {
      searchParams: {
        criteria
      }
    }).json<OpenCriticSearchResult[]>();

    return response;
  }

  async getGame(id: number) {
    const response = await this.client(`api/game/${id}`).json<OpenCriticGame>();
    return response;
  }
}
