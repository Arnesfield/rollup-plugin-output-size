# rollup-plugin-output-size

[![npm](https://img.shields.io/npm/v/rollup-plugin-output-size.svg)](https://www.npmjs.com/package/rollup-plugin-output-size)
[![Node.js CI](https://github.com/Arnesfield/rollup-plugin-output-size/workflows/Node.js%20CI/badge.svg)](https://github.com/Arnesfield/rollup-plugin-output-size/actions?query=workflow%3A"Node.js+CI")

A Rollup plugin that displays output bundle sizes.

> This project was inspired by [rollup-plugin-bundle-size](https://github.com/vimeo/rollup-plugin-bundle-size).

![rollup-plugin-output-size example output](preview.png)

## Install

```sh
npm install --save-dev rollup-plugin-output-size
```

## Usage

```javascript
// ES6
import outputSize from 'rollup-plugin-output-size';

// CommonJS
const { outputSize } = require('rollup-plugin-output-size');
```

Use the plugin, example `rollup.config.js`:

```javascript
import outputSize from 'rollup-plugin-output-size';

export default {
  input: 'index.js',
  output: { dir: 'dist' },
  plugins: [outputSize(/* plugin options */)]
};
```

## Options

You can change and override the behavior of this plugin through its options. Note that all options are optional.

### hide

Type: `boolean | OutputType[]`<br>
Default: `false`

Disable output types display.

Set to `true` to disable output for all output types, or set an array to specify which output types will not be displayed.

Output types are: `asset`, `chunk`, and `entry`.

> Note: Both `chunk` and `entry` output types are `OutputChunk`s but `entry` chunks have `isEntry` values of `true`.

This option does not affect [`summary`](#summary) output.

### gzip

Type: `boolean | OutputType[]`<br>
Default: `true`

Get gzipped sizes of output.

Set to `false` to skip getting gzipped size, or set an array to only get gzipped sizes of specified output types.

### silent

Type: `boolean`<br>
Default: `false`

Disable output. This will also skip the [`handle`](#handle) and [`summary`](#summary) callbacks.

### summary

Type: `boolean | 'always' | SummaryCallback`<br>
Default: `true`

Display summary output.

- Set to `false` to disable summary output.
- Set to `'always'` to force summary output even if there is only one (1) output.
- Set a callback to override default summary output.

> See types in [`summary.types.ts`](src/types/summary.types.ts).

### handle

Type: `(info: OutputInfo, output: OutputAsset | OutputChunk) => void | Promise<void>`

Override the default logging of output info.

The second argument `output` is the current Rollup output asset or chunk to log, while the first argument is the `OutputInfo`.

> See types in [`output.types.ts`](src/types/output.types.ts).

## Other Utilities

This package also includes some utility functions that you may find helpful, especially when making use of the [`handle`](#handle) and [`summary`](#summary) options.

### format

Type: `(info: OutputInfo) => string`

Used to get the default display format of output info.

```javascript
import outputSize, { format } from 'rollup-plugin-output-size';

export default {
  input: 'index.js',
  output: { dir: 'dist' },
  plugins: [
    outputSize({
      handle(info) {
        console.log(format(info));
      }
    })
  ]
};
```

```text
[{type}] {path} is {hSize} → {gzip.hSize} (gzip)
```

### gzip (util)

Type: `(input: string | Uint8Array) => Promise<Size>`

Used to get the gzipped size of input.

```javascript
import outputSize, { gzip } from 'rollup-plugin-output-size';

export default {
  input: 'index.js',
  output: { dir: 'dist' },
  plugins: [
    outputSize({
      gzip: false,
      async handle(info, output) {
        const data = output.type === 'chunk' ? output.code : output.source;
        const gzipInfo = await gzip(data);
        console.log(info.path, gzipInfo);
      }
    })
  ]
};
```

### summarize

Type: `(summary: Summary) => string`

Used to get the default display format of summary info.

```javascript
import outputSize, { summarize } from 'rollup-plugin-output-size';

export default {
  input: 'index.js',
  output: { dir: 'dist' },
  plugins: [
    outputSize({
      summary(summary) {
        console.log(summarize(summary));
      }
    })
  ]
};
```

```text
[total] {entry.hSize} + {chunk.hSize} + {asset.hSize} = {total.hSize}
[total] {gzip.entry.hSize} + {gzip.chunk.hSize} + {gzip.asset.hSize} = {gzip.total.hSize} (gzip)
```

## License

Licensed under the [MIT License](LICENSE).
