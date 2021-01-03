import logger from '@apinasaari-slackbots/common-logger';
import { getAllTemplates } from '@apinasaari-slackbots/meme-generator-common/src/config';

import { client as slackClient } from '../slack';
import { SlackShortcutPayload } from '../slack/models';
import { createBaseView } from '../slack/views';

const handler = async (payload: any) => {
  logger.info(payload);

  const shortcut = SlackShortcutPayload.parse(payload);

  return slackClient.views.open({
    trigger_id: shortcut.trigger_id,
    view: createBaseView({
      availableTemplates: getAllTemplates()
    })
  });
};

export default handler;
