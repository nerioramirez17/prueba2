/**
 * URLScan.io Service
 * Submits URLs for scanning and retrieves analysis results.
 *
 * Docs: https://urlscan.io/docs/api/
 */

import axios from 'axios';

interface UrlScanSubmitResponse {
  message: string;
  uuid: string;
  result: string;
  api: string;
  visibility: string;
  url: string;
}

interface UrlScanResult {
  uuid: string;
  url: string;
  finalUrl: string;
  title: string;
  screenshot: string;
  verdicts: {
    overall: {
      score: number;
      malicious: boolean;
      hasVerdicts: boolean;
      tags: string[];
    };
  };
  stats: {
    malicious: number;
    suspicious: number;
    harmless: number;
  };
  page: {
    domain: string;
    country: string;
    ip: string;
    server: string;
  };
}

export class UrlScanService {
  private readonly apiKey = process.env.URLSCAN_API_KEY ?? '';
  private readonly baseUrl = 'https://urlscan.io/api/v1';

  /**
   * Submit a URL for scanning.
   * Returns a UUID to poll for results.
   */
  async submit(url: string, visibility: 'public' | 'private' = 'private'): Promise<UrlScanSubmitResponse> {
    // TODO: implement
    // const response = await axios.post(
    //   `${this.baseUrl}/scan/`,
    //   { url, visibility },
    //   { headers: { 'API-Key': this.apiKey, 'Content-Type': 'application/json' } }
    // );
    // return response.data;
    throw new Error('Not implemented — TODO: implement URLScan.io submission');
  }

  /**
   * Poll for scan results. URLScan usually takes 5-15 seconds.
   * Retry up to maxAttempts times with a delay between each.
   */
  async getResult(uuid: string, maxAttempts = 10, delayMs = 3000): Promise<UrlScanResult> {
    // TODO: implement
    // for (let i = 0; i < maxAttempts; i++) {
    //   try {
    //     const response = await axios.get(`${this.baseUrl}/result/${uuid}/`);
    //     return response.data;
    //   } catch (err: any) {
    //     if (err.response?.status === 404) {
    //       // Not ready yet, wait and retry
    //       await new Promise((r) => setTimeout(r, delayMs));
    //     } else throw err;
    //   }
    // }
    // throw new Error('URLScan result timeout');
    throw new Error('Not implemented — TODO: implement URLScan.io result polling');
  }

  /**
   * Full scan pipeline: submit → wait → return result.
   */
  async scan(url: string): Promise<UrlScanResult> {
    const submission = await this.submit(url, 'private');
    return this.getResult(submission.uuid);
  }
}

export const urlscanService = new UrlScanService();
