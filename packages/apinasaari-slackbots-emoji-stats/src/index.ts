// import { getLatestSecretVersion } from '@apinasaari-slackbots/common-secrets';
import { EventFunction } from '@google-cloud/functions-framework/build/src/functions';
import * as Slack from '@slack/web-api';
import { KnownBlock } from '@slack/web-api';
import { DateTime } from 'luxon';
import { linearRegression, linearRegressionLine } from 'simple-statistics';

interface EmojiStats {
  name: string;
  weeklyStats: { week: string; count: number }[];
}

const sleep = (millis: number) => new Promise(resolve => setTimeout(resolve, millis));

const uniqISOWeeksWithinRange = (start: DateTime, end: DateTime) => {
  const result = new Set<string>();

  let current = start;

  do {
    result.add(getISOWeek(current));
    current = current.plus({ days: 1 });
  } while (current < end);

  result.add(getISOWeek(end));

  return Array.from(result.values());
};

const getISOWeek = (date: DateTime) => date.toFormat("yyyy'-W'WW");

const createEmptyStats = ({ name, isoWeeks }: { name: string; isoWeeks: string[] }): EmojiStats => ({
  name,
  weeklyStats: isoWeeks.map(week => ({ week, count: 0 }))
});

/**
 * Returns emojis that have been used the most during the entire period.
 */
const getPopularEmojis = (stats: EmojiStats[], count = 5) => {
  return [...stats]
    .sort(
      (first, second) =>
        second.weeklyStats.reduce((sum, { count }) => sum + count, 0) -
        first.weeklyStats.reduce((sum, { count }) => sum + count, 0)
    )
    .slice(0, count);
};

/**
 * Returns emojis that are trending based on the data from last 2 weeks.
 */
const getTrendingEmojis = (stats: EmojiStats[], count = 5) => {
  return [...stats]
    .sort((first, second) =>
      linearRegressionLine(linearRegression(second.weeklyStats.slice(-2).map(({ count }, index) => [index, count])))(
        second.weeklyStats.length
      ) >
      linearRegressionLine(linearRegression(first.weeklyStats.slice(-2).map(({ count }, index) => [index, count])))(
        first.weeklyStats.length
      )
        ? 1
        : -1
    )
    .slice(0, count);
};

/**
 * Returns emojis that are declining based on the data from last 3 weeks.
 */
const getDecliningEmojis = (stats: EmojiStats[], count = 5) => {
  return [...stats]
    .sort((first, second) =>
      linearRegression(second.weeklyStats.slice(-3).map(({ count }, index) => [index, count])).m >
      linearRegression(first.weeklyStats.slice(-3).map(({ count }, index) => [index, count])).m
        ? -1
        : 1
    )
    .slice(0, count);
};

/**
 * Returns emojis that are bubbling under, meaning that they are not among the
 * most popular, trending or declining but still relevant.
 */
const getBubblingUnderEmojis = (stats: EmojiStats[], count = 5) => {
  const popular = getPopularEmojis(stats, 5);
  const trending = getTrendingEmojis(stats, 5);
  const declining = getDecliningEmojis(stats, 5);

  return [...stats]
    .filter(({ name }) => [...popular, ...trending, ...declining].find(entry => entry.name === name) == null)
    .sort(
      (first, second) =>
        second.weeklyStats.reduce((sum, { count }) => sum + count, 0) -
        first.weeklyStats.reduce((sum, { count }) => sum + count, 0)
    )
    .slice(0, count);
};

const buildSlackCategoryHeaderBlock = ({ name, emoji }: { name: string; emoji: string }): KnownBlock => ({
  type: 'section',
  text: {
    type: 'mrkdwn',
    text: `:${emoji}: *${name}*\n`
  }
});

const buildSlackEmojiBlock = ({ name, index }: { name: string; index: number }): KnownBlock => ({
  type: 'section',
  text: {
    type: 'mrkdwn',
    text: `${index + 1}. :${name}: ${name}\n`
  }
});

const buildSlackDividerBlock = (): KnownBlock => ({
  type: 'divider'
});

const handler: EventFunction = async () => {
  // const slackToken = await getLatestSecretVersion(process.env.SECRET_ID_SLACK_TOKEN);
  const slackToken = process.env.SLACK_TOKEN;
  const slackClient = new Slack.WebClient(slackToken);

  const rangeFrom = DateTime.local().minus({ week: 3 });
  const rangeTo = DateTime.local();

  const uniqISOWeeks = uniqISOWeeksWithinRange(rangeFrom, rangeTo);

  const inputChannelIds = process.env.INPUT_SLACK_CHANNEL_IDS.split(',');

  const statsByEmoji = new Map<string, EmojiStats>();

  for (const channelId of inputChannelIds) {
    let hasMore = true;
    let nextCursor: string;

    do {
      // Sleep to avoid running to rate limits
      await sleep(500);

      // eslint-disable-next-line no-console
      console.log(`channel: ${channelId}, cursor: ${nextCursor}`);
      const historyResponse = await slackClient.conversations.history({
        channel: channelId,
        cursor: nextCursor
      });

      hasMore = historyResponse.has_more;
      nextCursor = historyResponse.response_metadata.next_cursor;

      for (const message of historyResponse.messages) {
        const timestamp = DateTime.fromMillis(parseInt(message.ts, 10) * 1000);

        if (timestamp < rangeFrom) {
          hasMore = false;
        } else if (message.reactions != null) {
          for (const { name, count } of message.reactions) {
            if (!statsByEmoji.has(name)) {
              statsByEmoji.set(name, createEmptyStats({ name, isoWeeks: uniqISOWeeks }));
            }

            statsByEmoji.get(name).weeklyStats.forEach(entry => {
              if (entry.week === getISOWeek(timestamp)) {
                entry.count = entry.count += count;
              }
            });
          }
        }
      }
    } while (hasMore);
  }

  const stats = Array.from(statsByEmoji.values());

  const blocks: Slack.KnownBlock[] = [];

  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*APINASAAREN EMOJIPÖRSSIN VIIKKOTIEDOTE* (${rangeTo.toFormat('d.L.y')})\n`
    }
  });

  blocks.push(buildSlackDividerBlock());
  blocks.push(buildSlackCategoryHeaderBlock({ name: 'Suosituimmat', emoji: 'first_place_medal' }));
  blocks.push(...getPopularEmojis(stats).map(({ name }, index) => buildSlackEmojiBlock({ name, index })));

  blocks.push(buildSlackDividerBlock());
  blocks.push(buildSlackCategoryHeaderBlock({ name: 'Nousussa', emoji: 'stonks' }));
  blocks.push(...getTrendingEmojis(stats).map(({ name }, index) => buildSlackEmojiBlock({ name, index })));

  blocks.push(buildSlackDividerBlock());
  blocks.push(buildSlackCategoryHeaderBlock({ name: 'Laskussa', emoji: 'notstonks' }));
  blocks.push(...getDecliningEmojis(stats).map(({ name }, index) => buildSlackEmojiBlock({ name, index })));

  blocks.push(buildSlackDividerBlock());
  blocks.push(buildSlackCategoryHeaderBlock({ name: 'Bubbling under', emoji: 'muna_ankka' }));
  blocks.push(...getBubblingUnderEmojis(stats).map(({ name }, index) => buildSlackEmojiBlock({ name, index })));

  await slackClient.chat.postMessage({
    channel: process.env.SLACK_CHANNEL_ID,
    text: null,
    blocks,
    username: 'Emojipörssi',
    icon_emoji: 'porvaripuh'
  });
};

export default handler;
