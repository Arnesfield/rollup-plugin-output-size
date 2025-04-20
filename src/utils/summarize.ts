import { dim, gray, green, red, yellow } from 'colorette';
import { COLOR, OUTPUT_TYPES } from '../constants';
import { Options } from '../types/core.types';
import { Summary } from '../types/summary.types';
import { getSize } from './size';

/**
 * Creates the summary line.
 * @param sizes Sizes to display.
 * @param total Total size.
 * @returns The summary line.
 */
function line(sizes: string[], total: string | number) {
  return (
    dim(green('[total] ')) +
    (sizes.length > 0 ? sizes.join(red(' + ')) + red(' = ') : '') +
    yellow(total)
  );
}

/**
 * Gets the default display format of summary info.
 * @param summary The summary info.
 * @param options The summary options.
 * @returns The summary format.
 */
export function summarize(
  summary: Summary,
  options: Pick<Options, 'bytes'> = {}
): string {
  const { gzip, total } = summary;
  const sizes: string[] = [];
  const gzipSizes: string[] = [];

  for (const type of OUTPUT_TYPES) {
    const color = COLOR[type];
    const item = summary[type];
    const gzipItem = gzip && gzip[type];
    if (item && item.size > 0) {
      sizes.push(color(getSize(item, options)));
    }
    if (gzipItem && gzipItem.size > 0) {
      gzipSizes.push(color(getSize(gzipItem, options)));
    }
  }

  return (
    line(sizes, getSize(total, options)) +
    (gzip
      ? '\n' + line(gzipSizes, getSize(gzip.total, options)) + gray(' (gzip)')
      : '')
  );
}
