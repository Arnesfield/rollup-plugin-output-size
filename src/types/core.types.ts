import { OutputBundle } from 'rollup';
import { OutputInfo, OutputType } from './output.types';
import { SummaryCallback } from './summary.types';

/** The plugin options. */
export interface Options {
  /**
   * Displays the size in bytes for both the output info and summary output
   * (e.g. `4,096 B` instead of `4.1 kB`).
   * @default false
   * @since v1.6.0
   */
  bytes?: boolean;
  /**
   * Disables output types display.
   *
   * Set to `true` to disable output for output types, or set
   * an array to specify which output types will not be displayed.
   *
   * This option does not affect the {@linkcode summary} output.
   * @default false
   */
  hide?: boolean | OutputType[];
  /**
   * Gets gzipped sizes of output.
   *
   * Set to `false` to skip getting gzipped size, or set an
   * array to only get gzipped sizes of specified output types.
   * @default true
   */
  gzip?: boolean | OutputType[];
  /**
   * Disables output. This will also skip the
   * {@linkcode handle} and {@linkcode summary} callbacks.
   * @default false
   */
  silent?: boolean;
  /**
   * Displays the summary output.
   * - Set to `false` to disable summary output.
   * - Set to `'always'` to force summary output even if there is only one (1) output.
   * - Set a callback to override default summary output.
   * @default true
   */
  summary?: boolean | 'always' | SummaryCallback;
  /**
   * Overrides the default logging of output info.
   * @param info The output info (name, size, etc.)
   * @param output The Rollup output chunk or asset.
   */
  handle?(
    info: OutputInfo,
    output: OutputBundle[keyof OutputBundle]
  ): void | Promise<void>;
}
