import got from 'got';

export interface GamePassRecoListResponse<T> {
  Id: string;
  Name: string;
  Items: T[];
}

export interface GamePassRecoListItem {
  Id: string;
  itemType: string;
}

export interface GamePassProductImage {
  ImagePurpose: string;
  Uri: string;
}

export interface GamePassProductLocalizedProperty {
  DeveloperName: string;
  PublisherName: string;
  Images: GamePassProductImage[];
  ProductDescription: string;
  ProductTitle: string;
  ShortTitle: string;
  SortTitle: string;
  FriendlyTitle?: any;
  ShortDescription: string;
}

export interface GamePassProduct {
  ProductType: string;
  LocalizedProperties: GamePassProductLocalizedProperty[];
}

export interface GamePassProductDetailsResponse {
  Products: GamePassProduct[];
}

export class GamePassClient {
  private readonly recoClient: typeof got;

  private readonly catalogClient: typeof got;

  constructor() {
    this.recoClient = got.extend({
      prefixUrl: 'https://reco-public.rec.mp.microsoft.com/channels/Reco/V8.0'
    });

    this.catalogClient = got.extend({
      prefixUrl: 'https://displaycatalog.mp.microsoft.com/v7.0'
    });
  }

  async getNewGameIds(count = 50) {
    const response = await this.recoClient
      .get('Lists/Computed/New', {
        searchParams: {
          Market: 'fi',
          Language: 'fi',
          ItemTypes: 'Game',
          deviceFamily: 'Windows.Xbox',
          count: 30
        }
      })
      .json<GamePassRecoListResponse<GamePassRecoListItem>>();

    return response.Items.map(item => item.Id);
  }

  async batchGetProductDetails(ids: string[]) {
    const response = await this.catalogClient
      .get('products', {
        searchParams: {
          bigIds: ids.join(','),
          market: 'FI',
          languages: 'fi-fi'
        }
      })
      .json<GamePassProductDetailsResponse>();

    return response.Products;
  }
}
