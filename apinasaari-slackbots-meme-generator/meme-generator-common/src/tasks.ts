import { IsString } from 'class-validator';
import { transformAndValidateSync } from 'class-transformer-validator';

export class TaskPayload {
  @IsString()
  templateId: string;

  @IsString({ each: true })
  texts: string[];

  @IsString()
  channelId: string;

  @IsString()
  userName: string;

  static parse(payload: object) {
    return transformAndValidateSync(TaskPayload, payload);
  }
}
