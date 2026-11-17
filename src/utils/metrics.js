const BYTES_PER_MIB = 1024 * 1024;

/**
 * @param {number} bytes
 * @returns {number}
 */
export function bytesToMiB(bytes) {
  return bytes / BYTES_PER_MIB;
}

/**
 * @param {number} bytes
 * @param {number} elapsedMs
 * @returns {number}
 */
export function calcSpeedMiBs(bytes, elapsedMs) {
  if (elapsedMs <= 0) {
    return 0;
  }

  return bytesToMiB(bytes) / (elapsedMs / 1000);
}

/**
 * @param {{ index: number, count: number, bytes: number, elapsedMs: number }} progress
 * @returns {string}
 */
export function formatProgress({ index, count, bytes, elapsedMs }) {
  return (
    `[${index}/${count}] ${elapsedMs.toFixed(2)} ms, ` +
    `${bytesToMiB(bytes).toFixed(3)} MiB, ${calcSpeedMiBs(bytes, elapsedMs).toFixed(3)} MiB/s`
  );
}

/**
 * @param {{ requestCount: number, totalBytes: number, totalElapsedMs: number }} partial
 */
export function summarizeResults({ requestCount, totalBytes, totalElapsedMs }) {
  return {
    requestCount,
    totalBytes,
    totalElapsedMs,
    averageMs: requestCount > 0 ? totalElapsedMs / requestCount : 0,
    totalMiB: bytesToMiB(totalBytes),
    speedMiBs: calcSpeedMiBs(totalBytes, totalElapsedMs),
  };
}

/**
 * @param {{
 *   requestCount: number,
 *   averageMs: number,
 *   totalMiB: number,
 *   totalBytes: number,
 *   speedMiBs: number,
 * }} stats
 */
export function formatReport(stats) {
  return [
    `Requests: ${stats.requestCount}`,
    `Average request time: ${stats.averageMs.toFixed(2)} ms`,
    `Total downloaded: ${stats.totalMiB.toFixed(3)} MiB (${stats.totalBytes} bytes)`,
    `Download speed: ${stats.speedMiBs.toFixed(3)} MiB/s`,
  ].join('\n');
}
