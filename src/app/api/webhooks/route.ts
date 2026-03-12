import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const webhookPayloadSchema = z.object({
  source: z.string(),
  event: z.string(),
  data: z.record(z.unknown()),
  timestamp: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // TODO: verify webhook signature
    const body = await request.json();
    const parsed = webhookPayloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { source, event, data } = parsed.data;

    console.log(`[Webhook] ${source}:${event}`, data);

    // TODO: route to appropriate handler based on source/event
    // switch (source) {
    //   case 'urlscan': ...
    //   case 'virustotal': ...
    //   case 'cloudflare_radar': ...
    // }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[POST /api/webhooks]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
