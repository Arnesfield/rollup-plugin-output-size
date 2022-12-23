import { OutputBundle } from 'rollup';
import { OutputInfo, OutputType } from './output.types';
import { Summary, SummaryOutput } from './summary.types';

/**
 * Override summary output.
 * @param summary The summary info.
 * @param outputs List of summary output.
 */
export type SummaryCallback = (
  summary: Summary,
  outputs: SummaryOutput[]
) => void | Promise<void>;

/**
 * Rollup plugin output size options.
 */
export interface RollupOutputSizeOptions {
  /**
   * Set to `true` to disable output for output types (except summary)
   * or set an array to specify which output types will not be displayed.
   * @default false
   */
  hide?: boolean | OutputType[];
  /**
   * Set to `false` to skip getting gzipped size, or set an
   * array to only get gzipped sizes of specified output types.
   * @default true
   */
  gzip?: boolean | OutputType[];
  /**
   * Display summary output.
   *
   * Set to `false` to disable summary output.
   * Set to `always` to force summary output even if
   * there is only one (1) or no output.
   * Set a callback to override default summary output.
   * @default true
   */
  summary?: boolean | 'always' | SummaryCallback;
  /**
   * Disable output. This will also skip the `handle` callback.
   * @default false
   */
  silent?: boolean;
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
