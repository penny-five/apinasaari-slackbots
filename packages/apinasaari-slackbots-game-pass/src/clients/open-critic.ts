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
  averageScore: number;
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
      prefixUrl: 'https://api.opencritic.com/api'
    });
  }

  async search(criteria: string) {
    const response = await this.client('meta/search', {
      searchParams: {
        criteria
      }
    }).json<OpenCriticSearchResult[]>();

    return response;
  }

  async getGame(id: number) {
    const response = await this.client(`game/${id}`).json<OpenCriticGame>();
    return response;
  }
}
