import * as Slack from '@slack/web-api';
import { IsArray, IsIn, IsNumber, IsOptional, IsString, IsUrl, Matches, ValidateNested } from 'class-validator';
import { transformAndValidateSync } from 'class-transformer-validator';

export class SlackBlockAction {
  @IsIn(['static_select', 'plain_text_input'])
  type: 'static_select' | 'plain_text_input';

  @IsNumber()
  action_id: string;

  @IsOptional()
  selected_option?: Slack.Option;

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

class SlackInteractionUser {
  @IsString()
  id: string;

  @IsString()
  username: string;

  @IsString()
  name: string;
}

export class SlackInteraction {
  @IsIn(['block_actions', 'view_submission'])
  type: 'block_actions' | 'view_submission';

  @ValidateNested()
  user: SlackInteractionUser;

  @ValidateNested()
  view: SlackView;
}

export class SlackViewSubmissionInteraction extends SlackInteraction {
  static from(payload: object) {
    return transformAndValidateSync(SlackViewSubmissionInteraction, payload);
  }
}

export class SlackBlockActionInteraction extends SlackInteraction {
  @ValidateNested()
  actions: SlackBlockAction[];

  static from(payload: object) {
    return transformAndValidateSync(SlackBlockActionInteraction, payload);
  }
}

export class SlackSlashCommand {
  @IsString()
  token: string;

  @IsString()
  channel_id: number;

  @IsString()
  user_id: string;

  @IsString()
  user_name: string;

  @Matches(/\/.*/)
  command: string;

  @IsString()
  text: string;

  @IsUrl()
  response_url: string;

  @IsString()
  trigger_id: string;

  static from(payload: object) {
    return transformAndValidateSync(SlackSlashCommand, payload);
  }
}
