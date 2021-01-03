import { getLatestSecretVersion } from '@apinasaari-slackbots/common-secrets';

import memoize from 'lodash/memoize';

export const getLatestSecretVersionMemoized = memoize((secretName: string) => {
  return getLatestSecretVersion(secretName);
});
