/**
 * Certificate Transparency (crt.sh) Service
 * Finds SSL certificates issued for domains similar to our brand.
 *
 * API: https://crt.sh/?q=%cocos-capital%&output=json
 */

import axios from 'axios';

interface CrtshEntry {
  id: number;
  entry_timestamp: string;
  not_before: string;
  not_after: string;
  common_name: string;
  name_value: string; // newline-separated SANs
  issuer_name: string;
  serial_number: string;
}

export interface SuspiciousDomain {
  domain: string;
  certDate: string | null;
  issuer: string | null;
}

export class CrtshService {
  private readonly baseUrl = 'https://crt.sh';

  /**
   * Search for certificates matching a domain pattern.
   * @param query e.g. "%cocos-capital%" or "%cocoscapital%"
   */
  async searchCertificates(query: string): Promise<CrtshEntry[]> {
    const response = await axios.get<CrtshEntry[]>(this.baseUrl, {
      params: { q: query, output: 'json' },
      timeout: 20000,
      headers: { 'Accept': 'application/json' },
    });
    return Array.isArray(response.data) ? response.data : [];
  }

  /**
   * Extract unique domain names from certificate results.
   * Returns a map of domain -> { certDate, issuer }.
   */
  extractDomainMap(entries: CrtshEntry[]): Map<string, { certDate: string; issuer: string }> {
    const domainMap = new Map<string, { certDate: string; issuer: string }>();

    for (const entry of entries) {
      const names = entry.name_value
        .split(/[\n,]/)
        .map((s) => s.trim().replace(/^\*\./, ''))
        .filter(Boolean);

      if (entry.common_name) {
        names.push(entry.common_name.replace(/^\*\./, ''));
      }

      for (const domain of names) {
        const existing = domainMap.get(domain);
        // Keep the entry with the most recent cert date
        if (!existing || entry.not_before > existing.certDate) {
          domainMap.set(domain, {
            certDate: entry.not_before,
            issuer: entry.issuer_name,
          });
        }
      }
    }

    return domainMap;
  }

  /**
   * Find suspicious domains by querying crt.sh with brand-related patterns.
   * Filters out the real domain and its legitimate subdomains.
   */
  async findSuspiciousDomains(baseDomain: string): Promise<SuspiciousDomain[]> {
    const queries = [
      `%cocos-capital%`,
      `%cocoscapital%`,
      `%c0cos%`,
    ];

    const allEntries: CrtshEntry[] = [];
    const seenIds = new Set<number>();

    for (const query of queries) {
      try {
        const entries = await this.searchCertificates(query);
        for (const entry of entries) {
          if (!seenIds.has(entry.id)) {
            seenIds.add(entry.id);
            allEntries.push(entry);
          }
        }
      } catch {
        // Continue with remaining queries if one fails
      }
    }

    const domainMap = this.extractDomainMap(allEntries);

    // Filter out the real domain and all its legitimate subdomains
    const realDomainSuffix = `.${baseDomain}`;
    return Array.from(domainMap.entries())
      .filter(([domain]) => domain !== baseDomain && !domain.endsWith(realDomainSuffix))
      .map(([domain, { certDate, issuer }]) => ({ domain, certDate, issuer }));
  }
}

export const crtshService = new CrtshService();
