import assert from 'node:assert/strict';
import http from 'node:http';
import { after, before, describe, test } from 'node:test';
import { downloadOnce, runBenchmark } from '../src/utils/download.js';
import { formatProgress, formatReport } from '../src/utils/metrics.js';
import { parseHttpUrl } from '../src/utils/url.js';

describe('download-test', () => {
  /** @type {http.Server} */
  let server;
  /** @type {string} */
  let baseUrl;
  let hitCount = 0;
  const payload = Buffer.alloc(1024 * 64, 7);

  before(async () => {
    server = http.createServer((req, res) => {
      if (req.url === '/ok') {
        hitCount += 1;
        res.writeHead(200, {
          'Content-Type': 'application/octet-stream',
          'Content-Length': payload.length,
        });
        res.end(payload);
        return;
      }

      if (req.url === '/fail') {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('error');
        return;
      }

      res.writeHead(404);
      res.end();
    });

    await new Promise((resolve) => {
      server.listen(0, '127.0.0.1', resolve);
    });

    const address = server.address();
    assert.ok(address && typeof address === 'object');
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  after(async () => {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  test('downloadOnce reads full response body', async () => {
    const result = await downloadOnce(parseHttpUrl(`${baseUrl}/ok`));
    assert.equal(result.bytes, payload.length);
    assert.ok(result.elapsedMs >= 0);
  });

  test('runBenchmark performs 10 sequential full downloads', async () => {
    hitCount = 0;
    const progress = [];
    const stats = await runBenchmark(`${baseUrl}/ok`, {
      count: 10,
      onProgress: (line) => progress.push(line),
    });

    assert.equal(hitCount, 10);
    assert.equal(stats.requestCount, 10);
    assert.equal(stats.totalBytes, payload.length * 10);
    assert.equal(progress.length, 10);
    assert.match(progress[0], /^\[1\/10]/);
    assert.match(progress[9], /^\[10\/10]/);
    assert.ok(stats.averageMs >= 0);
    assert.ok(stats.speedMiBs >= 0);

    const report = formatReport(stats);
    assert.match(report, /Average request time:/);
    assert.match(report, /MiB\/s/);
  });

  test('runBenchmark without onProgress does not throw', async () => {
    const stats = await runBenchmark(`${baseUrl}/ok`, { count: 2 });
    assert.equal(stats.requestCount, 2);
    assert.equal(stats.totalBytes, payload.length * 2);
  });

  test('formatProgress includes iteration metrics', () => {
    const line = formatProgress({
      index: 3,
      count: 10,
      bytes: payload.length,
      elapsedMs: 12.345,
    });
    assert.match(line, /^\[3\/10\] 12\.35 ms,/);
    assert.match(line, /MiB\/s$/);
  });

  test('downloadOnce rejects non-2xx responses', async () => {
    await assert.rejects(
      () => downloadOnce(parseHttpUrl(`${baseUrl}/fail`)),
      /HTTP 500/,
    );
  });

  test('parseHttpUrl rejects invalid URL', () => {
    assert.throws(
      () => parseHttpUrl('not-a-url'),
      /Invalid URL/,
    );
  });
});
