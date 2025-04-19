import _commonjs from '@rollup/plugin-commonjs';
import _eslint from '@rollup/plugin-eslint';
import _nodeResolve from '@rollup/plugin-node-resolve';
import _typescript from '@rollup/plugin-typescript';
import { PluginImpl, RollupOptions } from 'rollup';
import cleanup from 'rollup-plugin-cleanup';
import _dts, { Options as DtsOptions } from 'rollup-plugin-dts';
import _esbuild, { Options as EsbuildOptions } from 'rollup-plugin-esbuild';
import nodeExternals from 'rollup-plugin-node-externals';
import pkg from './package.json' with { type: 'json' };
import outputSize from './src/index.js';

// NOTE: remove once import errors are fixed for their respective packages
const commonjs = _commonjs as unknown as typeof _commonjs.default;
const eslint = _eslint as unknown as typeof _eslint.default;
const nodeResolve = _nodeResolve as unknown as typeof _nodeResolve.default;
const typescript = _typescript as unknown as typeof _typescript.default;
// for some reason, typescript rollup plugin doesn't recognize these properly
const dts = _dts as unknown as PluginImpl<DtsOptions>;
const esbuild = _esbuild as unknown as PluginImpl<EsbuildOptions>;

const WATCH = process.env.ROLLUP_WATCH === 'true';
const input = 'src/index.ts';
// esm dependencies to bundle into vendor.cjs
const esmExternals = ['pretty-bytes'];
// disable sourcemaps (enable only for preview)
const preview = false;
const bytes = true;

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
      manualChunks: { vendor: esmExternals }
    },
    plugins: [
      build(),
      clean(),
      commonjs(),
      nodeResolve(),
      // exclude esm dependencies from external
      // since they will be bundled into vendor.cjs
      nodeExternals({ exclude: esmExternals }),
      size()
    ]
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
