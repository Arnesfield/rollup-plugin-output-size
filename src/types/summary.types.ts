import { OutputBundle } from 'rollup';
import { OutputInfo } from './output.types';
import { Size } from './size.types';

/** Summary sizes. */
export interface SummarySizes {
  /** Asset total size. */
  asset?: Size;
  /** Chunk total size. */
  chunk?: Size;
  /** Entry total size. */
  entry?: Size;
  /** Total size of all output types. */
  total: Size;
}

/** Summary info. */
export interface Summary extends SummarySizes {
  /** Gzipped sizes. */
  gzip?: SummarySizes;
}

/** Summary output. */
export interface SummaryOutput {
  /** Output info. */
  info: OutputInfo;
  /** The Rollup output chunk or asset. */
  output: OutputBundle[keyof OutputBundle];
}

/**
 * Overrides the summary output.
 * @param summary The summary info.
 * @param outputs List of summary output.
 */
export type SummaryCallback = (
  summary: Summary,
  outputs: SummaryOutput[]
) => void | Promise<void>;
