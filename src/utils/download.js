import http from 'node:http';
import https from 'node:https';
import { formatProgress, summarizeResults } from './metrics.js';
import { parseHttpUrl } from './url.js';

const REQUEST_COUNT = 10;

/**
 * @param {URL} url
 * @param {http.Agent | https.Agent} [agent]
 * @returns {Promise<{ bytes: number, elapsedMs: number }>}
 */
export function downloadOnce(url, agent) {
  return new Promise((resolve, reject) => {
    const transport = url.protocol === 'https:' ? https : http;
    const startedAt = process.hrtime.bigint();
    let bytes = 0;

    const req = transport.get(url, { agent }, (res) => {
      if (res.statusCode !== undefined && (res.statusCode < 200 || res.statusCode >= 300)) {
        res.resume();
        reject(new Error(`HTTP ${res.statusCode} for ${url.href}`));
        return;
      }

      res.on('data', (chunk) => {
        bytes += chunk.length;
      });

      res.on('end', () => {
        const elapsedNs = process.hrtime.bigint() - startedAt;
        const elapsedMs = Number(elapsedNs) / 1e6;
        resolve({ bytes, elapsedMs });
      });

      res.on('error', reject);
    });

    req.on('error', reject);
  });
}

/**
 * @param {string} rawUrl
 * @param {{
 *   count?: number,
 *   onProgress?: (line: string) => void,
 * }} [options]
 */
export async function runBenchmark(rawUrl, options = {}) {
  const count = options.count ?? REQUEST_COUNT;
  const onProgress = options.onProgress;
  const url = parseHttpUrl(rawUrl);
  const Agent = url.protocol === 'https:' ? https.Agent : http.Agent;
  const agent = new Agent({ keepAlive: true, maxSockets: 1 });

  let totalBytes = 0;
  let totalElapsedMs = 0;

  try {
    for (let i = 0; i < count; i += 1) {
      // Sequential by design: wait for a full response before the next request.
      const result = await downloadOnce(url, agent);
      totalBytes += result.bytes;
      totalElapsedMs += result.elapsedMs;

      if (onProgress) {
        onProgress(formatProgress({
          index: i + 1,
          count,
          bytes: result.bytes,
          elapsedMs: result.elapsedMs,
        }));
      }
    }
  } finally {
    agent.destroy();
  }

  return summarizeResults({
    requestCount: count,
    totalBytes,
    totalElapsedMs,
  });
}
