import eslint from '@rollup/plugin-eslint';
import typescript from '@rollup/plugin-typescript';
import { createRequire } from 'module';
import { Plugin, RollupOptions } from 'rollup';
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

function noEmit(): Plugin {
  return {
    name: 'no-emit',
    generateBundle(_, bundle) {
      for (const file in bundle) {
        delete bundle[file];
      }
    }
  };
}

function createConfig(options: (false | RollupOptions)[]): RollupOptions[] {
  return options.filter((options): options is RollupOptions => !!options);
}

export default createConfig([
  {
    input,
    external,
    output: [
      { file: pkg.main, format: 'cjs', exports: 'named', sourcemap: PROD },
      { file: pkg.module, format: 'esm', exports: 'named', sourcemap: PROD }
    ],
    plugins: [esbuild(), outputSize()]
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
    plugins: [noEmit(), typescript(), eslint()]
  }
]);
