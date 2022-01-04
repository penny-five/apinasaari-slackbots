import { TaskPayload } from '@apinasaari-slackbots/meme-generator-common/src/tasks';
import { PubSub } from '@google-cloud/pubsub';

const pubsub = new PubSub();

const topic = pubsub.topic(process.env.TASKS_TOPIC_NAME);

export const publish = (payload: TaskPayload) => {
  return topic.publishJSON(payload);
};
