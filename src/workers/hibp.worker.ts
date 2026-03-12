/**
 * HIBP (HaveIBeenPwned) Checker Worker
 * Periodically checks all corporate email addresses for breaches.
 *
 * Pipeline:
 * 1. Fetch all employee emails from DB (or from HR API)
 * 2. For each email: check HIBP API (rate limited: 1req/1.5s)
 * 3. For new breaches: create Threat + CredentialBreach in DB
 * 4. Notify affected employee + security team
 */

import { Worker, type Job } from 'bullmq';
import { redisConnection, QUEUE_NAMES } from '@/lib/queue';
import { db } from '@/lib/db';
import { hibpService } from '@/services/hibp.service';
import { slackService } from '@/services/slack.service';

interface HibpCheckJobData {
  emails?: string[]; // specific emails, or empty for full domain scan
  domain?: string; // e.g. "cocos-capital.com.ar"
  triggeredBy: string;
}

// TODO: uncomment when ready to run workers
// const worker = new Worker<HibpCheckJobData>(
//   QUEUE_NAMES.HIBP_CHECKER,
//   async (job: Job<HibpCheckJobData>) => {
//     const { emails, domain } = job.data;
//     console.log(`[HibpWorker] Checking ${emails?.length ?? 'all'} emails`);
//
//     const emailList = emails ?? []; // TODO: fetch from HR/directory API if not provided
//     const results = await hibpService.checkDomain(emailList, 1600); // 1600ms between requests
//
//     let newBreaches = 0;
//
//     for (const [email, breaches] of results.entries()) {
//       for (const breach of breaches) {
//         // Check if already in DB
//         const existing = await db.credentialBreach.findFirst({
//           where: {
//             email,
//             breachName: breach.Name,
//           },
//         });
//
//         if (existing) continue;
//
//         // Create new breach record
//         await db.threat.create({
//           data: {
//             type: 'DARK_WEB',
//             severity: breach.IsSensitive ? 'CRITICAL' : 'HIGH',
//             status: 'DETECTED',
//             title: `Filtración: ${email} en ${breach.Title}`,
//             credentialBreach: {
//               create: {
//                 email,
//                 domain: breach.Domain,
//                 breachName: breach.Name,
//                 breachDate: breach.BreachDate ? new Date(breach.BreachDate) : undefined,
//                 breachDescription: breach.Description,
//                 dataClasses: breach.DataClasses,
//                 isVerified: breach.IsVerified,
//                 isSensitive: breach.IsSensitive,
//               },
//             },
//           },
//         });
//
//         newBreaches++;
//       }
//     }
//
//     if (newBreaches > 0) {
//       await slackService.sendThreatAlert({
//         severity: 'HIGH',
//         type: 'Filtración de Credenciales',
//         title: `${newBreaches} nueva(s) filtración(es) detectadas`,
//         dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/darkweb`,
//       });
//     }
//
//     return { newBreaches, checked: emailList.length };
//   },
//   { connection: redisConnection, concurrency: 1 } // single concurrency due to rate limits
// );
//
// worker.on('completed', (job) => console.log(`[HibpWorker] Job ${job.id} completed`));
// worker.on('failed', (job, err) => console.error(`[HibpWorker] Job ${job?.id} failed:`, err));
//
// export default worker;

console.log('[HibpWorker] Loaded — uncomment worker to start processing');
