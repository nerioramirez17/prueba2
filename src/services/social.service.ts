/**
 * Social Media Scanner Service
 *
 * Strategy:
 * - X (Twitter): X API v2 batch user lookup (requires TWITTER_BEARER_TOKEN)
 * - Instagram: unofficial web_profile_info endpoint (no auth, best-effort)
 * - TikTok / Facebook: no viable API — returns MANUAL state with direct links
 */

import axios from 'axios';

export type SocialPlatform = 'x' | 'instagram' | 'tiktok' | 'facebook';

export type PlatformStatus =
  | 'ACTIVE'        // Scanned via API, results available
  | 'UNCONFIGURED'  // API key required but not set
  | 'LIMITED'       // No official API, partial/best-effort scan
  | 'MANUAL';       // Cannot be scanned automatically — manual check required

export interface SocialProfile {
  id: string;
  platform: SocialPlatform;
  platformName: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  profileUrl: string;
  riskScore: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface PlatformResult {
  status: PlatformStatus;
  profiles: SocialProfile[];
  error?: string;
  /** Direct links for manual checking (when status = MANUAL or LIMITED) */
  manualCheckUrls?: { username: string; url: string }[];
}

export interface SocialScanResult {
  platforms: Record<SocialPlatform, PlatformResult>;
  stats: {
    total: number;
    bySeverity: { critical: number; high: number; medium: number; low: number };
  };
  scannedAt: string;
}

// ─── Username variations to check ─────────────────────────────────────────────
// Brand: "cocos capital" / "cocos-capital.com.ar"

export const USERNAME_VARIATIONS: string[] = [
  'cocoscapital',
  'cocoscapital_ar',
  'cocoscapital_oficial',
  'cocoscapitaloficial',
  'cocoscapitalarg',
  'cocoscapitalargentina',
  'cocos_capital',
  'cocosinversiones',
  'cocos_inversiones',
  'cocoscap_ar',
  'cocoscapitalar',
  'cocoscap_oficial',
  'cocoscap_arg',
  'cocoscapoficial',
  'cocos_cap_ar',
  'cocoscapitalargen',
  'cocos_capital_ar',
  'cocos_capital_arg',
  'cocos_capital_oficial',
  'cocos_capital_argentina',
  'cocoscapitalinversiones',
  'cocosinversiones_ar',
  'cocoscap_invest',
  'cocos_invest',
];

/** Keywords to search on Instagram (each triggers a full search query) */
const IG_SEARCH_QUERIES = [
  'cocoscapital',
  'cocos capital',
  'cocos inversiones',
];

/** Official accounts to skip */
const OFFICIAL_X = ['cocoscap'];
const OFFICIAL_IG = ['cocoscap'];

// ─── Risk scoring ──────────────────────────────────────────────────────────────

function calculateRiskScore(username: string): number {
  let score = 0;
  const u = username.toLowerCase().replace(/[._\-]/g, '');

  if (u.includes('cocoscapital')) score += 50;
  else if (u.includes('cocos') && u.includes('capital')) score += 40;
  else if (u.includes('cocos')) score += 25;

  if (u.includes('oficial') || u.includes('official')) score += 20;
  if (u.includes('ar') || u.includes('arg') || u.includes('argentina')) score += 15;
  if (u.includes('inversiones') || u.includes('invest')) score += 10;

  return Math.min(score, 100);
}

function getSeverity(score: number): SocialProfile['severity'] {
  if (score >= 75) return 'CRITICAL';
  if (score >= 55) return 'HIGH';
  if (score >= 35) return 'MEDIUM';
  return 'LOW';
}

function makeProfile(
  platform: SocialPlatform,
  platformName: string,
  username: string,
  profileUrl: string,
  displayName: string | null,
  bio: string | null,
): SocialProfile {
  const riskScore = calculateRiskScore(username);
  return {
    id: `${platform}-${username}`,
    platform,
    platformName,
    username,
    displayName,
    bio,
    profileUrl,
    riskScore,
    severity: getSeverity(riskScore),
  };
}

// ─── X via CDN followbutton endpoint (free, no auth) ──────────────────────────
// GET https://cdn.syndication.twimg.com/widgets/followbutton/info.json?screen_names=u1,u2,...
// Returns array of existing accounts with name, screen_name, followers_count.
// Accounts not in the response simply don't exist.

async function scanXFree(): Promise<PlatformResult> {
  const toCheck = USERNAME_VARIATIONS.filter(
    (u) => !OFFICIAL_X.map((o) => o.toLowerCase()).includes(u.toLowerCase()),
  );

  const profiles: SocialProfile[] = [];

  // The endpoint accepts up to ~100 screen_names per request
  const chunks: string[][] = [];
  for (let i = 0; i < toCheck.length; i += 50) {
    chunks.push(toCheck.slice(i, i + 50));
  }

  for (const chunk of chunks) {
    try {
      const res = await axios.get(
        'https://cdn.syndication.twimg.com/widgets/followbutton/info.json',
        {
          params: { screen_names: chunk.join(',') },
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            Referer: 'https://x.com/',
          },
          timeout: 10000,
          validateStatus: (s) => s < 500,
        },
      );

      if (res.status === 200 && Array.isArray(res.data)) {
        console.log(`[social:x] CDN found ${res.data.length} accounts out of ${chunk.length} checked`);
        for (const user of res.data as Array<{ screen_name: string; name: string; followers_count?: number }>) {
          profiles.push(
            makeProfile(
              'x',
              'X (Twitter)',
              user.screen_name,
              `https://x.com/${user.screen_name}`,
              user.name ?? null,
              null,
            ),
          );
        }
      } else {
        console.log(`[social:x] CDN → status=${res.status}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`[social:x] CDN error: ${msg.slice(0, 80)}`);
    }
  }

  profiles.sort((a, b) => b.riskScore - a.riskScore);
  return { status: 'LIMITED', profiles };
}

// ─── X (Twitter) via API v2 with free CDN fallback ────────────────────────────

async function scanX(): Promise<PlatformResult> {
  const bearerToken = process.env.TWITTER_BEARER_TOKEN;

  // No token → go straight to free CDN scan
  if (!bearerToken) {
    return scanXFree();
  }

  const toCheck = USERNAME_VARIATIONS.filter(
    (u) => !OFFICIAL_X.map((o) => o.toLowerCase()).includes(u.toLowerCase()),
  );

  const chunks: string[][] = [];
  for (let i = 0; i < toCheck.length; i += 100) {
    chunks.push(toCheck.slice(i, i + 100));
  }

  const profiles: SocialProfile[] = [];

  // URL-decode token in case it was copied with encoded characters (e.g. %3D → =)
  const token = decodeURIComponent(bearerToken);

  for (const chunk of chunks) {
    try {
      const res = await axios.get('https://api.twitter.com/2/users/by', {
        params: {
          usernames: chunk.join(','),
          'user.fields': 'name,description,public_metrics,verified',
        },
        headers: { Authorization: `Bearer ${token}` },
        timeout: 15000,
        validateStatus: (s) => s < 600,
      });

      if (res.status === 402) {
        console.log('[social:x] 402 on API v2 — falling back to free CDN scan');
        return scanXFree();
      }

      if (res.status === 401 || res.status === 403) {
        console.error(`[social:x] ${res.status} — token inválido, falling back to free CDN scan`);
        return scanXFree();
      }

      const users: Array<{ id: string; username: string; name: string; description?: string }> =
        res.data?.data ?? [];

      console.log(`[social:x] API v2 returned ${users.length} accounts out of ${chunk.length} checked`);

      for (const user of users) {
        profiles.push(
          makeProfile(
            'x',
            'X (Twitter)',
            user.username,
            `https://x.com/${user.username}`,
            user.name ?? null,
            user.description ?? null,
          ),
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[social:x] API v2 error: ${msg} — falling back to free CDN scan`);
      return scanXFree();
    }
  }

  profiles.sort((a, b) => b.riskScore - a.riskScore);
  return { status: 'ACTIVE', profiles };
}

// ─── Instagram helpers ─────────────────────────────────────────────────────────

/** Parse OG meta tags from Instagram's public profile page HTML. */
function parseInstagramOgTags(html: string): { displayName: string | null; bio: string | null } {
  // og:title → "Full Name (@username) • Instagram photos and videos"
  const titleMatch = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i)
    ?? html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:title"/i);
  const rawTitle = titleMatch?.[1] ?? null;
  // Strip " • Instagram photos and videos" suffix and extract name before (@...)
  const displayName = rawTitle
    ? (rawTitle.replace(/\s*[•·]\s*Instagram.*$/i, '').replace(/\s*\(@[^)]+\)\s*$/, '').trim() || null)
    : null;

  // og:description → "X Followers, Y Following, Z Posts - See Instagram photos..."
  const descMatch = html.match(/<meta[^>]+property="og:description"[^>]+content="([^"]+)"/i)
    ?? html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:description"/i);
  const bio = descMatch?.[1]?.trim() ?? null;

  return { displayName, bio };
}

// ─── Instagram: keyword search ─────────────────────────────────────────────────
// Uses IG's internal search endpoint to find ALL accounts matching a query,
// just like the search bar in the app. No auth required (best-effort).

const IG_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': '*/*',
  'Accept-Language': 'es-AR,es;q=0.9,en;q=0.8',
  'x-ig-app-id': '936619743392459',
  'X-Requested-With': 'XMLHttpRequest',
  'Referer': 'https://www.instagram.com/',
  'Origin': 'https://www.instagram.com',
};

async function searchInstagramByKeyword(query: string): Promise<Array<{ username: string; fullName: string | null; bio: string | null }>> {
  try {
    const res = await axios.get('https://www.instagram.com/web/search/topsearch/', {
      params: { query, count: 50, context: 'blended', rank_token: '' },
      headers: IG_HEADERS,
      timeout: 12000,
      validateStatus: (s) => s < 500,
    });

    if (res.status !== 200 || !res.data?.users) {
      console.log(`[social:ig:search] query="${query}" → status=${res.status}, no users field`);
      return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const users = (res.data.users as any[]).map((entry) => ({
      username: (entry.user?.username ?? '') as string,
      fullName: (entry.user?.full_name ?? null) as string | null,
      bio: (entry.user?.biography ?? null) as string | null,
    })).filter((u) => u.username);

    console.log(`[social:ig:search] query="${query}" → ${users.length} results`);
    return users;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`[social:ig:search] query="${query}" → error: ${msg.slice(0, 100)}`);
    return [];
  }
}

// ─── Instagram: verify single username via OG tags ─────────────────────────────

async function verifyInstagramUsername(username: string): Promise<{ found: boolean; displayName: string | null; bio: string | null }> {
  const url = `https://www.instagram.com/${username}/`;

  // Strategy 1: unofficial JSON API
  try {
    const res = await axios.get('https://www.instagram.com/api/v1/users/web_profile_info/', {
      params: { username },
      headers: IG_HEADERS,
      timeout: 8000,
      validateStatus: (s) => s < 500,
    });
    if (res.status === 200 && res.data?.data?.user) {
      const user = res.data.data.user;
      return { found: true, displayName: user.full_name || null, bio: user.biography || null };
    }
  } catch { /* fall through */ }

  // Strategy 2: OG meta tags with Googlebot UA
  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'es-AR,es;q=0.9,en;q=0.8',
      },
      timeout: 10000,
      maxRedirects: 3,
      validateStatus: (s) => s < 500,
    });
    if (res.status === 200 && typeof res.data === 'string') {
      const { displayName, bio } = parseInstagramOgTags(res.data);
      const isProfilePage = res.data.includes('"ProfilePage"') || res.data.includes(`"${username}"`);
      if (isProfilePage || displayName) {
        return { found: true, displayName, bio };
      }
    }
  } catch { /* not found */ }

  return { found: false, displayName: null, bio: null };
}

