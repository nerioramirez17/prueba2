import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const createThreatSchema = z.object({
  type: z.enum(['DOMAIN', 'PHISHING_URL', 'SOCIAL_MEDIA', 'APP_STORE']),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  sourceUrl: z.string().url().optional(),
});

export async function GET(request: NextRequest) {
  try {
    // TODO: add auth check
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);

    const threats = await db.threat.findMany({
      where: {
        ...(type ? { type: type as never } : {}),
        ...(status ? { status: status as never } : {}),
      },
      include: {
        domainThreat: true,
        phishingUrl: true,
        socialThreat: true,
        credentialBreach: true,
        assignedTo: { select: { id: true, name: true, email: true } },
      },
      orderBy: { detectedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await db.threat.count({
      where: {
        ...(type ? { type: type as never } : {}),
        ...(status ? { status: status as never } : {}),
      },
    });

    return NextResponse.json({ threats, total, page, limit });
  } catch (error) {
    console.error('[GET /api/threats]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: add auth check
    const body = await request.json();
    const parsed = createThreatSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const threat = await db.threat.create({ data: parsed.data });
    return NextResponse.json(threat, { status: 201 });
  } catch (error) {
    console.error('[POST /api/threats]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
