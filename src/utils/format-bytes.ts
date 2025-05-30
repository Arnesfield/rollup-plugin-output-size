// NOTE: internal

// probably don't need units after GB
// add these if needed for some reason: 'TB', 'PB', 'EB', 'ZB', 'YB'
const units = ['B', 'kB', 'MB', 'GB'];

/**
 * Formats bytes to human-readable string.
 * - Assume no negative numbers.
 * - Assume no file sizes that could reach TB and above.
 * @param bytes The bytes to format.
 * @returns The formatted bytes.
 * @see https://github.com/sindresorhus/pretty-bytes
 * @see https://gist.github.com/zentala/1e6f72438796d74531803cc3833c039c
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  // prettier-ignore
  const e = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1000)));
  return (
    Number((bytes / 1000 ** e).toFixed(2)).toLocaleString() + ' ' + units[e]
  );
}
