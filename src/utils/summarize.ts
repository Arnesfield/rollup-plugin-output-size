import { dim, gray, green, red, yellow } from 'colorette';
import { COLOR, OUTPUT_TYPES } from '../constants';
import { Summary } from '../types/summary.types';

/**
 * Create summary line.
 * @param sizes Sizes to display.
 * @param total Total size.
 * @returns The summary line.
 */
function line(sizes: string[], total: string) {
  return (
    dim(green('[total] ')) + sizes.join(red(' + ')) + red(' = ') + yellow(total)
  );
}

/**
 * Get the default display format of summary info.
 * @param summary The summary info.
 * @returns The summary format.
 */
export function summarize(summary: Summary): string {
  const { gzip, total } = summary;
  const sizes: string[] = [];
  const gzipSizes: string[] = [];
  for (const type of OUTPUT_TYPES) {
    const color = COLOR[type];
    const item = summary[type];
    if (item.size > 0) {
      sizes.push(color(item.hSize));
    }
    if (gzip && gzip[type].size > 0) {
      gzipSizes.push(color(gzip[type].hSize));
    }
  }
  return (
    line(sizes, total.hSize) +
    (gzip ? '\n' + line(gzipSizes, gzip.total.hSize) + gray(' (gzip)') : '')
  );
}
