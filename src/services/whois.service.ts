/**
 * WHOIS Service
 * Retrieves domain registration data to assess domain threat risk.
 *
 * Libraries to consider:
 * - whoiser (npm) — pure JS WHOIS client
 * - whois-json (npm) — async WHOIS lookups
 */

interface WhoisResult {
  domain: string;
  registrar?: string;
  registrationDate?: Date;
  expirationDate?: Date;
  nameservers: string[];
  countryCode?: string;
  registrantName?: string;
  registrantEmail?: string;
  rawText: string;
}

export class WhoisService {
  /**
   * Perform a WHOIS lookup for a domain.
   */
  async lookup(domain: string): Promise<WhoisResult> {
    // TODO: implement
    // Option 1: Use `whoiser` package:
    //   import whoiser from 'whoiser';
    //   const result = await whoiser(domain);
    //
    // Option 2: Use WHOIS REST API (e.g., whoisjsonapi.com):
    //   const response = await axios.get(`https://whoisjsonapi.com/v1/${domain}`, {
    //     headers: { Authorization: `Bearer ${process.env.WHOIS_API_KEY}` },
    //   });
    throw new Error(`Not implemented — TODO: WHOIS lookup for ${domain}`);
  }

  /**
   * Calculate a risk score based on WHOIS data.
   * Factors:
   * - Domain age (newer = higher risk)
   * - Registrar reputation (shady registrars = higher risk)
   * - Country code (known phishing hotspots = higher risk)
   * - Privacy protection (hidden registrant = slightly higher risk)
   */
  calculateRiskScore(whois: WhoisResult): number {
    // TODO: implement scoring algorithm
    let score = 0;

    // Age factor: domain < 30 days = +40pts
    if (whois.registrationDate) {
      const ageMs = Date.now() - whois.registrationDate.getTime();
      const ageDays = ageMs / (1000 * 60 * 60 * 24);
      if (ageDays < 30) score += 40;
      else if (ageDays < 90) score += 20;
      else if (ageDays < 180) score += 10;
    }

    // Country factor
    const highRiskCountries = ['CN', 'RU', 'NG', 'UA', 'RO'];
    if (whois.countryCode && highRiskCountries.includes(whois.countryCode)) {
      score += 20;
    }

    return Math.min(score, 100);
  }
}

export const whoisService = new WhoisService();