// ─── Instagram scanner ─────────────────────────────────────────────────────────

async function scanInstagram(): Promise<PlatformResult> {
  const officialLower = OFFICIAL_IG.map((o) => o.toLowerCase());
  const profiles: SocialProfile[] = [];
  const seenUsernames = new Set<string>();
  const manualCheckUrls: { username: string; url: string }[] = [];

  // ── Step 1: keyword search (finds accounts we'd never guess) ──────────────
  for (const query of IG_SEARCH_QUERIES) {
    const results = await searchInstagramByKeyword(query);
    for (const { username, fullName, bio } of results) {
      const lower = username.toLowerCase();
      if (officialLower.includes(lower) || seenUsernames.has(lower)) continue;

      // Only include accounts that look related to the brand
      const normalized = lower.replace(/[._\-]/g, '');
      const isBrandRelated =
        normalized.includes('cocos') ||
        normalized.includes('cocoscap') ||
        (fullName?.toLowerCase().includes('cocos') ?? false);

      if (!isBrandRelated) continue;

      seenUsernames.add(lower);
      const url = `https://www.instagram.com/${username}/`;
      manualCheckUrls.push({ username, url });
      console.log(`[social:ig:search] ✅ FOUND @${username} (via keyword "${query}")`);
      profiles.push(makeProfile('instagram', 'Instagram', username, url, fullName, bio));
    }

    await new Promise((r) => setTimeout(r, 600));
  }

  // ── Step 2: verify hardcoded variations not already found via search ───────
  const variationsToCheck = USERNAME_VARIATIONS.filter(
    (u) => !officialLower.includes(u.toLowerCase()) && !seenUsernames.has(u.toLowerCase()),
  );

  for (const username of variationsToCheck) {
    const url = `https://www.instagram.com/${username}/`;
    manualCheckUrls.push({ username, url });

    const { found, displayName, bio } = await verifyInstagramUsername(username);
    if (found) {
      seenUsernames.add(username.toLowerCase());
      console.log(`[social:ig:check] ✅ FOUND @${username}`);
      profiles.push(makeProfile('instagram', 'Instagram', username, url, displayName, bio));
    } else {
      console.log(`[social:ig:check] ✗ @${username} not found`);
    }

    await new Promise((r) => setTimeout(r, 400));
  }

  profiles.sort((a, b) => b.riskScore - a.riskScore);
  const status: PlatformStatus = profiles.length > 0 ? 'LIMITED' : 'MANUAL';

  return { status, profiles, manualCheckUrls };
}

