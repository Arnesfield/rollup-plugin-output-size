import { dim, gray, red, yellow } from 'colorette';
import { COLOR } from '../constants.js';
import { Options } from '../types/core.types.js';
import { OutputInfo } from '../types/output.types.js';

/**
 * Gets the default display format of output info.
 * @param info The output info.
 * @param options The format options.
 * @returns The display format.
 */
export function format(
  info: OutputInfo,
  options: Pick<Options, 'bytes'> = {}
): string {
  const prop = options.bytes ? 'size' : 'hSize';
  return (
    COLOR[info.type](dim(`[${info.type}] `) + info.path + dim(' is ')) +
    yellow(info[prop]) +
    (info.gzip ? red(' → ') + yellow(info.gzip[prop]) + gray(' (gzip)') : '')
  );
}
