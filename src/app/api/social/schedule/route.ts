/**
 * POST /api/social/schedule
 * Configure or trigger the social media scanner.
 *
 * Body:
 *   { action: 'run_now' }                           — enqueue a one-off scan immediately
 *   { action: 'set_interval', intervalHours: 12 }   — set recurring schedule (1–168 h)
 *   { action: 'disable' }                            — remove recurring schedule
 *
 * GET /api/social/schedule
 *   Returns current schedule config + last/next run info.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSocialQueue } from '@/lib/queue';
import { db } from '@/lib/db';

// Suppress BullMQ/ioredis unhandled error events when Redis is unavailable
function getQueueSafe() {
  try {
    const q = getSocialQueue();
    q.on('error', () => {}); // prevent Node unhandled-error crash
    return q;
  } catch {
    return null;
  }
}

// Allow up to 30s for queue operations
export const maxDuration = 30;

const SCHEDULE_KEY = 'social_scanner_interval_hours';
const REPEAT_JOB_KEY = 'social-scanner-repeat';

const actionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('run_now') }),
  z.object({ action: z.literal('set_interval'), intervalHours: z.number().int().min(1).max(168) }),
  z.object({ action: z.literal('disable') }),
]);

// ─── GET: return schedule status ─────────────────────────────────────────────

export async function GET() {
  // DB queries — always available
  let intervalHours: number | null = null;
  let lastRun: { status: string; startedAt: Date | null; finishedAt: Date | null; threatsFound: number | null } | null = null;

  try {
    const setting = await db.appSetting.findUnique({ where: { key: SCHEDULE_KEY } });
    intervalHours = setting ? parseInt(setting.value, 10) : null;

    const lastJob = await db.scanJob.findFirst({
      where: { module: 'SOCIAL_MONITOR' },
      orderBy: { startedAt: 'desc' },
    });

    if (lastJob) {
      lastRun = {
        status: lastJob.status,
        startedAt: lastJob.startedAt,
        finishedAt: lastJob.finishedAt,
        threatsFound: lastJob.threatsFound,
      };
    }
  } catch {
    // DB unavailable (e.g. DATABASE_URL not set) — return defaults
  }

  // BullMQ queries — require Redis; fall back to DB-derived value if unavailable
  let isScheduled = intervalHours !== null; // DB is source of truth for whether schedule is active
  let nextRunAt: string | null = null;

  const queue = getQueueSafe();
  if (queue) {
    try {
      const repeatableJobs = await queue.getRepeatableJobs();
      const activeRepeat = repeatableJobs.find((j) => j.key.startsWith(REPEAT_JOB_KEY));
      isScheduled = !!activeRepeat;
      nextRunAt = activeRepeat?.next ? new Date(activeRepeat.next).toISOString() : null;
    } catch {
      // Redis unavailable — keep DB-derived isScheduled, nextRunAt stays null
    }
  }

  return NextResponse.json({ intervalHours, isScheduled, nextRunAt, lastRun });
}

// ─── POST: configure or trigger ───────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = actionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const queue = getQueueSafe();
    if (!queue) {
      return NextResponse.json({ error: 'Queue unavailable — Redis is not running' }, { status: 503 });
    }
    const { action } = parsed.data;

    // ── run_now ──────────────────────────────────────────────────────────────
    if (action === 'run_now') {
      const scanJob = await db.scanJob.create({
        data: { module: 'SOCIAL_MONITOR', status: 'QUEUED', triggeredBy: 'MANUAL' },
      });

      await queue.add(
        'social-scan',
        { scanJobId: scanJob.id },
        { jobId: `manual-${Date.now()}`, removeOnComplete: 50, removeOnFail: 20 },
      );

      return NextResponse.json({ message: 'Scan enqueued', scanJobId: scanJob.id }, { status: 202 });
    }

    // ── set_interval ─────────────────────────────────────────────────────────
    if (action === 'set_interval') {
      const { intervalHours } = parsed.data;
      const cronExpression = intervalToCron(intervalHours);

      // Remove existing repeat job if any
      const existing = await queue.getRepeatableJobs();
      for (const job of existing) {
        if (job.key.startsWith(REPEAT_JOB_KEY)) {
          await queue.removeRepeatableByKey(job.key);
        }
      }

      // Create a ScanJob placeholder for the scheduler to reference
      // (the worker will create a new ScanJob entry per run)
      await queue.add(
        'social-scan-scheduled',
        { scanJobId: 'SCHEDULED' }, // worker will create the real ScanJob
        {
          jobId: REPEAT_JOB_KEY,
          repeat: { pattern: cronExpression },
          removeOnComplete: 50,
          removeOnFail: 20,
        },
      );

      // Persist setting
      await db.appSetting.upsert({
        where: { key: SCHEDULE_KEY },
        update: { value: String(intervalHours) },
        create: { key: SCHEDULE_KEY, value: String(intervalHours) },
      });

      return NextResponse.json({
        message: `Scheduled every ${intervalHours}h (cron: ${cronExpression})`,
        intervalHours,
        cronExpression,
      });
    }

    // ── disable ───────────────────────────────────────────────────────────────
    if (action === 'disable') {
      const existing = await queue.getRepeatableJobs();
      for (const job of existing) {
        if (job.key.startsWith(REPEAT_JOB_KEY)) {
          await queue.removeRepeatableByKey(job.key);
        }
      }

      await db.appSetting.deleteMany({ where: { key: SCHEDULE_KEY } });

      return NextResponse.json({ message: 'Schedule disabled' });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[POST /api/social/schedule]', msg);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Convert hours to a cron expression.
// Examples: 6h -> "0 *\/6 * * *", 24h -> "0 0 * * *"
function intervalToCron(hours: number): string {
  if (hours === 24) return '0 0 * * *';        // daily at midnight
  if (hours === 12) return '0 */12 * * *';     // twice a day
  if (hours === 6)  return '0 */6 * * *';      // every 6h
  if (hours === 1)  return '0 * * * *';        // hourly
  if (hours % 24 === 0) {
    const days = hours / 24;
    return `0 0 */${days} * *`;                // every N days
  }
  return `0 */${hours} * * *`;                 // every N hours
}
