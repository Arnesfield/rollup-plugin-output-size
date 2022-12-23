import { blue, cyan, dim, gray, green, magenta, red, yellow } from 'colorette';
import { Summary } from '../types/summary.types';

/**
 * Get the default display format of summary info.
 * @param summary The summary info.
 * @returns The summary format.
 */
export function summarize(summary: Summary): string {
  const { gzip, total } = summary;
  const sizes: string[] = [];
  const gzipSizes: string[] = [];
  const colors = { asset: magenta, chunk: blue, entry: cyan };
  for (const type of ['entry', 'chunk', 'asset'] as const) {
    const color = colors[type];
    const item = summary[type];
    const gzipItem = gzip && gzip[type];
    if (item && item.size > 0) {
      sizes.push(color(item.hSize));
    }
    if (gzipItem && gzipItem.size > 0) {
      gzipSizes.push(color(gzipItem.hSize));
    }
  }
  const plus = red(' + ');
  const equals = red(' = ');
  const totalLabel = dim(green('[total] '));
  const totalStr = totalLabel + sizes.join(plus) + equals + yellow(total.hSize);
  const gzipStr = gzip
    ? '\n' +
      totalLabel +
      gzipSizes.join(plus) +
      equals +
      yellow(gzip.total.hSize) +
      gray(' (gzip)')
    : '';
  return totalStr + gzipStr;
}
