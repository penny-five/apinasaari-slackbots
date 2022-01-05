import got from 'got';

export type GamePassCatalogResponse = [{ siglId: string; title: string }, ...{ id: string }[]];

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
  private readonly catalogClient: typeof got;

  private readonly displayCatalogClient: typeof got;

  private static readonly CATALOG_ID = 'f13cf6b4-57e6-4459-89df-6aec18cf0538';

  constructor() {
    this.catalogClient = got.extend({
      prefixUrl: 'https://catalog.gamepass.com'
    });

    this.displayCatalogClient = got.extend({
      prefixUrl: 'https://displaycatalog.mp.microsoft.com/v7.0'
    });
  }

  async getLatestGames(count = 50) {
    const response = await this.catalogClient
      .get('sigls/v2', {
        searchParams: {
          id: GamePassClient.CATALOG_ID,
          language: 'fi-fi',
          market: 'FI',
          count
        }
      })
      .json<GamePassCatalogResponse>();

    const [_category, ...products] = response;

    return products.map(product => product.id);
  }

  async batchGetProductDetails(ids: string[]) {
    const response = await this.displayCatalogClient
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
