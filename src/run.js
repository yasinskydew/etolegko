#!/usr/bin/env node
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { runBenchmark } from './utils/download.js';
import { formatReport } from './utils/metrics.js';

const METRICS_FILE = path.resolve('metrics.txt');

function printUsage() {
  console.error('Usage: node src/run.js <url>');
}

async function main() {
  const url = process.argv[2];
  if (!url) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  console.log(`Starting download benchmark: ${url}`);

  try {
    const stats = await runBenchmark(url);
    const report = formatReport(stats);
    const content = [
      `Timestamp: ${new Date().toISOString()}`,
      report,
    ].join('\n');

    await writeFile(METRICS_FILE, `${content}\n`, 'utf8');
    console.log(`Download speed: ${stats.speedMiBs.toFixed(3)} MiB/s`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

await main();
