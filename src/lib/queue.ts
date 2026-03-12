import { Queue, Worker, type ConnectionOptions } from 'bullmq';

const connection: ConnectionOptions = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
};

// Queue names
export const QUEUE_NAMES = {
  DOMAIN_SCANNER: 'domain-scanner',
  PHISHING_ANALYZER: 'phishing-analyzer',
  SLACK_NOTIFIER: 'slack-notifier',
  SOCIAL_SCANNER: 'social-scanner',
} as const;

// Queue instances (created lazily to avoid import-time connection)
let _domainQueue: Queue | null = null;
let _phishingQueue: Queue | null = null;
let _slackQueue: Queue | null = null;
let _socialQueue: Queue | null = null;

export function getDomainQueue(): Queue {
  if (!_domainQueue) {
    _domainQueue = new Queue(QUEUE_NAMES.DOMAIN_SCANNER, { connection });
  }
  return _domainQueue;
}

export function getPhishingQueue(): Queue {
  if (!_phishingQueue) {
    _phishingQueue = new Queue(QUEUE_NAMES.PHISHING_ANALYZER, { connection });
  }
  return _phishingQueue;
}

export function getSlackQueue(): Queue {
  if (!_slackQueue) {
    _slackQueue = new Queue(QUEUE_NAMES.SLACK_NOTIFIER, { connection });
  }
  return _slackQueue;
}

export function getSocialQueue(): Queue {
  if (!_socialQueue) {
    _socialQueue = new Queue(QUEUE_NAMES.SOCIAL_SCANNER, { connection });
  }
  return _socialQueue;
}

export { connection as redisConnection };
