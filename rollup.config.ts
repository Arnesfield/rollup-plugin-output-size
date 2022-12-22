import commonjs from '@rollup/plugin-commonjs';
import eslint from '@rollup/plugin-eslint';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { createRequire } from 'module';
import { RollupOptions } from 'rollup';
import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';
import type Pkg from './package.json';
import outputSize from './src';

const require = createRequire(import.meta.url);
const pkg: typeof Pkg = require('./package.json');
const input = 'src/index.ts';
// skip sourcemap and umd unless production
const WATCH = process.env.ROLLUP_WATCH === 'true';
const PROD = !WATCH || process.env.NODE_ENV === 'production';
const external = Object.keys(pkg.dependencies).concat('path');
const esmExternals = ['gzip-size', 'pretty-bytes'];

function defineConfig(options: (false | RollupOptions)[]) {
  return options.filter((options): options is RollupOptions => !!options);
}

export default defineConfig([
  {
    input,
    external,
    output: { file: pkg.module, format: 'esm', sourcemap: PROD },
    plugins: [esbuild(), outputSize()]
  },
  {
    input,
    external: external.filter(ext => !esmExternals.includes(ext)),
    output: {
      dir: 'lib',
      format: 'cjs',
      exports: 'named',
      sourcemap: PROD,
      entryFileNames: '[name].cjs',
      chunkFileNames: '[name].cjs',
      manualChunks: { vendor: esmExternals }
    },
    plugins: [esbuild(), commonjs(), nodeResolve(), outputSize()]
  },
  {
    input,
    external,
    output: { file: pkg.types, format: 'esm' },
    plugins: [dts(), outputSize()]
  },
  !PROD && {
    input,
    external,
    watch: { skipWrite: true },
    plugins: [eslint(), typescript()]
  }
]);
