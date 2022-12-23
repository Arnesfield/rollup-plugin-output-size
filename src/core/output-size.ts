import path from 'path';
import prettyBytes from 'pretty-bytes';
import { Plugin } from 'rollup';
import { OUTPUT_TYPES } from '../constants';
import { RollupOutputSizeOptions } from '../types/core.types';
import { OutputInfo, OutputType } from '../types/output.types';
import { Summary, SummaryOutput } from '../types/summary.types';
import { format } from '../utils/format';
import { gzip as getGzip } from '../utils/gzip';
import { summarize } from '../utils/summarize';

/**
 * A Rollup plugin that displays output bundle sizes.
 * @param options The plugin options.
 * @returns The Rollup plugin.
 */
export function outputSize(options: RollupOutputSizeOptions = {}): Plugin {
  const hide = Array.isArray(options.hide) ? options.hide : options.hide || [];
  const gzipOptions = Array.isArray(options.gzip)
    ? options.gzip
    : options.gzip == null || !!options.gzip || []; // unset or truthy
  const oSummary =
    typeof options.summary === 'function'
      ? options.summary
      : options.summary == null || options.summary; // unset or truthy
  let summaryOutputs: SummaryOutput[] = [];
  return {
    name: 'output-size',
    outputOptions() {
      summaryOutputs = [];
    },
    async generateBundle(outputOptions, bundle) {
      if (options.silent) {
        return;
      }
      for (const output of Object.values(bundle)) {
        const isChunk = output.type === 'chunk';
        const type = isChunk && output.isEntry ? 'entry' : output.type;
        const shouldHide = hide === true || hide.includes(type);
        // skip other checks if no summary is required
        if (!oSummary && shouldHide) {
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
        summaryOutputs.push({ info, output });
        if (shouldHide) {
          // do nothing
        } else if (typeof options.handle === 'function') {
          await options.handle(info, output);
        } else {
          console.log(format(info));
        }
      }
    },
    async writeBundle() {
      if (!oSummary || options.silent) {
        return;
      }
      interface SizeItem {
        size: number;
        gzip: number;
      }
      const getSizeItem = (): SizeItem => ({ size: 0, gzip: 0 });
      const sizes: { [Key in OutputType]?: SizeItem } = {};
      const total = getSizeItem();
      let includeGzip = true;
      for (const { info } of summaryOutputs) {
        const size = (sizes[info.type] ||= getSizeItem());
        size.size += info.size;
        total.size += info.size;
        // exclude gzip if an info does not have gzip size
        if (includeGzip && info.gzip) {
          size.gzip += info.gzip.size;
          total.gzip += info.gzip.size;
        } else {
          includeGzip = false;
        }
      }
      // create summary
      const summary = {
        total: { size: total.size, hSize: prettyBytes(total.size) },
        gzip: includeGzip
          ? { total: { size: total.gzip, hSize: prettyBytes(total.gzip) } }
          : undefined
      } as Summary;
      for (const type of OUTPUT_TYPES) {
        const size = sizes[type] || getSizeItem();
        summary[type] = { size: size.size, hSize: prettyBytes(size.size) };
        if (summary.gzip) {
          summary.gzip[type] = {
            size: size.gzip,
            hSize: prettyBytes(size.gzip)
          };
        }
      }
      // display summary
      if (typeof oSummary === 'function') {
        await oSummary(summary, summaryOutputs);
      } else if (oSummary === 'always' || summaryOutputs.length > 1) {
        // show summary only if more than 1 output
        console.log(summarize(summary));
      }
    }
  };
}
