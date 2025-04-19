import { OutputBundle } from 'rollup';
import { OutputInfo, OutputType } from './output.types.js';
import { SummaryCallback } from './summary.types.js';

/** The plugin options. */
export interface Options {
  /**
   * Display the byte size instead of the human-readable size
   * for both the output info and summary output.
   * @default false
   */
  bytes?: boolean;
  /**
   * Disable output types display.
   *
   * Set to `true` to disable output for output types, or set
   * an array to specify which output types will not be displayed.
   *
   * This option does not affect {@linkcode summary} output.
   * @default false
   */
  hide?: boolean | OutputType[];
  /**
   * Get gzipped sizes of output.
   *
   * Set to `false` to skip getting gzipped size, or set an
   * array to only get gzipped sizes of specified output types.
   * @default true
   */
  gzip?: boolean | OutputType[];
  /**
   * Disable output. This will also skip the
   * {@linkcode handle} and {@linkcode summary} callbacks.
   * @default false
   */
  silent?: boolean;
  /**
   * Display summary output.
   * - Set to `false` to disable summary output.
   * - Set to `'always'` to force summary output even if there is only one (1) output.
   * - Set a callback to override default summary output.
   * @default true
   */
  summary?: boolean | 'always' | SummaryCallback;
  /**
   * Override the default logging of output info.
   * @param info The output info (name, size, etc.)
   * @param output The Rollup output chunk or asset.
   */
  handle?(
    info: OutputInfo,
    output: OutputBundle[keyof OutputBundle]
  ): void | Promise<void>;
}

/** @deprecated since v1.4.0. Use {@linkcode Options} instead. */
export type RollupOutputSizeOptions = Options;
