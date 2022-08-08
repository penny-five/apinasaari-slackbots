// eslint-disable-next-line no-unused-vars
declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: 'development' | 'production';
    SECRET_ID_SLACK_TOKEN: string;
    SLACK_CHANNEL_ID: string;
    INPUT_SLACK_CHANNEL_IDS: string;
  }
}
