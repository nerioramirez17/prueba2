/**
 * Certificate Transparency (crt.sh) Service
 * Finds SSL certificates issued for domains similar to our brand.
 *
 * API: https://crt.sh/?q=%.cocos-capital.com.ar&output=json
 */

import axios from 'axios';

interface CrtshEntry {
  id: number;
  logged_at: string;
  not_before: string;
  not_after: string;
  common_name: string;
  matching_identities: string;
  issuer_name: string;
}

export class CrtshService {
  private readonly baseUrl = 'https://crt.sh';

  /**
   * Search for certificates matching a domain pattern.
   * @param query e.g. "%.cocos-capital" or "cocos-cap%" for fuzzy matching
   */
  async searchCertificates(query: string): Promise<CrtshEntry[]> {
    // TODO: implement
    // const response = await axios.get<CrtshEntry[]>(this.baseUrl, {
    //   params: { q: query, output: 'json' },
    //   timeout: 15000,
    // });
    // return response.data;
    throw new Error('Not implemented — TODO: implement crt.sh certificate search');
  }

  /**
   * Extract unique domain names from certificate results.
   */
  extractDomains(entries: CrtshEntry[]): string[] {
    // TODO: implement
    const domains = new Set<string>();
    for (const entry of entries) {
      const names = entry.matching_identities.split(/\n/).map((s) => s.trim()).filter(Boolean);
      names.forEach((d) => domains.add(d.replace(/^\*\./, '')));
    }
    return Array.from(domains);
  }

  /**
   * Find phishing-related domains by checking similarity to the base domain.
   * @param baseDomain e.g. "cocos-capital.com.ar"
   */
  async findSuspiciousDomains(baseDomain: string): Promise<string[]> {
    // TODO: implement full pipeline
    // 1. Search crt.sh for "%.cocos-capital" and "cocos-cap%"
    // 2. Extract unique domain names
    // 3. Filter out the real domain
    // 4. Return list for further WHOIS + risk scoring
    throw new Error('Not implemented — TODO: implement suspicious domain finder');
  }
}

export const crtshService = new CrtshService();
