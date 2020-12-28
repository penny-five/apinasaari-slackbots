import logger from '@apinasaari-slackbots/common/src/logger';

import { getTemplateFile } from '../buckets/assets';
import { uploadFile } from '../buckets/output';
import { MemePainter } from '../meme-painter';
import { getSlackClient } from '../slack';
import { SlackViewSubmissionInteraction } from '../slack/models';
import { extractMemeBuilderViewSubmitValues, extractMetadata } from '../slack/views';

const handler = async (payload: any) => {
  logger.info(payload);

  const interaction = SlackViewSubmissionInteraction.from(payload);

  const { template, texts } = extractMemeBuilderViewSubmitValues(interaction);

  const templatefile = await getTemplateFile(template);

  const painter = new MemePainter(template.width, template.height);

  painter.drawTemplate(templatefile);

  texts.forEach((text, index) => {
    const textArea = template.textAreas[index];
    painter.drawText(text, textArea.top, textArea.right, textArea.bottom, textArea.left);
  });

  const { buffer, mimeType } = painter.toBuffer();

  const { publicUrl } = await uploadFile(buffer, mimeType);

  const metadata = extractMetadata<{ channelId: string; userName: string }>(interaction);

  const slackClient = await getSlackClient();

  await slackClient.chat.postMessage({
    channel: metadata.channelId,
    /**
     * Fallback message in case blocks are not available.
     */
    text: `Meeminne kuten haluatte käyttäjä *${metadata.userName}*: ${publicUrl}`,
    mrkdwn: true,
    unfurl_media: false,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Meeminne kuten haluatte käyttäjä *${metadata.userName}*:`
        }
      },
      {
        type: 'image',
        image_url: publicUrl,
        alt_text: `${template.label} -meemi`
      }
    ]
  });
};

export default handler;