// ─── TikTok (manual only) ──────────────────────────────────────────────────────

async function scanTikTok(): Promise<PlatformResult> {
  const manualCheckUrls = USERNAME_VARIATIONS.map((u) => ({
    username: u,
    url: `https://www.tiktok.com/@${u}`,
  }));

  return {
    status: 'MANUAL',
    profiles: [],
    manualCheckUrls,
  };
}

// ─── Facebook (manual only) ───────────────────────────────────────────────────

async function scanFacebook(): Promise<PlatformResult> {
  const manualCheckUrls = USERNAME_VARIATIONS.map((u) => ({
    username: u,
    url: `https://www.facebook.com/${u}`,
  }));

  return {
    status: 'MANUAL',
    profiles: [],
    manualCheckUrls,
  };
}

// ─── Main scanner ──────────────────────────────────────────────────────────────

export async function scanSocialMedia(): Promise<SocialScanResult> {
  const [x, instagram, tiktok, facebook] = await Promise.all([
    scanX(),
    scanInstagram(),
    scanTikTok(),
    scanFacebook(),
  ]);

  const allProfiles = [
    ...x.profiles,
    ...instagram.profiles,
    ...tiktok.profiles,
    ...facebook.profiles,
  ];

  return {
    platforms: { x, instagram, tiktok, facebook },
    stats: {
      total: allProfiles.length,
      bySeverity: {
        critical: allProfiles.filter((p) => p.severity === 'CRITICAL').length,
        high: allProfiles.filter((p) => p.severity === 'HIGH').length,
        medium: allProfiles.filter((p) => p.severity === 'MEDIUM').length,
        low: allProfiles.filter((p) => p.severity === 'LOW').length,
      },
    },
    scannedAt: new Date().toISOString(),
  };
}
