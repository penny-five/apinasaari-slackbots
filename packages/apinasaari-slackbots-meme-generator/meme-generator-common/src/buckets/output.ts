import * as crypto from 'crypto';

import { Storage } from '@google-cloud/storage';
import * as MimeTypes from 'mime-types';

const storageClient = new Storage();
const outputBucket = storageClient.bucket(process.env.OUTPUT_BUCKET_NAME);

/**
 * Uploads a file. Generates a random filename.
 */
export const uploadFile = async (bytes: Buffer, contentType: string) => {
  const filename = crypto.randomBytes(16).toString('hex');
  const extension = MimeTypes.extension(contentType);
  const file = outputBucket.file(`${filename}.${extension}`);

  await file.save(bytes, { contentType });

  return { publicUrl: file.publicUrl() };
};
