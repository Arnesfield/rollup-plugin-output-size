import { blue, cyan, dim, gray, magenta, red, yellow } from 'colorette';
import { OutputInfo } from '../types/output.types';

/**
 * Get the default display format of output info.
 * @param info The output info.
 * @returns The display format.
 */
export function format(info: OutputInfo): string {
  const { path, type, hSize, gzip } = info;
  const color = type === 'entry' ? cyan : type === 'chunk' ? blue : magenta;
  const gzipLabel = gzip
    ? red(' → ') + yellow(gzip.hSize) + gray(' (gzip)')
    : '';
  return (
    color(dim(`[${type}] `) + path + dim(' is ')) + yellow(hSize) + gzipLabel
  );
}
