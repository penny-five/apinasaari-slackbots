import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient();

export const getLatestSecretVersion = async (secretName: string) => {
  const [secretResponse] = await client.accessSecretVersion({
    name: `${secretName}/versions/latest`
  });

  return secretResponse.payload.data.toString();
};
