import logger from '@apinasaari-slackbots/common/src/logger';
import { HttpFunction } from '@google-cloud/functions-framework/build/src/functions';

import { getAllTemplates } from '../config';
import { getSlackClient } from '../slack';
import { SlackSlashCommand } from '../slack/models';
import { createBaseView } from '../slack/views';

const handler: HttpFunction = async (req, res) => {
  logger.info(req.body);

  res.send({ response_type: 'in_channel' });

  const command = SlackSlashCommand.from(req.body);

  const slackClient = await getSlackClient();

  await slackClient.views.open({
    trigger_id: command.trigger_id,
    view: createBaseView({
      availableTemplates: getAllTemplates(),
      metadata: { channelId: command.channel_id, userName: command.user_name }
    })
  });
};

export default handler;
