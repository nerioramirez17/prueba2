/**
 * Phishing URL Analyzer Worker
 * Processes URL analysis jobs submitted via the dashboard or API.
 *
 * Pipeline:
 * 1. Receive URL from queue
 * 2. Submit to URLScan.io + VirusTotal in parallel
 * 3. Wait for results
 * 4. Calculate combined risk score
 * 5. Create/update Threat + PhishingUrl in DB
 * 6. Send Slack alert if malicious
 */

import { Worker, type Job } from 'bullmq';
import { redisConnection, QUEUE_NAMES } from '@/lib/queue';
import { db } from '@/lib/db';
import { urlscanService } from '@/services/urlscan.service';
import { virusTotalService } from '@/services/virustotal.service';
import { slackService } from '@/services/slack.service';

interface PhishingAnalysisJobData {
  url: string;
  threatId?: string; // if re-analyzing existing threat
  triggeredBy: string;
}

// TODO: uncomment when ready to run workers
// const worker = new Worker<PhishingAnalysisJobData>(
//   QUEUE_NAMES.PHISHING_ANALYZER,
//   async (job: Job<PhishingAnalysisJobData>) => {
//     const { url } = job.data;
//     console.log(`[PhishingWorker] Analyzing URL: ${url}`);
//
//     // Run URLScan and VirusTotal in parallel
//     const [urlscanResult, vtResult] = await Promise.allSettled([
//       urlscanService.scan(url),
//       virusTotalService.analyzeUrl(url),
//     ]);
//
//     const isMalicious =
//       (urlscanResult.status === 'fulfilled' && urlscanResult.value.verdicts.overall.malicious) ||
//       (vtResult.status === 'fulfilled' && virusTotalService.getScore(vtResult.value.stats).isMalicious);
//
//     const severity = isMalicious ? 'HIGH' : 'LOW';
//
//     // Upsert threat in DB
//     const threat = await db.threat.upsert({
//       where: { id: job.data.threatId ?? '' },
//       update: { status: isMalicious ? 'CONFIRMED' : 'FALSE_POSITIVE', severity },
//       create: {
//         type: 'PHISHING_URL',
//         severity,
//         status: isMalicious ? 'CONFIRMED' : 'FALSE_POSITIVE',
//         title: url.substring(0, 255),
//         phishingUrl: {
//           create: {
//             url,
//             isSafe: !isMalicious,
//             // vtScore: vtScore.malicious,
//             // vtTotal: vtScore.total,
//             analyzedAt: new Date(),
//           },
//         },
//       },
//     });
//
//     if (isMalicious) {
//       await slackService.sendThreatAlert({
//         severity,
//         type: 'URL Phishing',
//         title: url,
//         dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/phishing`,
//       });
//     }
//
//     return { threat, isMalicious };
//   },
//   { connection: redisConnection, concurrency: 3 }
// );
//
// worker.on('completed', (job) => console.log(`[PhishingWorker] Job ${job.id} completed`));
// worker.on('failed', (job, err) => console.error(`[PhishingWorker] Job ${job?.id} failed:`, err));
//
// export default worker;

console.log('[PhishingWorker] Loaded — uncomment worker to start processing');
