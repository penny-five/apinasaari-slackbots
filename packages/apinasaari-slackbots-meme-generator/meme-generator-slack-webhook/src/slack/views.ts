import { findTemplateById, MemeTemplate } from '@apinasaari-slackbots/meme-generator-common/src/config';
import * as Slack from '@slack/web-api';
import _ from 'lodash';

import { SlackViewSubmissionInteractionPayload } from './models';

export const SHORTCUT_ID_GENERATE_MEME = 'GENERATE_MEME';
export const CALLBACK_ID_GENERATE_MEME_MODAL = 'GENERATE_MEME';
export const ACTION_ID_SELECT_TEMPLATE = 'ACTION_SELECT_TEMPLATE';
export const ACTION_ID_SELECT_CHANNEL = 'ACTION_SELECT_CHANNEL';
export const BLOCK_ID_SELECT_TEMPLATE = 'BLOCK_SELECT_TEMPLATE';
export const BLOCK_ID_SELECT_CHANNEL = 'BLOCK_SELECT_CHANNEL';
export const ACTION_ID_SELECT_TEXT = 'ACTION_SELECT_TEXT';

const createSelectTextBlockId = (index: number) => `BLOCK_SELECT_TEXT_${index + 1}`;

interface CreateViewOptions {
  availableTemplates: MemeTemplate[];
}

export const createBaseView = (options: CreateViewOptions): Slack.View => ({
  type: 'modal',
  callback_id: CALLBACK_ID_GENERATE_MEME_MODAL,
  title: {
    type: 'plain_text',
    text: 'Luo kostea meemu'
  },
  close: {
    type: 'plain_text',
    text: 'Sulje'
  },
  submit: {
    type: 'plain_text',
    text: 'Lähetä'
  },
  blocks: [
    {
      block_id: BLOCK_ID_SELECT_CHANNEL,
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'Valitse kanava'
      },
      accessory: {
        action_id: ACTION_ID_SELECT_CHANNEL,
        type: 'multi_channels_select',
        max_selected_items: 1,
        placeholder: {
          type: 'plain_text',
          text: 'Kanava'
        }
      }
    },
    {
      block_id: BLOCK_ID_SELECT_TEMPLATE,
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'Valitse meemipohja'
      },
      accessory: {
        type: 'static_select',
        action_id: ACTION_ID_SELECT_TEMPLATE,
        placeholder: {
          type: 'plain_text',
          text: 'Meemipohja'
        },
        options: options.availableTemplates.map(template => ({
          text: {
            type: 'plain_text',
            text: template.label
          },
          value: template.id
        }))
      }
    }
  ]
});

export const createMemeBuilderView = (
  options: CreateViewOptions & {
    selectedTemplate: MemeTemplate;
    selectedTemplateUrl: string;
  }
): Slack.View => {
  const view = createBaseView(options);

  view.blocks.push({
    type: 'image',
    image_url: options.selectedTemplateUrl,
    alt_text: 'Meemipohja'
  });

  view.blocks.push(
    ..._.times(options.selectedTemplate.textAreas.length, index => {
      const block: Slack.InputBlock = {
        type: 'input',
        block_id: createSelectTextBlockId(index),
        label: {
          type: 'plain_text',
          text: `Teksti ${index + 1}`
        },
        element: {
          action_id: ACTION_ID_SELECT_TEXT,
          type: 'plain_text_input',
          min_length: 1,
          max_length: 128
        }
      };
      return block;
    })
  );

  return view;
};

export const extractMemeBuilderViewSubmitValues = (interaction: SlackViewSubmissionInteractionPayload) => {
  const templateAction = interaction.view.state.values[BLOCK_ID_SELECT_TEMPLATE][ACTION_ID_SELECT_TEMPLATE];
  const channelAction = interaction.view.state.values[BLOCK_ID_SELECT_CHANNEL][ACTION_ID_SELECT_CHANNEL];

  const channelId = channelAction.selected_channels[0];
  const templateId = templateAction.selected_option.value;
  const template = findTemplateById(templateId);

  const texts = _.times(template.textAreas.length, index => {
    const action = interaction.view.state.values[createSelectTextBlockId(index)][ACTION_ID_SELECT_TEXT];
    return action.value;
  });

  return { channelId, templateId, texts };
};
