import logger from './logger';

import { Storage, Bucket } from '@google-cloud/storage';

export class StateManager<T> {
  private static readonly STATE_FILE_NAME = 'state.json';

  private bucket: Bucket;

  private cachedState: T;

  constructor(bucketName: string) {
    const storageClient = new Storage();
    this.bucket = storageClient.bucket(bucketName);
  }

  async loadState() {
    if (this.cachedState != null) {
      return this.cachedState;
    }

    const stateFile = this.bucket.file(StateManager.STATE_FILE_NAME);

    const [stateFileExists] = await stateFile.exists();

    if (stateFileExists) {
      const response = await stateFile.download();
      this.cachedState = JSON.parse(response[0].toString());
      return this.cachedState;
    }

    return null;
  }

  async saveState(state: T) {
    const serializedState = JSON.stringify(state);

    if (JSON.stringify(this.cachedState) === serializedState) {
      logger.info('StateManager: State not changed, skipping');
      return;
    }

    const stateFile = this.bucket.file(StateManager.STATE_FILE_NAME);
    await stateFile.save(JSON.stringify(state));
    logger.info('Statemanager: state saved', { state });
  }
}
