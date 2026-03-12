/**
 * Database seed — creates demo data for development.
 * Run with: pnpm db:seed
 */

import { PrismaClient, Role, ThreatType, ThreatSeverity, ThreatStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create users
  const adminPassword = await bcrypt.hash('admin123', 12);
  const analystPassword = await bcrypt.hash('analyst123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@cocos-capital.com.ar' },
    update: {},
    create: {
      name: 'Juan Díaz',
      email: 'admin@cocos-capital.com.ar',
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  const analyst = await prisma.user.upsert({
    where: { email: 'maria.gonzalez@cocos-capital.com.ar' },
    update: {},
    create: {
      name: 'María González',
      email: 'maria.gonzalez@cocos-capital.com.ar',
      password: analystPassword,
      role: Role.ANALYST,
    },
  });

  console.log('✓ Users created');

  // Create domain threats
  const domainThreat = await prisma.threat.create({
    data: {
      type: ThreatType.DOMAIN,
      severity: ThreatSeverity.CRITICAL,
      status: ThreatStatus.CONFIRMED,
      title: 'cocos-cap1tal.com',
      description: 'Domain using numeric "1" instead of "i" to impersonate Cocos Capital.',
      assignedToId: analyst.id,
      domainThreat: {
        create: {
          domain: 'cocos-cap1tal.com',
          registrar: 'GoDaddy Inc.',
          countryCode: 'US',
          registrationDate: new Date('2024-11-15'),
          riskScore: 92,
          similarityScore: 0.95,
          ipAddress: '185.220.101.45',
          nameservers: ['ns1.godaddy.com', 'ns2.godaddy.com'],
        },
      },
    },
  });

  // Create phishing URL threat
  const phishingThreat = await prisma.threat.create({
    data: {
      type: ThreatType.PHISHING_URL,
      severity: ThreatSeverity.HIGH,
      status: ThreatStatus.ANALYZING,
      title: 'https://cocoscapital-login.net/auth/verify',
      assignedToId: admin.id,
      phishingUrl: {
        create: {
          url: 'https://cocoscapital-login.net/auth/verify',
          pageTitle: 'Cocos Capital - Verificación de cuenta',
          isSafe: false,
          vtScore: 18,
          vtTotal: 75,
        },
      },
    },
  });

  // Create credential breach
  const breachThreat = await prisma.threat.create({
    data: {
      type: ThreatType.DARK_WEB,
      severity: ThreatSeverity.CRITICAL,
      status: ThreatStatus.DETECTED,
      title: 'Filtración: carlos.rodriguez@cocos-capital.com.ar en LinkedIn 2024',
      credentialBreach: {
        create: {
          email: 'carlos.rodriguez@cocos-capital.com.ar',
          breachName: 'LinkedIn 2024',
          breachDate: new Date('2024-08-15'),
          breachDescription: 'In August 2024, LinkedIn suffered a data breach exposing millions of records.',
          dataClasses: ['Email addresses', 'Passwords', 'Names', 'Job titles'],
          isVerified: true,
          isSensitive: true,
        },
      },
    },
  });

  console.log('✓ Threats created');

  // Create scan jobs
  await prisma.scanJob.createMany({
    data: [
      {
        module: 'DOMAIN_WATCHDOG',
        status: 'COMPLETED',
        triggeredBy: 'SCHEDULER',
        finishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        threatsFound: 3,
        result: { domainsScanned: 156, newDomains: 8, threatsFound: 3 },
        userId: admin.id,
      },
      {
        module: 'DARK_WEB_MONITOR',
        status: 'COMPLETED',
        triggeredBy: 'SCHEDULER',
        finishedAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
        threatsFound: 1,
        result: { emailsChecked: 847, newBreaches: 1 },
        userId: admin.id,
      },
    ],
  });

  console.log('✓ Scan jobs created');
  console.log('\n✅ Seed complete!');
  console.log('\nCredenciales de acceso:');
  console.log('  Admin: admin@cocos-capital.com.ar / admin123');
  console.log('  Analyst: maria.gonzalez@cocos-capital.com.ar / analyst123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
