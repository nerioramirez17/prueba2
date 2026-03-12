import { NextResponse } from 'next/server';
import { scanSocialMedia } from '@/services/social.service';

// Allow up to 60 seconds — scanning ~52 URLs in parallel takes time
export const maxDuration = 60;

export async function GET() {
  try {
    const result = await scanSocialMedia();
    return NextResponse.json(result);
  } catch (error) {
    console.error('[social] scan failed:', error);
    return NextResponse.json({ error: 'Error al escanear redes sociales' }, { status: 500 });
  }
}
