import logger from '@apinasaari-slackbots/common/src/logger';

import { getTemplateUrl } from '../buckets/assets';
import { findTemplateById, getAllTemplates } from '../config';
import { getSlackClient } from '../slack';
import { SlackBlockActionInteraction } from '../slack/models';
import { createMemeBuilderView } from '../slack/views';

const handler = async (payload: any) => {
  logger.info(payload);

  const interaction = SlackBlockActionInteraction.from(payload);

  const selectedTemplate = findTemplateById(interaction.actions[0].selected_option.value);
  const selectedTemplateUrl = getTemplateUrl(selectedTemplate);

  const slackClient = await getSlackClient();

  await slackClient.views.update({
    view_id: interaction.view.id,
    hash: interaction.view.hash,
    view: createMemeBuilderView({
      availableTemplates: getAllTemplates(),
      selectedTemplate,
      selectedTemplateUrl,
      metadata: interaction.view.private_metadata
    })
  });
};

export default handler;
