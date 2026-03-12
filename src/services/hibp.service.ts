/**
 * HaveIBeenPwned (HIBP) Service
 * Checks if corporate email addresses appear in known data breaches.
 *
 * Docs: https://haveibeenpwned.com/API/v3
 * Requires API key: https://haveibeenpwned.com/API/Key
 */

import axios from 'axios';

interface HibpBreach {
  Name: string;
  Title: string;
  Domain: string;
  BreachDate: string;
  AddedDate: string;
  ModifiedDate: string;
  PwnCount: number;
  Description: string;
  DataClasses: string[];
  IsVerified: boolean;
  IsFabricated: boolean;
  IsSensitive: boolean;
  IsRetired: boolean;
  IsSpamList: boolean;
  IsMalware: boolean;
  LogoPath: string;
}

export class HibpService {
  private readonly apiKey = process.env.HIBP_API_KEY ?? '';
  private readonly baseUrl = 'https://haveibeenpwned.com/api/v3';

  private get headers() {
    return {
      'hibp-api-key': this.apiKey,
      'User-Agent': 'CocosSecurity/1.0',
    };
  }

  /**
   * Check breaches for a single email address.
   * Returns empty array if not breached.
   */
  async checkEmail(email: string): Promise<HibpBreach[]> {
    // TODO: implement
    // try {
    //   const response = await axios.get<HibpBreach[]>(
    //     `${this.baseUrl}/breachedaccount/${encodeURIComponent(email)}`,
    //     { headers: this.headers, params: { truncateResponse: false } }
    //   );
    //   return response.data;
    // } catch (err: any) {
    //   if (err.response?.status === 404) return []; // not breached
    //   throw err;
    // }
    throw new Error('Not implemented — TODO: implement HIBP email check');
  }

  /**
   * Bulk check all emails in a domain.
   * IMPORTANT: HIBP has a rate limit of 1 request/1500ms. Add delay between calls.
   *
   * @param emails Array of email addresses to check
   * @param delayMs Delay between requests (default: 1600ms to stay under rate limit)
   */
  async checkDomain(
    emails: string[],
    delayMs = 1600
  ): Promise<Map<string, HibpBreach[]>> {
    // TODO: implement
    // const results = new Map<string, HibpBreach[]>();
    // for (const email of emails) {
    //   const breaches = await this.checkEmail(email);
    //   results.set(email, breaches);
    //   await new Promise((r) => setTimeout(r, delayMs));
    // }
    // return results;
    throw new Error('Not implemented — TODO: implement HIBP domain bulk check');
  }

  /**
   * Get all breaches in the HIBP database (for reference).
   */
  async getAllBreaches(): Promise<HibpBreach[]> {
    // TODO: implement
    // const response = await axios.get<HibpBreach[]>(`${this.baseUrl}/breaches`);
    // return response.data;
    throw new Error('Not implemented — TODO: implement HIBP all breaches fetch');
  }
}

export const hibpService = new HibpService();
