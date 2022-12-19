import { OutputBundle } from 'rollup';

/** Output type. */
export type OutputType = OutputBundle[keyof OutputBundle]['type'] | 'entry';

/** Output info gzip. */
export interface OutputInfoGzip {
  /** The gzipped size. */
  size: number;
  /** Human readable gzipped size. */
  hSize: string;
}

/** Output info. */
export interface OutputInfo {
  /** Output path. */
  path: string;
  /** Output type. */
  type: OutputType;
  /** Output size. */
  size: number;
  /** Human readable output size. */
  hSize: string;
  /**
   * The gzipped size of the output. Provided
   * unless the `gzip` option is set to `false`.
   */
  gzip?: OutputInfoGzip;
}

/**
 * Rollup plugin output size options.
 */
export interface RollupOutputSizeOptions {
  /**
   * Specify which output types will not be displayed.
   */
  hide?: OutputType[];
  /**
   * Set to `false` to skip getting gzipped size, or set an
   * array to only get gzipped sizes of specified output types.
   * @default true
   */
  gzip?: boolean | OutputType[];
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
