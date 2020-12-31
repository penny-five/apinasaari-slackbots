import logger from '@apinasaari-slackbots/common/src/logger';
import { TaskPayload } from '@apinasaari-slackbots/meme-generator-common/src/tasks';

import { SlackViewSubmissionInteractionPayload } from '../slack/models';
import { extractMemeBuilderViewSubmitValues } from '../slack/views';
import { publish } from '../topic';

const handler = async (payload: any) => {
  logger.info(payload);

  const interaction = SlackViewSubmissionInteractionPayload.parse(payload);

  const { channelId, templateId, texts } = extractMemeBuilderViewSubmitValues(interaction);

  const task: TaskPayload = {
    templateId: templateId,
    channelId: channelId,
    userName: interaction.user.username,
    texts
  };

  logger.info(task);

  await publish(task);
};

export default handler;
