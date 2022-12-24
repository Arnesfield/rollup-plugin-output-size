import { OUTPUT_TYPES } from '../constants';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { RollupOutputSizeOptions } from './core.types';
import { Size } from './size.types';

/**
 * Output type.
 *
 * Both `chunk` and `entry` output types are `OutputChunk`s
 * but `entry` chunks have `isEntry` values of `true`.
 */
export type OutputType = typeof OUTPUT_TYPES[number];

/** Output info. */
export interface OutputInfo extends Size {
  /** Output path. */
  path: string;
  /** Output type. */
  type: OutputType;
  /**
   * The gzipped size of the output. Provided unless the
   * {@link RollupOutputSizeOptions.gzip} option is set to `false`.
   */
  gzip?: Size;
}
