import logger from '@apinasaari-slackbots/common-logger';

const handler = async (payload: any) => {
  logger.info(payload);
};

export default handler;
