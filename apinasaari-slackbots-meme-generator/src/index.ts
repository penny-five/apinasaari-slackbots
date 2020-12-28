import { getLatestSecretVersion } from '@apinasaari-slackbots/common/src/secrets';
import type { HttpFunction } from '@google-cloud/functions-framework/build/src/functions';
import { createMessageAdapter } from '@slack/interactive-messages';
import express from 'express';
import _ from 'lodash';

import slashCommandHandler from './handlers/slash-command';
import selectTemplateHandler from './handlers/select-template';
import submitModalHandler from './handlers/submit-modal';
import { ACTION_ID_SELECT_TEMPLATE, CALLBACK_ID_CREATE_MEME_MODAL } from './slack/views';

const createApp = _.memoize(async () => {
  const slackSigningSecret = await getLatestSecretVersion(process.env.SECRET_ID_SLACK_SIGNING_SECRET);

  const slackInteractions = createMessageAdapter(slackSigningSecret, {
    syncResponseTimeout: 5000
  });
  slackInteractions.action({ type: 'static_select', actionId: ACTION_ID_SELECT_TEMPLATE }, selectTemplateHandler);
  slackInteractions.viewSubmission(CALLBACK_ID_CREATE_MEME_MODAL, submitModalHandler);

  const app = express();

  app.use('/interactions', slackInteractions.requestListener());
  app.use('/slash-command', slashCommandHandler);

  return app;
});

const handler: HttpFunction = async (req, res) => {
  const app = await createApp();
  await app(req, res);
};

export default handler;
