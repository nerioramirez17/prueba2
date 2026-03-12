/**
 * Social Media Scanner Worker
 *
 * Pipeline:
 * 1. Mark ScanJob as RUNNING
 * 2. Run scanSocialMedia() across all platforms
 * 3. For each detected profile, skip if already in DB (dedup by platform+username)
 * 4. Persist new finds as Threat + SocialThreat
 * 5. Send per-account Slack alert for CRITICAL/HIGH
 * 6. Send summary Slack message if any new accounts found
 * 7. Mark ScanJob as COMPLETED
 */

import { Worker, type Job } from 'bullmq';
import { redisConnection, QUEUE_NAMES } from '@/lib/queue';
import { db } from '@/lib/db';
import { scanSocialMedia } from '@/services/social.service';
import { slackService } from '@/services/slack.service';

interface SocialScanJobData {
  scanJobId: string;
}

const worker = new Worker<SocialScanJobData>(
  QUEUE_NAMES.SOCIAL_SCANNER,
  async (job: Job<SocialScanJobData>) => {
    let { scanJobId } = job.data;
    console.log(`[SocialWorker] Processing job ${job.id} (scanJobId=${scanJobId})`);

    // For scheduled (repeatable) jobs, create the ScanJob record on the fly
    if (scanJobId === 'SCHEDULED') {
      const created = await db.scanJob.create({
        data: { module: 'SOCIAL_MONITOR', status: 'QUEUED', triggeredBy: 'SCHEDULER' },
      });
      scanJobId = created.id;
    }

    // Step 1: Mark as RUNNING
    await db.scanJob.update({
      where: { id: scanJobId },
      data: { status: 'RUNNING', startedAt: new Date() },
    });

    let newThreats = 0;
    let critical = 0;
    let high = 0;

    try {
      // Step 2: Run scan across all platforms
      const result = await scanSocialMedia();

      const allProfiles = Object.values(result.platforms).flatMap((p) => p.profiles);

      console.log(`[SocialWorker] Scan found ${allProfiles.length} total suspicious profiles`);

      for (const profile of allProfiles) {
        // Step 3: Skip already-tracked accounts (dedup by platform + username)
        const existing = await db.socialThreat.findFirst({
          where: {
            platform: profile.platform,
            username: { equals: profile.username, mode: 'insensitive' },
          },
        });

        if (existing) {
          console.log(`[SocialWorker] ⏭ @${profile.username} (${profile.platform}) already tracked`);
          continue;
        }

        // Step 4: Persist new threat
        const threat = await db.threat.create({
          data: {
            type: 'SOCIAL_MEDIA',
            severity: profile.severity,
            status: 'DETECTED',
            title: `@${profile.username} en ${profile.platformName}`,
            description: profile.bio ?? undefined,
            sourceUrl: profile.profileUrl,
            socialThreat: {
              create: {
                platform: profile.platform,
                username: profile.username,
                displayName: profile.displayName ?? undefined,
                profileUrl: profile.profileUrl,
                bio: profile.bio ?? undefined,
              },
            },
          },
        });

        console.log(`[SocialWorker] ✅ New threat created: @${profile.username} (${profile.severity})`);
        newThreats++;
        if (profile.severity === 'CRITICAL') critical++;
        if (profile.severity === 'HIGH') high++;

        // Step 5: Per-account Slack alert for CRITICAL / HIGH
        if (profile.severity === 'CRITICAL' || profile.severity === 'HIGH') {
          try {
            await slackService.sendThreatAlert({
              severity: profile.severity,
              type: 'Cuenta falsa en redes sociales',
              title: `@${profile.username} (${profile.platformName})`,
              description: profile.bio
                ? `Bio: "${profile.bio.slice(0, 120)}"`
                : `Risk score: ${profile.riskScore}/100`,
              sourceUrl: profile.profileUrl,
              detectedAt: new Date(),
              dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/social`,
            });
          } catch (slackErr) {
            console.warn(`[SocialWorker] Slack alert failed for @${profile.username}:`, slackErr);
          }
        }
      }

      // Step 6: Summary Slack message
      if (newThreats > 0) {
        try {
          await slackService.sendSocialScanSummary({
            newAccounts: newThreats,
            critical,
            high,
            scannedAt: new Date(),
          });
        } catch (slackErr) {
          console.warn('[SocialWorker] Summary Slack alert failed:', slackErr);
        }
      }

      // Step 7: Mark COMPLETED
      await db.scanJob.update({
        where: { id: scanJobId },
        data: {
          status: 'COMPLETED',
          finishedAt: new Date(),
          threatsFound: newThreats,
          result: {
            totalScanned: allProfiles.length,
            newThreats,
            critical,
            high,
          },
        },
      });

      console.log(`[SocialWorker] Job ${job.id} completed — ${newThreats} new threats found`);
      return { newThreats };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[SocialWorker] Job ${job.id} failed:`, errorMessage);

      await db.scanJob.update({
        where: { id: scanJobId },
        data: {
          status: 'FAILED',
          finishedAt: new Date(),
          errorMessage,
        },
      });

      throw error;
    }
  },
  { connection: redisConnection, concurrency: 1 },
);

worker.on('completed', (job) =>
  console.log(`[SocialWorker] ✅ Job ${job.id} completed`),
);
worker.on('failed', (job, err) =>
  console.error(`[SocialWorker] ❌ Job ${job?.id} failed:`, err.message),
);

export default worker;
