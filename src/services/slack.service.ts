/**
 * Slack Notification Service
 * Sends threat alerts to the security Slack channel.
 *
 * Setup:
 * 1. Create a Slack App at https://api.slack.com/apps
 * 2. Add incoming webhook to a channel (e.g. #security-alerts)
 * 3. Set SLACK_WEBHOOK_URL in .env
 */

import axios from 'axios';

type ThreatSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

const severityEmoji: Record<ThreatSeverity, string> = {
  CRITICAL: '🔴',
  HIGH: '🟠',
  MEDIUM: '🟡',
  LOW: '🟢',
};

const severityColor: Record<ThreatSeverity, string> = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#22c55e',
};

interface ThreatAlertPayload {
  severity: ThreatSeverity;
  type: string;
  title: string;
  description?: string;
  sourceUrl?: string;
  detectedAt?: Date;
  dashboardUrl?: string;
}

export class SlackService {
  private readonly webhookUrl = process.env.SLACK_WEBHOOK_URL ?? '';

  /**
   * Send a threat detection alert to Slack.
   */
  async sendThreatAlert(payload: ThreatAlertPayload): Promise<void> {
    // TODO: implement
    // const emoji = severityEmoji[payload.severity];
    // const color = severityColor[payload.severity];
    //
    // const message = {
    //   attachments: [
    //     {
    //       color,
    //       blocks: [
    //         {
    //           type: 'section',
    //           text: {
    //             type: 'mrkdwn',
    //             text: `${emoji} *[${payload.severity}] ${payload.type} detectado*\n*${payload.title}*`,
    //           },
    //         },
    //         ...(payload.description
    //           ? [{ type: 'section', text: { type: 'mrkdwn', text: payload.description } }]
    //           : []),
    //         {
    //           type: 'actions',
    //           elements: [
    //             {
    //               type: 'button',
    //               text: { type: 'plain_text', text: 'Ver en portal' },
    //               url: payload.dashboardUrl ?? process.env.NEXT_PUBLIC_APP_URL,
    //             },
    //           ],
    //         },
    //       ],
    //     },
    //   ],
    // };
    //
    // await axios.post(this.webhookUrl, message);
    throw new Error('Not implemented — TODO: implement Slack threat alert');
  }

  /**
   * Send a weekly digest summary.
   */
  async sendWeeklyDigest(stats: {
    newThreats: number;
    resolvedThreats: number;
    criticalCount: number;
    highCount: number;
  }): Promise<void> {
    // TODO: implement weekly digest message
    throw new Error('Not implemented — TODO: implement Slack weekly digest');
  }
}

export const slackService = new SlackService();
