import prettyBytes from 'pretty-bytes';
import util from 'util';
import zlib from 'zlib';
import { Size } from '../types/size.types';

const _gzip = util.promisify(zlib.gzip);

/**
 * Gets the gzipped size of input.
 * @param input The input to use.
 * @returns The gzipped size.
 */
export async function gzip(input: string | Uint8Array): Promise<Size> {
  const size = input ? (await _gzip(input, { level: 9 })).byteLength : 0;
  return { size, hSize: prettyBytes(size) };
}
