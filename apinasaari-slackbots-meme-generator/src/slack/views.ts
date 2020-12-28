import * as Slack from '@slack/web-api';
import _ from 'lodash';

import { findTemplateById, MemeTemplate } from '../config';
import { SlackInteraction, SlackViewSubmissionInteraction } from './models';

export const CALLBACK_ID_CREATE_MEME_MODAL = 'CREATE_MEME';
export const ACTION_ID_SELECT_TEMPLATE = 'ACTION_SELECT_TEMPLATE';
export const BLOCK_ID_SELECT_TEMPLATE = 'BLOCK_SELECT_TEMPLATE';
export const ACTION_ID_SELECT_TEXT = 'ACTION_SELECT_TEXT';

const createSelectTextBlockId = (index: number) => `BLOCK_SELECT_TEXT_${index + 1}`;

interface CreateViewOptions {
  metadata?: object | string;
  availableTemplates: MemeTemplate[];
}

export const createBaseView = (options: CreateViewOptions): Slack.View => ({
  type: 'modal',
  callback_id: CALLBACK_ID_CREATE_MEME_MODAL,
  private_metadata: typeof options.metadata === 'object' ? JSON.stringify(options.metadata) : options.metadata,
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
      type: 'actions',
      block_id: BLOCK_ID_SELECT_TEMPLATE,
      elements: [
        {
          type: 'static_select',
          action_id: ACTION_ID_SELECT_TEMPLATE,
          placeholder: {
            type: 'plain_text',
            text: 'Valitse meemipohja'
          },
          options: options.availableTemplates.map(template => ({
            text: {
              type: 'plain_text',
              text: template.label
            },
            value: template.id
          }))
        }
      ]
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

export const extractMemeBuilderViewSubmitValues = (interaction: SlackViewSubmissionInteraction) => {
  const action = interaction.view.state.values[BLOCK_ID_SELECT_TEMPLATE][ACTION_ID_SELECT_TEMPLATE];

  const template = findTemplateById(action.selected_option.value);

  const texts = _.times(template.textAreas.length, index => {
    const action = interaction.view.state.values[createSelectTextBlockId(index)][ACTION_ID_SELECT_TEXT];
    return action.value;
  });

  return { template, texts };
};

export const extractMetadata = <T>(interaction: SlackInteraction): T => {
  return JSON.parse(interaction.view.private_metadata) as T;
};
