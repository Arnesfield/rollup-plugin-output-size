import path from 'path';
import prettyBytes from 'pretty-bytes';
import { Plugin } from 'rollup';
import { gzip as getGzip } from './gzip';
import { OutputInfo, RollupOutputSizeOptions } from './types';
import { format } from './format';

/**
 * A Rollup plugin that displays output bundle sizes.
 * @param options The plugin options.
 * @returns The Rollup plugin.
 */
export function outputSize(options: RollupOutputSizeOptions = {}): Plugin {
  const hide = options.hide || [];
  const gzipOptions = Array.isArray(options.gzip)
    ? options.gzip
    : options.gzip == null || !!options.gzip || []; // unset or truthy
  return {
    name: 'output-size',
    async generateBundle(outputOptions, bundle) {
      if (options.silent) {
        return;
      }
      for (const output of Object.values(bundle)) {
        const isChunk = output.type === 'chunk';
        const type = isChunk && output.isEntry ? 'entry' : output.type;
        if (hide.includes(type)) {
          continue;
        }
        const data = isChunk ? output.code : output.source;
        const size = typeof data === 'string' ? data.length : data.byteLength;
        const hSize = prettyBytes(size);
        const gzip =
          gzipOptions === true || gzipOptions.includes(type)
            ? await getGzip(data)
            : undefined;
        const filePath = path.join(
          outputOptions.dir || path.dirname(outputOptions.file || ''),
          output.fileName
        );
        const info: OutputInfo = { path: filePath, type, size, hSize, gzip };
        if (typeof options.handle === 'function') {
          await options.handle(info, output);
        } else {
          console.log(format(info));
        }
      }
    }
  };
}
