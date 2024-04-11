// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { RollupOutputSizeOptions } from './core.types.js';
import { Size } from './size.types.js';

/**
 * Output type.
 *
 * Both `chunk` and `entry` output types are `OutputChunk`s
 * but `entry` chunks have `isEntry` values of `true`.
 */
export type OutputType = 'entry' | 'chunk' | 'asset';

/** Output info. */
export interface OutputInfo extends Size {
  /** Output path. */
  path: string;
  /** Output type. */
  type: OutputType;
  /**
   * The gzipped size of the output. Provided unless the
   * {@linkcode RollupOutputSizeOptions.gzip gzip} option is set to `false`.
   */
  gzip?: Size;
}
