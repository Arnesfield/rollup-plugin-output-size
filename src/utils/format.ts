import { dim, gray, red, yellow } from 'colorette';
import { COLOR } from '../constants.js';
import { OutputInfo } from '../types/output.types.js';

/**
 * Get the default display format of output info.
 * @param info The output info.
 * @returns The display format.
 */
export function format(info: OutputInfo): string {
  return (
    COLOR[info.type](dim(`[${info.type}] `) + info.path + dim(' is ')) +
    yellow(info.hSize) +
    (info.gzip ? red(' → ') + yellow(info.gzip.hSize) + gray(' (gzip)') : '')
  );
}
