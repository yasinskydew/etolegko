import assert from 'node:assert/strict';
import http from 'node:http';
import { after, before, describe, test } from 'node:test';
import { downloadOnce, runBenchmark } from '../src/utils/download.js';
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

  test('runBenchmark performs 10 sequential full downloads', async () => {
    hitCount = 0;
    const stats = await runBenchmark(`${baseUrl}/ok`, { count: 10 });

    assert.equal(hitCount, 10);
    assert.equal(stats.requestCount, 10);
    assert.equal(stats.totalBytes, payload.length * 10);
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
