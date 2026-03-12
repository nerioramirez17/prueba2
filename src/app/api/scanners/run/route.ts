import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const runScanSchema = z.object({
  module: z.enum(['DOMAIN_WATCHDOG', 'PHISHING_ANALYZER', 'SOCIAL_MONITOR', 'DARK_WEB_MONITOR']),
  target: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // TODO: add auth check
    const body = await request.json();
    const parsed = runScanSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { module, target } = parsed.data;

    // TODO: enqueue job with BullMQ
    // const queue = getDomainQueue();
    // const job = await queue.add('scan', { module, target, triggeredBy: 'MANUAL' });

    // Mock response
    const job = {
      id: `job_${Date.now()}`,
      module,
      target,
      status: 'QUEUED',
      queuedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        message: `Scan queued for ${module}`,
        job,
      },
      { status: 202 }
    );
  } catch (error) {
    console.error('[POST /api/scanners/run]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
