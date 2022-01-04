import * as Slack from '@slack/web-api';
import { IsArray, IsIn, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { transformAndValidateSync } from 'class-transformer-validator';

export class SlackBlockAction {
  @IsIn(['static_select', 'plain_text_input', 'multi_channels_select'])
  type: 'static_select' | 'plain_text_input' | 'multi_channels_select';

  @IsNumber()
  action_id: string;

  @IsOptional()
  selected_option?: Slack.Option;

  @IsOptional()
  @IsString({ each: true })
  selected_channels?: string[];

  @IsOptional()
  value?: string;
}

export interface SlackBlockState {
  [id: string]: SlackBlockAction;
}

export class SlackViewState {
  @ValidateNested()
  values: { [id: string]: SlackBlockState };
}

class SlackView {
  @IsString()
  id: string;

  @IsString()
  hash: string;

  @IsArray()
  blocks: Slack.Block[];

  @ValidateNested()
  @IsOptional()
  state?: SlackViewState;

  @IsString()
  private_metadata: string;
}

class SlackUser {
  @IsString()
  id: string;

  @IsString()
  username: string;

  @IsString()
  name: string;
}

export class SlackInteractionPayload {
  @IsIn(['block_actions', 'view_submission'])
  type: 'block_actions' | 'view_submission';

  @ValidateNested()
  user: SlackUser;

  @ValidateNested()
  view: SlackView;
}

export class SlackViewSubmissionInteractionPayload extends SlackInteractionPayload {
  static parse(payload: object) {
    return transformAndValidateSync(SlackViewSubmissionInteractionPayload, payload);
  }
}

export class SlackBlockActionInteractionPayload extends SlackInteractionPayload {
  @ValidateNested()
  actions: SlackBlockAction[];

  static parse(payload: object) {
    return transformAndValidateSync(SlackBlockActionInteractionPayload, payload);
  }
}

export class SlackShortcutPayload {
  @IsString()
  trigger_id: string;

  @IsString()
  callback_id: string;

  @ValidateNested()
  user: SlackUser;

  static parse(payload: object) {
    return transformAndValidateSync(SlackShortcutPayload, payload);
  }
}
