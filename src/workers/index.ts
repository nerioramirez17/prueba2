/**
 * Workers entry point — runs all BullMQ workers as a standalone process.
 *
 * Start with: pnpm workers:dev
 */

import './domain.worker';
import './phishing.worker';
import './social.worker';

console.log('🔄 All workers started. Waiting for jobs...');

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down workers...');
  process.exit(0);
});
