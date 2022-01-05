import logger from '@apinasaari-slackbots/common-logger';
import { getLatestSecretVersion } from '@apinasaari-slackbots/common-secrets';
import StateManager from '@apinasaari-slackbots/common-state-manager';
import { EventFunction } from '@google-cloud/functions-framework/build/src/functions';
import * as Slack from '@slack/web-api';
import { truncate } from 'lodash';

import { GamePassClient } from './clients/game-pass';
import { OpenCriticClient } from './clients/open-critic';

interface AppState {
  notifiedGameIds: string[];
}

const handler: EventFunction = async () => {
  const stateManager = new StateManager<AppState>(process.env.STATE_BUCKET_NAME);

  let state = await stateManager.loadState();

  const isInitialLoad = state == null;

  if (state == null) {
    state = {
      notifiedGameIds: []
    };
  }

  const gamePassClient = new GamePassClient();

  const openCriticClient = new OpenCriticClient();

  const ids = await gamePassClient.getLatestGames();

  if (isInitialLoad) {
    await stateManager.saveState({
      notifiedGameIds: [...new Set(ids)]
    });
    return;
  }

  const newIds = ids.filter(id => !state!.notifiedGameIds.includes(id));

  if (newIds.length === 0) {
    logger.info('No new games added');
    return;
  }

  const gamePassGames = await gamePassClient.batchGetProductDetails(newIds);

  const gamePassGamesWithOpenCriticScores = await Promise.all(
    gamePassGames.map(async gamePassGame => {
      const searchResults = await openCriticClient.search(gamePassGame.LocalizedProperties[0].ProductTitle);

      const bestMatch = searchResults.sort((a, b) => a.dist - b.dist)[0];
      if (bestMatch.dist < 0.5) {
        const openCriticGame = await openCriticClient.getGame(bestMatch.id);
        return { gamePassGame, openCriticGame };
      }
      return { gamePassGame, openCriticGame: null };
    })
  );

  const slackToken = await getLatestSecretVersion(process.env.SECRET_ID_SLACK_TOKEN);

  const slackClient = new Slack.WebClient(slackToken);

  for (const { gamePassGame, openCriticGame } of gamePassGamesWithOpenCriticScores) {
    const name = gamePassGame.LocalizedProperties[0].ShortTitle || gamePassGame.LocalizedProperties[0].ProductTitle;
    const author =
      gamePassGame.LocalizedProperties[0].DeveloperName || gamePassGame.LocalizedProperties[0].PublisherName;
    const imageUrl = gamePassGame.LocalizedProperties[0].Images[0]?.Uri;

    const texts = [':tada: Uusi peli lisätty Game Passiin', '\n', `*${name}*`, author || '-'];

    if (openCriticGame != null && openCriticGame.averageScore > 0) {
      let openCriticText = `Open Critic: *${Math.floor(openCriticGame.averageScore)} pistettä*`;
      if (openCriticGame.averageScore > 80) {
        openCriticText += ' :star:';
      }
      texts.push(openCriticText);
    }

    if (gamePassGame.LocalizedProperties[0].ProductDescription) {
      texts.push(
        ...truncate(gamePassGame.LocalizedProperties[0].ProductDescription, { length: 400 })
          .split('\n')
          .map(paragraph => paragraph.trim())
          .filter(paragraph => paragraph.length > 0)
          .map(paragraph => `_${paragraph}_`)
      );
    }

    const message: Slack.SectionBlock = {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: texts.join('\n')
      }
    };

    if (imageUrl != null) {
      message.accessory = {
        type: 'image',
        image_url: `https:${imageUrl}`,
        alt_text: 'Kuva'
      };
    }

    await slackClient.chat.postMessage({
      channel: process.env.SLACK_CHANNEL_ID,
      blocks: [message],
      text: '',
      username: 'Game pass',
      icon_emoji: 'video_game'
    });
  }

  await stateManager.saveState({
    notifiedGameIds: [...new Set([...state.notifiedGameIds, ...newIds])]
  });
};

export default handler;
