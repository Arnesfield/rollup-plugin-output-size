import path from 'path';
import { Plugin } from 'rollup';
import { TYPES } from '../constants';
import { Options } from '../types/core.types';
import { OutputInfo } from '../types/output.types';
import { Size } from '../types/size.types';
import { Summary, SummaryOutput } from '../types/summary.types';
import { format } from '../utils/format';
import { formatBytes } from '../utils/format-bytes';
import { gzip as getGzip } from '../utils/gzip';
import { summarize } from '../utils/summarize';

/**
 * A Rollup plugin that displays output bundle sizes.
 * @param options The plugin options.
 * @returns The plugin.
 */
export function outputSize(options: Options = {}): Plugin {
  const hide = Array.isArray(options.hide) ? options.hide : options.hide || [];
  const gzipOpts = Array.isArray(options.gzip)
    ? options.gzip
    : options.gzip == null || !!options.gzip || [];
  const summaryOpts = options.summary == null || options.summary;

  let summaries: SummaryOutput[];
  let didSummarize: boolean;

  return {
    name: 'output-size',
    outputOptions() {
      summaries = [];
      didSummarize = false;
    },
    async generateBundle(outputOpts, bundle) {
      if (options.silent) return;

      for (const output of Object.values(bundle)) {
        const isChunk = output.type === 'chunk';
        const type = isChunk && output.isEntry ? 'entry' : output.type;
        const shouldHide = hide === true || hide.includes(type);
        // skip other checks if no summary is required
        if (!summaryOpts && shouldHide) continue;

        const data = isChunk ? output.code : output.source;
        const size =
          typeof data === 'string' ? Buffer.byteLength(data) : data.byteLength;
        const hSize = formatBytes(size);
        const gzip =
          gzipOpts === true || gzipOpts.includes(type)
            ? await getGzip(data)
            : undefined;
        const filePath = path.join(
          outputOpts.dir || path.dirname(outputOpts.file || ''),
          output.fileName
        );
        const info: OutputInfo = { path: filePath, type, size, hSize, gzip };
        summaries.push({ info, output });

        if (shouldHide) {
          // do nothing
        } else if (typeof options.handle === 'function') {
          await options.handle(info, output);
        } else {
          console.log(format(info, options));
        }
      }
    },
    async writeBundle() {
      if (didSummarize || !summaryOpts || options.silent) return;
      didSummarize = true;

      // create summary
      const summary = { gzip: {} } as Summary;
      for (const type of TYPES) {
        summary[type] = { size: 0, hSize: '0 B' };
        summary.gzip![type] = { size: 0, hSize: '0 B' };
      }

      // set summary sizes
      for (const { info } of summaries) {
        summary.total.size += info.size;
        summary[info.type]!.size += info.size;
        if (!summary.gzip) {
          // exclude gzip if an info does not have gzip size
        } else if (info.gzip) {
          summary.gzip.total.size += info.gzip.size;
          summary.gzip[info.type]!.size += info.gzip.size;
        } else {
          delete summary.gzip;
        }
      }

      // update hSizes
      const s = (size: Size) => (size.hSize = formatBytes(size.size));
      for (const type of TYPES) {
        s(summary[type]!);
        summary.gzip && s(summary.gzip[type]!);
      }

      // display summary (preserve `this` for callbacks)
      if (typeof options.summary === 'function') {
        await options.summary(summary, summaries);
      } else if (summaryOpts === 'always' || summaries.length > 1) {
        // by default, show summary only if more than 1 output
        console.log(summarize(summary, options));
      }
    }
  };
}
