import logger from '@apinasaari-slackbots/common/src/logger';
import { findTemplateById } from '@apinasaari-slackbots/meme-generator-common/src/config';
import { getTemplateFile } from '@apinasaari-slackbots/meme-generator-common/src/buckets/assets';
import { uploadFile } from '@apinasaari-slackbots/meme-generator-common/src/buckets/output';
import { TaskPayload } from '@apinasaari-slackbots/meme-generator-common/src/tasks';
import type { EventFunction } from '@google-cloud/functions-framework/build/src/functions';

import { MemePainter } from './meme-painter';
import { client as slackClient } from './slack';

const handler: EventFunction = async ({ data }: { data: string }) => {
  const payload = TaskPayload.parse(JSON.parse(Buffer.from(data, 'base64').toString()));

  logger.info(payload);

  const { channelId, userName, templateId, texts } = payload;

  const template = findTemplateById(templateId);
  const templateFile = await getTemplateFile(template);

  const painter = new MemePainter(template.width, template.height);

  painter.drawTemplate(templateFile);

  texts.forEach((text, index) => {
    const textArea = template.textAreas[index];
    painter.drawText(text, textArea.top, textArea.right, textArea.bottom, textArea.left, {
      textColor: template.textColor,
      strokeColor: template.strokeColor,
      fontWeight: template.fontWeight,
      textAlign: template.textAlign
    });
  });

  const { buffer, mimeType } = painter.toBuffer();

  const { publicUrl } = await uploadFile(buffer, mimeType);

  await slackClient.chat.postMessage({
    channel: channelId,
    /**
     * Mandatory fallback message in case blocks are not available, i.e. in notifications.
     */
    text: `Meeminne kuten haluatte käyttäjä *${userName}*: ${publicUrl}`,
    mrkdwn: true,
    unfurl_media: false,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Meeminne kuten haluatte käyttäjä *${userName}*:`
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
