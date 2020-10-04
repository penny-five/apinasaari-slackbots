import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { Storage } from '@google-cloud/storage';
import { WebClient } from '@slack/web-api';
import got from 'got';
import { DateTime } from 'luxon';

interface EnceCmsDataset {
  result: {
    data: {
      allDatoCmsMatch: {
        edges: {
          node: {
            id: string;
            title: string;
            startsAt: string;
          };
        }[];
      };
    };
  };
}

interface Match {
  id: string;
  title: string;
  startsAt: DateTime;
}

class MatchDataset {
  private readonly matches: Match[];

  constructor(matches: Match[]) {
    this.matches = matches;
  }

  getStartingMatches() {
    const now = DateTime.local();

    return this.matches.filter(
      match => match.startsAt > now && match.startsAt.diff(now, 'hours').hours <= 2
    );
  }

  getUpcomingMatches() {
    const now = DateTime.local();

    const startingMatches = this.getStartingMatches();

    return this.matches
      .filter(match => match.startsAt > now && match.startsAt.diff(now, 'hours').hours <= 24)
      .filter(match => startingMatches.find(({ id }) => id === match.id) == null);
  }
}

class EnceApi {
  private readonly CMS_DATASET_URL = 'https://www.ence.gg/page-data/matches/cs-go/page-data.json';

  async getMatchDataset() {
    const dataset: EnceCmsDataset = await got(this.CMS_DATASET_URL).json();

    const matches: Match[] = dataset.result.data.allDatoCmsMatch.edges.map(edge => ({
      id: edge.node.id,
      title: edge.node.title,
      startsAt: DateTime.fromISO(edge.node.startsAt)
    }));

    return new MatchDataset(matches);
  }
}

interface PersistedAppState {
  nofitiedUpcomingMatches: string[];
  notifiedStartingMatches: string[];
}

class AppState {
  private static readonly STATE_FILE_NAME = 'state.json';
  private static readonly storageClient = new Storage();

  private isModified = false;

  private constructor(
    private nofitiedUpcomingMatches: string[],
    private notifiedStartingMatches: string[]
  ) {}

  hasNotifiedOfUpcomingMatch(match: Match) {
    return this.nofitiedUpcomingMatches.includes(match.id);
  }

  hasNotifiedOStartingMatch(match: Match) {
    return this.notifiedStartingMatches.includes(match.id);
  }

  addNotifiedUppcomingMatch(match: Match) {
    this.nofitiedUpcomingMatches.push(match.id);
    this.isModified = true;
  }

  addNotifiedStartingMatch(match: Match) {
    this.notifiedStartingMatches.push(match.id);
    this.isModified = true;
  }

  static async load(bucketName: string): Promise<AppState> {
    const bucket = this.storageClient.bucket(bucketName);
    const stateFile = bucket.file(this.STATE_FILE_NAME);

    const [stateFileExists] = await stateFile.exists();

    if (stateFileExists) {
      const [rawState] = await stateFile.download();
      const persistedState = JSON.parse(rawState.toString()) as PersistedAppState;
      return new AppState(
        persistedState.nofitiedUpcomingMatches,
        persistedState.notifiedStartingMatches
      );
    } else {
      return new AppState([], []);
    }
  }

  static async save(bucketName: string, state: AppState) {
    if (!state.isModified) return;

    const bucket = this.storageClient.bucket(bucketName);
    const stateFile = bucket.file(this.STATE_FILE_NAME);

    const persistedState: PersistedAppState = {
      nofitiedUpcomingMatches: state.nofitiedUpcomingMatches,
      notifiedStartingMatches: state.notifiedStartingMatches
    };

    await stateFile.save(JSON.stringify(persistedState));
    console.log('State file updated', persistedState);
  }
}

class SlackClient {
  private webClient: WebClient;
  private channelId: string;

  constructor(params: { channelId: string; token: string }) {
    this.webClient = new WebClient(params.token);
    this.channelId = params.channelId;
  }

  async sendMessage(message: string) {
    await this.webClient.chat.postMessage({
      channel: this.channelId,
      text: message,
      username: 'ence pelaa',
      icon_emoji: 'ence'
    });

    console.log('Slack notification sent:', message);
  }
}

export const start = async () => {
  const secretManagerClient = new SecretManagerServiceClient();

  const [slackTokenSecretResponse] = await secretManagerClient.accessSecretVersion({
    name: `${process.env.SECRET_ID_SLACK_TOKEN}/versions/latest`
  });

  const slackClient = new SlackClient({
    channelId: process.env.SLACK_CHANNEL_ID,
    token: slackTokenSecretResponse.payload.data.toString()
  });

  const appState = await AppState.load(process.env.STATE_BUCKET_NAME);

  const api = new EnceApi();
  const matchDataset = await api.getMatchDataset();

  for (const match of matchDataset.getUpcomingMatches()) {
    if (!appState.hasNotifiedOfUpcomingMatch(match)) {
      const formattedDate = match.startsAt.setZone('Europe/Helsinki').toFormat(`d.L. 'klo' T`);
      const message = `*${match.title}* ${formattedDate}`;

      await slackClient.sendMessage(message);

      appState.addNotifiedUppcomingMatch(match);
    }
  }

  for (const match of matchDataset.getStartingMatches()) {
    if (!appState.hasNotifiedOStartingMatch(match)) {
      const formattedTime = match.startsAt.setZone('Europe/Helsinki').toFormat(`'klo' T`);
      const message = `*${match.title}* alkaa kohta (${formattedTime})`;

      await slackClient.sendMessage(message);

      appState.addNotifiedStartingMatch(match);
    }
  }

  await AppState.save(process.env.STATE_BUCKET_NAME, appState);
};
