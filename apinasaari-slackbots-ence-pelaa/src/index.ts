import { getLatestSecretVersion } from '@apinasaari-slackbots/common/src/secrets';
import { StateManager } from '@apinasaari-slackbots/common/src/state';
import * as Slack from '@slack/web-api';
import got from 'got';
import { DateTime } from 'luxon';

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

    return this.matches.filter(({ startsAt }) => startsAt > now && startsAt.diff(now, 'hours').hours <= 2);
  }

  getUpcomingMatches() {
    const now = DateTime.local();

    const startingMatches = this.getStartingMatches();

    return this.matches
      .filter(match => match.startsAt > now && match.startsAt.diff(now, 'hours').hours <= 24)
      .filter(match => startingMatches.find(({ id }) => id === match.id) == null);
  }
}

interface EnceCmsMatchResponse {
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

class EnceCms {
  private readonly CMS_MATCH_DATA_URL = 'https://www.ence.gg/page-data/matches/cs-go/page-data.json';

  async getMatchDataset() {
    const response: EnceCmsMatchResponse = await got(this.CMS_MATCH_DATA_URL).json();

    const matches: Match[] = response.result.data.allDatoCmsMatch.edges.map(edge => ({
      id: edge.node.id,
      title: edge.node.title,
      startsAt: DateTime.fromISO(edge.node.startsAt)
    }));

    return new MatchDataset(matches);
  }
}

interface AppState {
  nofitiedUpcomingMatches: string[];
  notifiedStartingMatches: string[];
}

export const start = async () => {
  const stateManager = new StateManager<AppState>(process.env.STATE_BUCKET_NAME);

  let state = await stateManager.loadState();

  if (state == null) {
    state = {
      nofitiedUpcomingMatches: [],
      notifiedStartingMatches: []
    };
  }

  const cms = new EnceCms();
  const matchDataset = await cms.getMatchDataset();

  const slackToken = await getLatestSecretVersion(process.env.SECRET_ID_SLACK_TOKEN);
  const slackClient = new Slack.WebClient(slackToken);

  for (const match of matchDataset.getUpcomingMatches()) {
    if (!state.nofitiedUpcomingMatches.includes(match.id)) {
      const formattedDate = match.startsAt.setZone('Europe/Helsinki').toFormat(`d.L. 'klo' T`);
      const message = `*${match.title}* ${formattedDate}`;

      await slackClient.chat.postMessage({
        channel: process.env.SLACK_CHANNEL_ID,
        text: message,
        username: 'ence pelaa',
        icon_emoji: 'ence'
      });

      state.nofitiedUpcomingMatches.push(match.id);
    }
  }

  for (const match of matchDataset.getStartingMatches()) {
    if (!state.notifiedStartingMatches.includes(match.id)) {
      const formattedTime = match.startsAt.setZone('Europe/Helsinki').toFormat(`'klo' T`);
      const message = `*${match.title}* alkaa kohta (${formattedTime})`;

      await slackClient.chat.postMessage({
        channel: process.env.SLACK_CHANNEL_ID,
        text: message,
        username: 'ence pelaa',
        icon_emoji: 'ence'
      });

      state.notifiedStartingMatches.push(match.id);
    }
  }

  await stateManager.saveState(state);
};
