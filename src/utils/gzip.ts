import prettyBytes from 'pretty-bytes';
import { promisify } from 'util';
import { gzip as __gzip } from 'zlib';
import { Size } from '../types/size.types.js';

const _gzip = promisify(__gzip);

/**
 * Get the gzipped size of input.
 * @param input The input to use.
 * @returns The gzipped size.
 */
export async function gzip(input: string | Uint8Array): Promise<Size> {
  const size = input ? (await _gzip(input, { level: 9 })).byteLength : 0;
  return { size, hSize: prettyBytes(size) };
}
