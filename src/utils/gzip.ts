import { gzipSize } from 'gzip-size';
import prettyBytes from 'pretty-bytes';
import { Size } from '../types/size.types';

/**
 * Get the gzipped size of input.
 * @param input The input to use.
 * @returns The gzipped size.
 */
export async function gzip(input: string | Uint8Array): Promise<Size> {
  const size = await gzipSize(
    typeof input === 'string' ? input : Buffer.from(input)
  );
  return { size, hSize: prettyBytes(size) };
}
