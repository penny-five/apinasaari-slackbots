import logger from '@apinasaari-slackbots/common-logger';
import { findTemplateById, getAllTemplates } from '@apinasaari-slackbots/meme-generator-common/src/config';
import { getTemplateUrl } from '@apinasaari-slackbots/meme-generator-common/src/buckets/assets';

import { client as slackClient } from '../slack';
import { SlackBlockActionInteractionPayload } from '../slack/models';
import { createMemeBuilderView } from '../slack/views';

const handler = async (payload: any) => {
  logger.info(payload);

  const interaction = SlackBlockActionInteractionPayload.parse(payload);

  const selectedTemplate = findTemplateById(interaction.actions[0].selected_option.value);
  const selectedTemplateUrl = getTemplateUrl(selectedTemplate);

  return slackClient.views.update({
    view_id: interaction.view.id,
    hash: interaction.view.hash,
    view: createMemeBuilderView({
      availableTemplates: getAllTemplates(),
      selectedTemplate,
      selectedTemplateUrl
    })
  });
};

export default handler;
