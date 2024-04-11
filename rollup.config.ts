import _commonjs from '@rollup/plugin-commonjs';
import _eslint from '@rollup/plugin-eslint';
import _nodeResolve from '@rollup/plugin-node-resolve';
import _typescript from '@rollup/plugin-typescript';
import { RollupOptions } from 'rollup';
import dts from 'rollup-plugin-dts';
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
// disable sourcemaps (enable for preview)
const sourcemap = false;

function build() {
  return esbuild({ target: 'esnext' });
}

function defineConfig(options: (false | RollupOptions)[]) {
  return options.filter((options): options is RollupOptions => !!options);
}

export default defineConfig([
  {
    input,
    external,
    output: { file: pkg.module, format: 'esm', sourcemap },
    plugins: [build(), outputSize()]
  },
  {
    input,
    external: external.filter(ext => !esmExternals.includes(ext)),
    output: {
      dir: 'lib',
      format: 'cjs',
      exports: 'named',
      sourcemap,
      entryFileNames: '[name].cjs',
      chunkFileNames: '[name].cjs',
      manualChunks: { vendor: esmExternals }
    },
    plugins: [build(), commonjs(), nodeResolve(), outputSize()]
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
