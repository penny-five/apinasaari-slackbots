import { Storage } from '@google-cloud/storage';

import { MemeTemplate } from '../config';

const storageClient = new Storage();
const assetsBucket = storageClient.bucket(process.env.ASSETS_BUCKET_NAME);

export const getTemplateUrl = (template: MemeTemplate) => {
  const file = assetsBucket.file(template.filename);
  return file.publicUrl();
};

export const getTemplateFile = async (template: MemeTemplate) => {
  const file = assetsBucket.file(template.filename);
  const [bytes] = await file.download();
  return bytes;
};
