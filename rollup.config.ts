import _commonjs from '@rollup/plugin-commonjs';
import _eslint from '@rollup/plugin-eslint';
import _nodeResolve from '@rollup/plugin-node-resolve';
import _typescript from '@rollup/plugin-typescript';
import { RollupOptions } from 'rollup';
import cleanup from 'rollup-plugin-cleanup';
import dts from 'rollup-plugin-dts';
import edit from 'rollup-plugin-edit';
import esbuild from 'rollup-plugin-esbuild';
import pkg from './package.json' with { type: 'json' };
import outputSize from './src/index.js';

// NOTE: remove once import errors are fixed for their respective packages
const commonjs = _commonjs as unknown as typeof _commonjs.default;
const eslint = _eslint as unknown as typeof _eslint.default;
const nodeResolve = _nodeResolve as unknown as typeof _nodeResolve.default;
const typescript = _typescript as unknown as typeof _typescript.default;

// const PROD = process.env.NODE_ENV !== 'development';
const WATCH = process.env.ROLLUP_WATCH === 'true';
const external = Object.keys(pkg.dependencies).concat('path');
const input = 'src/index.ts';
const esmExternals = ['gzip-size', 'pretty-bytes'];
// disable sourcemaps (enable only for preview)
const preview = false;

function build() {
  return esbuild({ target: 'esnext' });
}

function clean() {
  return cleanup({
    comments: ['some', 'sources', /__PURE__/],
    extensions: ['js', 'ts']
  });
}

function defineConfig(options: (false | RollupOptions)[]) {
  return options.filter((options): options is RollupOptions => !!options);
}

export default defineConfig([
  {
    input,
    external,
    output: { file: pkg.module, format: 'esm', sourcemap: preview },
    plugins: [build(), clean(), outputSize()]
  },
  {
    input,
    external: external.filter(ext => !esmExternals.includes(ext)),
    output: {
      dir: 'lib',
      format: 'cjs',
      exports: 'named',
      sourcemap: preview,
      entryFileNames: '[name].cjs',
      chunkFileNames: '[name].cjs',
      manualChunks: { vendor: esmExternals }
    },
    plugins: [
      build(),
      clean(),
      commonjs(),
      nodeResolve(),
      // remove unused requires from gzip-size
      edit({
        chunk(data) {
          const pkgs = ['stream', 'node:fs', 'node:stream'];
          let edited = false;
          let { contents } = data;
          for (const pkg of pkgs) {
            const match = `require('${pkg}');\n`;
            if (!contents.includes(match)) {
              continue;
            } else if (!preview) {
              console.log('[edit] %s: removing require %o', data.fileName, pkg);
            }
            edited = true;
            contents = contents.replace(match, '');
          }
          if (edited) {
            return contents;
          }
        }
      }),
      outputSize()
    ]
  },
  {
    input,
    output: { file: pkg.types, format: 'esm' },
    plugins: [dts(), outputSize()]
  },
  WATCH && {
    input,
    external,
    watch: { skipWrite: true },
    plugins: [eslint(), typescript()]
  }
]);
