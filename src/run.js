#!/usr/bin/env node
import { runBenchmark } from './utils/download.js';
import { formatReport } from './utils/metrics.js';

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

  try {
    const stats = await runBenchmark(url, {
      onProgress: (line) => console.log(line),
    });
    console.log(formatReport(stats));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

await main();
