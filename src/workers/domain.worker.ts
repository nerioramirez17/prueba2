/**
 * Domain Scanner Worker
 * Processes domain scanning jobs from BullMQ queue.
 *
 * Pipeline:
 * 1. Fetch new certificates from crt.sh for brand variations
 * 2. For each new domain: WHOIS lookup
 * 3. Calculate risk score
 * 4. If risk score >= threshold: create Threat + DomainThreat in DB
 * 5. Enqueue Slack alert for high/critical threats
 */

import { Worker, type Job } from 'bullmq';
import { redisConnection, QUEUE_NAMES } from '@/lib/queue';
import { db } from '@/lib/db';
import { crtshService } from '@/services/crtsh.service';
import { whoisService } from '@/services/whois.service';
import { slackService } from '@/services/slack.service';

interface DomainScanJobData {
  triggeredBy: string;
  target?: string; // specific domain, or null for full scan
}

// TODO: uncomment when ready to run workers
// const worker = new Worker<DomainScanJobData>(
//   QUEUE_NAMES.DOMAIN_SCANNER,
//   async (job: Job<DomainScanJobData>) => {
//     console.log(`[DomainWorker] Processing job ${job.id}`);
//
//     // Step 1: Update scan job status in DB
//     await db.scanJob.update({
//       where: { id: job.data.triggeredBy },
//       data: { status: 'RUNNING', startedAt: new Date() },
//     });
//
//     try {
//       // Step 2: Get suspicious domains
//       const domains = await crtshService.findSuspiciousDomains('cocos-capital.com.ar');
//
//       let threatsFound = 0;
//
//       for (const domain of domains) {
//         // Step 3: Skip if already tracked
//         const existing = await db.domainThreat.findFirst({ where: { domain } });
//         if (existing) continue;
//
//         // Step 4: WHOIS lookup
//         const whois = await whoisService.lookup(domain);
//         const riskScore = whoisService.calculateRiskScore(whois);
//
//         // Step 5: Create threat if risk is significant
//         if (riskScore >= 30) {
//           const severity =
//             riskScore >= 80 ? 'CRITICAL' : riskScore >= 60 ? 'HIGH' : riskScore >= 40 ? 'MEDIUM' : 'LOW';
//
//           const threat = await db.threat.create({
//             data: {
//               type: 'DOMAIN',
//               severity,
//               status: 'DETECTED',
//               title: domain,
//               domainThreat: {
//                 create: {
//                   domain,
//                   registrar: whois.registrar,
//                   registrationDate: whois.registrationDate,
//                   expirationDate: whois.expirationDate,
//                   countryCode: whois.countryCode,
//                   nameservers: whois.nameservers,
//                   whoisRaw: whois.rawText,
//                   riskScore,
//                 },
//               },
//             },
//           });
//
//           threatsFound++;
//
//           // Step 6: Alert for high/critical
//           if (severity === 'CRITICAL' || severity === 'HIGH') {
//             await slackService.sendThreatAlert({
//               severity,
//               type: 'Dominio Sospechoso',
//               title: domain,
//               dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/domains`,
//             });
//           }
//         }
//       }
//
//       // Step 7: Update scan job as completed
//       await db.scanJob.update({
//         where: { id: job.data.triggeredBy },
//         data: { status: 'COMPLETED', finishedAt: new Date(), threatsFound },
//       });
//
//       return { threatsFound };
//     } catch (error) {
//       await db.scanJob.update({
//         where: { id: job.data.triggeredBy },
//         data: {
//           status: 'FAILED',
//           finishedAt: new Date(),
//           errorMessage: error instanceof Error ? error.message : 'Unknown error',
//         },
//       });
//       throw error;
//     }
//   },
//   { connection: redisConnection, concurrency: 1 }
// );
//
// worker.on('completed', (job) => console.log(`[DomainWorker] Job ${job.id} completed`));
// worker.on('failed', (job, err) => console.error(`[DomainWorker] Job ${job?.id} failed:`, err));
//
// export default worker;

console.log('[DomainWorker] Loaded — uncomment worker to start processing');
