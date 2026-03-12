import { NextResponse } from 'next/server';
import { crtshService } from '@/services/crtsh.service';
import dns from 'dns/promises';

const BASE_DOMAIN = 'cocos-capital.com.ar';

export type DomainSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type DomainStatus = 'DETECTED';

export interface ScannedDomain {
  id: string;
  domain: string;
  ip: string | null;
  issuer: string | null;
  certDate: string | null;
  riskScore: number;
  severity: DomainSeverity;
  status: DomainStatus;
}

export interface DomainsResponse {
  domains: ScannedDomain[];
  stats: {
    total: number;
    highCritical: number;
    newThisWeek: number;
  };
  scannedAt: string;
}

function calculateRiskScore(domain: string, certDate: string | null): number {
  let score = 0;
  const d = domain.toLowerCase();
  const normalized = d.replace(/[-_.]/g, '');

  // Brand similarity — higher score = more suspicious
  if (normalized.includes('cocoscapital')) score += 40;
  else if (d.includes('cocos-capital')) score += 40;
  else if (normalized.includes('cocos') && normalized.includes('capital')) score += 35;
  else if (normalized.includes('cocos')) score += 20;

  // Leet-speak / character substitutions
  if (/c[0o]c[0o]s/.test(normalized) || /c[4a]p[1i]t[4a]l/.test(normalized)) score += 20;

  // Non-.com.ar / non-.ar TLD is suspicious for an Argentine brand
  if (!domain.endsWith('.com.ar') && !domain.endsWith('.ar')) score += 10;

  // Certificate recency — freshly issued certs on phishing domains are common
  if (certDate) {
    const ageDays = (Date.now() - new Date(certDate).getTime()) / 86_400_000;
    if (ageDays < 30) score += 30;
    else if (ageDays < 90) score += 20;
    else if (ageDays < 180) score += 10;
  }

  return Math.min(score, 100);
}

function getSeverity(score: number): DomainSeverity {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  return 'LOW';
}

async function resolveIp(domain: string): Promise<string | null> {
  try {
    const { address } = await dns.lookup(domain);
    return address;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const raw = await crtshService.findSuspiciousDomains(BASE_DOMAIN);

    // Score and filter
    const scored = raw
      .map(({ domain, certDate, issuer }) => ({
        domain,
        certDate,
        issuer,
        riskScore: calculateRiskScore(domain, certDate),
      }))
      .filter((d) => d.riskScore >= 20)
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 100);

    // Resolve IPs in parallel (best-effort, no timeout extension)
    const ips = await Promise.all(scored.map((d) => resolveIp(d.domain)));

    const domains: ScannedDomain[] = scored.map((d, i) => ({
      id: String(i + 1),
      domain: d.domain,
      ip: ips[i],
      issuer: d.issuer,
      certDate: d.certDate,
      riskScore: d.riskScore,
      severity: getSeverity(d.riskScore),
      status: 'DETECTED',
    }));

    const now = Date.now();
    const weekMs = 7 * 86_400_000;

    const response: DomainsResponse = {
      domains,
      stats: {
        total: domains.length,
        highCritical: domains.filter((d) => d.riskScore >= 60).length,
        newThisWeek: domains.filter(
          (d) => d.certDate && now - new Date(d.certDate).getTime() < weekMs,
        ).length,
      },
      scannedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[domains] scan failed:', error);
    return NextResponse.json({ error: 'Error al escanear dominios' }, { status: 500 });
  }
}
