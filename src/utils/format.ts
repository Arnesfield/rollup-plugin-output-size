import util from 'util';
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
    util.styleText(
      COLOR[info.type],
      util.styleText('dim', `[${info.type}] `) +
        info.path +
        util.styleText('dim', ' is ')
    ) +
    util.styleText('yellow', getSize(info, options)) +
    (info.gzip
      ? util.styleText('red', ' → ') +
        util.styleText('yellow', getSize(info.gzip, options)) +
        util.styleText('gray', ' (gzip)')
      : '')
  );
}
