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
    if (!this.webhookUrl) {
      console.warn('[slack] SLACK_WEBHOOK_URL not configured — skipping alert');
      return;
    }

    const emoji = severityEmoji[payload.severity];
    const color = severityColor[payload.severity];

    const blocks = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `${emoji} *[${payload.severity}] ${payload.type} detectado*\n*${payload.title}*`,
        },
      },
      ...(payload.description
        ? [{ type: 'section', text: { type: 'mrkdwn', text: payload.description } }]
        : []),
      ...(payload.sourceUrl
        ? [
            {
              type: 'section',
              text: { type: 'mrkdwn', text: `🔗 <${payload.sourceUrl}|Ver perfil>` },
            },
          ]
        : []),
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Detectado: ${(payload.detectedAt ?? new Date()).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}`,
          },
        ],
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'Ver en portal' },
            url: payload.dashboardUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
            style: 'primary',
          },
        ],
      },
    ];

    await axios.post(this.webhookUrl, {
      attachments: [{ color, blocks }],
    });
  }

  /**
   * Send a weekly digest summary.
   */
  async sendSocialScanSummary(stats: {
    newAccounts: number;
    critical: number;
    high: number;
    scannedAt: Date;
  }): Promise<void> {
    if (!this.webhookUrl) return;
    if (stats.newAccounts === 0) return; // no alert if nothing new

    const lines = [
      `📊 *Resumen escaneo de redes sociales*`,
      `🆕 Nuevas cuentas detectadas: *${stats.newAccounts}*`,
      ...(stats.critical > 0 ? [`🔴 Críticas: *${stats.critical}*`] : []),
      ...(stats.high > 0 ? [`🟠 Altas: *${stats.high}*`] : []),
    ];

    await axios.post(this.webhookUrl, {
      attachments: [
        {
          color: stats.critical > 0 ? '#ef4444' : '#f97316',
          blocks: [
            { type: 'section', text: { type: 'mrkdwn', text: lines.join('\n') } },
            {
              type: 'actions',
              elements: [
                {
                  type: 'button',
                  text: { type: 'plain_text', text: 'Ver en portal' },
                  url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/dashboard/social`,
                  style: 'primary',
                },
              ],
            },
          ],
        },
      ],
    });
  }

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
