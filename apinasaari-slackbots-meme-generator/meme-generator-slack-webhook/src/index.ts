import { createMessageAdapter } from '@slack/interactive-messages';
import express from 'express';

import shortcutHandler from './handlers/shortcut';
import templateSelectionHandler from './handlers/template-selection';
import dialogSubmissionHandler from './handlers/dialog-submission';
import { ACTION_ID_SELECT_TEMPLATE, CALLBACK_ID_GENERATE_MEME_MODAL, SHORTCUT_ID_GENERATE_MEME } from './slack/views';

const slackInteractions = createMessageAdapter(process.env.SLACK_SIGNING_SECRET, {
  syncResponseTimeout: 3000
});

slackInteractions.shortcut(
  {
    callbackId: SHORTCUT_ID_GENERATE_MEME
  },
  shortcutHandler
);

slackInteractions.action(
  {
    type: 'static_select',
    actionId: ACTION_ID_SELECT_TEMPLATE
  },
  templateSelectionHandler
);

slackInteractions.viewSubmission(
  {
    callbackId: CALLBACK_ID_GENERATE_MEME_MODAL
  },
  dialogSubmissionHandler
);

const app = express();

app.use('/interactions', slackInteractions.requestListener());

export default app;
