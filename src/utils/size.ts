import { Options } from '../types/core.types';
import { Size } from '../types/size.types';

// NOTE: internal

/**
 * Gets the display size.
 * @param size The size object.
 * @param options The options object.
 * @returns The display size.
 */
export function getSize(size: Size, options: Pick<Options, 'bytes'>): string {
  return options.bytes ? size.size.toLocaleString() + ' B' : size.hSize;
}
