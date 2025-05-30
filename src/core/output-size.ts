import path from 'path';
import { Plugin } from 'rollup';
import { KEYS } from '../constants';
import { Options } from '../types/core.types';
import { OutputInfo } from '../types/output.types';
import { Size } from '../types/size.types';
import { SummaryOutput, SummarySizes } from '../types/summary.types';
import { format } from '../utils/format';
import { formatBytes } from '../utils/format-bytes';
import { gzip } from '../utils/gzip';
import { summarize } from '../utils/summarize';

// same as Summary but props are required
interface PluginSummary extends Required<SummarySizes> {
  gzip?: Required<SummarySizes>;
}

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

  let summaries: SummaryOutput[], summarized: boolean;

  return {
    name: 'output-size',
    outputOptions() {
      summaries = [];
      summarized = false;
    },
    async generateBundle(outputOpts, bundle) {
      if (options.silent) return;

      for (const output of Object.values(bundle)) {
        const isChunk = output.type === 'chunk';
        const type = isChunk && output.isEntry ? 'entry' : output.type;
        const hidden = hide === true || hide.includes(type);
        // skip other checks if no summary is required
        if (!summaryOpts && hidden) continue;

        const data = isChunk ? output.code : output.source;
        const size =
          typeof data === 'string' ? Buffer.byteLength(data) : data.byteLength;
        const hSize = formatBytes(size);
        const filePath = path.join(
          outputOpts.dir || path.dirname(outputOpts.file || ''),
          output.fileName
        );
        const info: OutputInfo = { path: filePath, type, size, hSize };
        if (gzipOpts === true || gzipOpts.includes(type)) {
          info.gzip = await gzip(data);
        }

        summaries.push({ info, output });

        if (hidden) {
          // do nothing
        } else if (typeof options.handle === 'function') {
          await options.handle(info, output);
        } else {
          console.log(format(info, options));
        }
      }
    },
    async writeBundle() {
      if (summarized || !summaryOpts || options.silent) return;
      summarized = true;

      // create summary
      const summary = { gzip: {} } as PluginSummary;
      for (const key of KEYS) {
        summary[key] = { size: 0, hSize: '0 B' };
        summary.gzip![key] = { size: 0, hSize: '0 B' };
      }

      // set summary sizes
      for (const { info } of summaries) {
        summary.total.size += info.size;
        summary[info.type].size += info.size;
        if (!summary.gzip) {
          // exclude gzip if an info does not have gzip size
        } else if (info.gzip) {
          summary.gzip.total.size += info.gzip.size;
          summary.gzip[info.type].size += info.gzip.size;
        } else {
          delete summary.gzip;
        }
      }

      // update hSizes
      const s = (size: Size) => (size.hSize = formatBytes(size.size));
      for (const key of KEYS) {
        s(summary[key]);
        summary.gzip && s(summary.gzip[key]);
      }

      // display summary (preserve `this` for callbacks)
      if (typeof options.summary === 'function') {
        await options.summary(summary, summaries);
      } else if (summaries.length > 1 || summaryOpts === 'always') {
        // by default, show summary only if more than 1 output
        console.log(summarize(summary, options));
      }
    }
  };
}
