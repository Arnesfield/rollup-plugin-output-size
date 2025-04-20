import { dim, gray, red, yellow } from 'colorette';
import { COLOR } from '../constants';
import { Options } from '../types/core.types';
import { OutputInfo } from '../types/output.types';
import { getSize } from './size';

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
  return (
    COLOR[info.type](dim(`[${info.type}] `) + info.path + dim(' is ')) +
    yellow(getSize(info, options)) +
    (info.gzip
      ? red(' → ') + yellow(getSize(info.gzip, options)) + gray(' (gzip)')
      : '')
  );
}
