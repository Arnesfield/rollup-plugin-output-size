import { OUTPUT_TYPES } from '../constants';
import { Size } from './size.types';

/** Output type. */
export type OutputType = typeof OUTPUT_TYPES[number];

/** Output info. */
export interface OutputInfo extends Size {
  /** Output path. */
  path: string;
  /** Output type. */
  type: OutputType;
  /**
   * The gzipped size of the output. Provided
   * unless the `gzip` option is set to `false`.
   */
  gzip?: Size;
}
