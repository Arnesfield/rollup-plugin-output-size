import eslint from '@rollup/plugin-eslint';
import typescript from '@rollup/plugin-typescript';
import { RollupOptions } from 'rollup';
import cleanup from 'rollup-plugin-cleanup';
import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';
import nodeExternals from 'rollup-plugin-node-externals';
import pkg from './package.json' with { type: 'json' };
import outputSize from './src';

// disable sourcemaps (enable only for preview)
const preview = false;
const bytes = true;

const WATCH = process.env.ROLLUP_WATCH === 'true';
const input = 'src/index.ts';

// for preview mode utils chunk
const utils = [
  'src/utils/format.ts',
  'src/utils/gzip.ts',
  'src/utils/summarize.ts'
];

function build() {
  return esbuild({ target: 'esnext' });
}

function clean() {
  return cleanup({
    comments: ['some', 'sources', /__PURE__/],
    extensions: ['js', 'ts']
  });
}

function size() {
  return outputSize({ bytes });
}

function defineConfig(options: (false | RollupOptions)[]) {
  return options.filter((options): options is RollupOptions => !!options);
}

export default defineConfig([
  {
    input,
    output: { file: pkg.module, format: 'esm', sourcemap: preview },
    plugins: [build(), clean(), nodeExternals(), size()]
  },
  {
    input,
    output: {
      dir: 'lib',
      format: 'cjs',
      exports: 'named',
      sourcemap: preview,
      entryFileNames: '[name].cjs',
      chunkFileNames: '[name].cjs',
      // for preview mode, create a separate chunk for utils
      manualChunks: preview ? { utils } : undefined
    },
    plugins: [build(), clean(), nodeExternals(), size()]
  },
  {
    input,
    output: { file: pkg.types, format: 'esm' },
    plugins: [dts(), size()]
  },
  WATCH && {
    input,
    watch: { skipWrite: true },
    plugins: [eslint(), typescript(), nodeExternals()]
  }
]);
