import { getLatestSecretVersion } from '@apinasaari-slackbots/common/src/secrets';

import memoize from 'lodash/memoize';

export const getLatestSecretVersionMemoized = memoize((secretName: string) => {
  return getLatestSecretVersion(secretName);
});
