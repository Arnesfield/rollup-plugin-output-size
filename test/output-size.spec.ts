import { expect } from 'chai';
import path from 'path';
import { rimraf } from 'rimraf';
import { rollup, RollupOptions } from 'rollup';
import { spy } from 'sinon';
import { fileURLToPath } from 'url';
import { OUTPUT_TYPES } from '../src/constants';
import {
  Options,
  OutputInfo,
  outputSize,
  OutputType,
  SummaryCallback
} from '../src';

type Handle = Exclude<Options['handle'], undefined>;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function file(value: string) {
  return path.relative(process.cwd(), path.resolve(__dirname, value));
}

const inputs = {
  add: file('fixtures/add.js'),
  main: file('fixtures/main.js'),
  index: file('fixtures/index.js'),
  tmp: file('fixtures/tmp')
};

async function bundle(write: boolean, options: RollupOptions): Promise<void>;
async function bundle(options: RollupOptions): Promise<void>;

// generate bundle
async function bundle(
  writeOrOptions: boolean | RollupOptions,
  options?: RollupOptions
) {
  options =
    typeof writeOrOptions === 'boolean' ? options || {} : writeOrOptions;
  const write = typeof writeOrOptions === 'boolean' && writeOrOptions;
  const build = await rollup(options);
  const outputs = Array.isArray(options.output)
    ? options.output
    : options.output
      ? [options.output]
      : [];
  await Promise.all(
    outputs.map(async output => {
      await build.generate(output);
      write && (await build.write(output));
    })
  );
}

function expectOutputInfo(info: OutputInfo) {
  expect(info).to.be.an('object');
  expect(info).to.have.property('path').that.is.a('string');
  expect(info).to.have.property('type').that.is.a('string');
  expect(info).to.have.property('size').that.is.a('number');
  expect(info).to.have.property('hSize').that.equals(`${info.size} B`);
  expect(info).to.have.property('gzip').that.is.an('object');
  if (info.gzip) {
    expect(info.gzip).to.have.property('size').that.is.a('number');
    expect(info.gzip)
      .to.have.property('hSize')
      .that.equals(`${info.gzip.size} B`);
  }
}

describe('outputSize', () => {
  it('should be a function', () => {
    expect(outputSize).to.be.a('function');
  });

  it('should return an object (plugin)', () => {
    const plugin = outputSize();
    expect(plugin).to.be.an('object');
    expect(plugin).to.have.property('name').that.equals('output-size');
    expect(plugin).to.have.property('generateBundle').which.is.a('function');
  });
});

describe('options', () => {
  // ensure handle() gets called since this
  // will be used to test other functionality
  describe('handle', () => {
    it('should be called when generating build', async () => {
      const handle = spy<Handle>(() => {});
      const plugin = outputSize({ handle });
      expect(handle.calledOnce).to.be.false;
      await bundle({
        input: inputs.add,
        output: { dir: inputs.tmp },
        plugins: [plugin]
      });
      expect(handle.calledOnce).to.be.true;
    });

    it('should receive entry output type', async () => {
      const handle = spy<Handle>((info, output) => {
        expectOutputInfo(info);
        expect(info.path).to.equal(`${inputs.tmp}/add.js`);
        expect(info.type).to.equal('entry');
        expect(output)
          .to.be.an('object')
          .with.property('type')
          .that.equals('chunk');
      });
      await bundle({
        input: inputs.add,
        output: { dir: inputs.tmp },
        plugins: [outputSize({ handle })]
      });
      expect(handle.calledOnce).to.be.true;
    });

    it('should receive asset output type', async () => {
      const types: OutputType[] = [];
      const handle = spy<Handle>(info => {
        expectOutputInfo(info);
        const name = info.type === 'asset' ? 'add.js.map' : 'add.js';
        expect(info.path).to.equal(`${inputs.tmp}/${name}`);
        types.push(info.type);
      });
      await bundle({
        input: inputs.add,
        output: { dir: inputs.tmp, sourcemap: true },
        plugins: [outputSize({ handle })]
      });
      expect(handle.calledTwice).to.be.true;
      expect(types).to.contain('asset');
      expect(types).to.contain('entry');
    });

    it('should receive chunk output type', async () => {
      const types: OutputType[] = [];
      const handle = spy<Handle>(info => {
        expectOutputInfo(info);
        const chunk = `${inputs.tmp}/shared/add.js`;
        expect(info.path).to.have.oneOf([
          chunk,
          `${inputs.tmp}/index.js`,
          `${inputs.tmp}/main.js`
        ]);
        if (info.type === 'chunk') {
          expect(info.path).to.equal(chunk);
        }
        types.push(info.type);
      });
      await bundle({
        input: { main: inputs.main, index: inputs.index },
        output: { dir: inputs.tmp, chunkFileNames: 'shared/[name].js' },
        plugins: [outputSize({ handle })]
      });
      expect(handle.calledThrice).to.be.true;
      expect(types.filter(type => type === 'entry')).to.have.length(2);
      expect(types.filter(type => type === 'chunk')).to.have.length(1);
    });
  });

  describe('hide', () => {
    it('should hide all output types when `true`', async () => {
      const handle = spy<Handle>(() => {});
      await bundle({
        input: { main: inputs.main, index: inputs.index },
        output: { dir: inputs.tmp, sourcemap: true },
        plugins: [outputSize({ handle, hide: true })]
      });
      expect(handle.called).to.be.false;
    });

    it('should hide entry output type', async () => {
      const handle = spy<Handle>(info => {
        expect(info.type).to.equal('asset');
      });
      await bundle({
        input: inputs.add,
        output: { dir: inputs.tmp, sourcemap: true },
        plugins: [outputSize({ handle, hide: ['entry'] })]
      });
      // calls once for asset (sourcemap)
      expect(handle.calledOnce).to.be.true;
    });

    it('should hide asset output type', async () => {
      const handle2 = spy<Handle>(() => {});
      await bundle({
        input: inputs.add,
        output: { dir: inputs.tmp, sourcemap: true },
        plugins: [outputSize({ handle: handle2, hide: ['asset', 'entry'] })]
      });
      expect(handle2.called).to.be.false;
    });

    it('should hide chunk output type', async () => {
      const handle = spy<Handle>(() => {});
      await bundle({
        input: { main: inputs.main, index: inputs.index },
        output: { dir: inputs.tmp, sourcemap: true },
        plugins: [outputSize({ handle, hide: ['asset', 'chunk', 'entry'] })]
      });
      expect(handle.called).to.be.false;
    });
  });

  describe('silent', () => {
    it('should disable output', async () => {
      const handle1 = spy<Handle>(() => {});
      const handle2 = spy<Handle>(() => {});
      await bundle({
        input: { main: inputs.main, index: inputs.index },
        output: { dir: inputs.tmp, sourcemap: true },
        plugins: [
          outputSize({ handle: handle1, silent: true }),
          outputSize({ handle: handle2, silent: false })
        ]
      });
      expect(handle1.called).to.be.false;
      // 2 entry + 1 chunk + 3 assets
      expect(handle2.callCount).to.equal(6);
    });
  });

  describe('gzip', () => {
    it('should get gzipped sizes by default', async () => {
      const handle = spy<Handle>(info => {
        expect(info.gzip).to.be.an('object');
      });
      await bundle({
        input: inputs.add,
        output: { dir: inputs.tmp, sourcemap: true },
        plugins: [outputSize({ handle })]
      });
      expect(handle.calledTwice).to.be.true;
    });

    it('should not get gzipped sizes when `false`', async () => {
      const handle = spy<Handle>(info => {
        expect(info.gzip).to.be.undefined;
      });
      await bundle({
        input: { main: inputs.main, index: inputs.index },
        output: { dir: inputs.tmp, sourcemap: true },
        plugins: [outputSize({ handle, gzip: false })]
      });
      expect(handle.called).to.be.true;
    });

    it('should only get gzipped sizes of specified output types', async () => {
      const handle = spy<Handle>(info => {
        if (info.type === 'asset') {
          expect(info.gzip).to.be.undefined;
        } else {
          expect(info.gzip).to.be.an('object');
        }
      });
      await bundle({
        input: { main: inputs.main, index: inputs.index },
        output: { dir: inputs.tmp, sourcemap: true },
        plugins: [outputSize({ handle, gzip: ['chunk', 'entry'] })]
      });
      expect(handle.called).to.be.true;
    });
  });

  describe('summary', () => {
    // remove tmp dir after build.write()
    afterEach(async () => {
      await rimraf(file('fixtures/tmp'));
    });

    it('should be called when writing build', async () => {
      const summary = spy<SummaryCallback>(() => {});
      const plugin = outputSize({ hide: true, summary });
      expect(summary.calledOnce).to.be.false;
      await bundle(true, {
        input: inputs.add,
        output: { dir: inputs.tmp },
        plugins: [plugin]
      });
      expect(summary.calledOnce).to.be.true;
    });

    it('should be called once for multiple outputs', async () => {
      const summary = spy<SummaryCallback>(() => {});
      const plugin = outputSize({ hide: true, summary });
      expect(summary.calledOnce).to.be.false;
      await bundle(true, {
        input: inputs.index,
        output: [
          { dir: inputs.tmp },
          { dir: `${inputs.tmp}/dir1` },
          { dir: `${inputs.tmp}/dir2` }
        ],
        plugins: [plugin]
      });
      expect(summary.calledOnce).to.be.true;
    });

    it('should include summary info', async () => {
      const summary = spy<SummaryCallback>((summary, outputs) => {
        expect(summary).to.be.an('object');
        expect(summary).to.have.property('total').that.is.an('object');
        expect(summary).to.have.property('gzip').that.is.an('object');
        expect(summary.gzip).to.have.property('total').that.is.an('object');
        for (const type of OUTPUT_TYPES) {
          expect(summary).to.have.property(type).that.is.an('object');
          expect(summary.gzip).to.have.property(type).that.is.an('object');
        }
        expect(outputs).to.be.an('array');
        expect(outputs).to.have.length(1);
        expect(outputs[0]).to.be.an('object');
        // total should match
        const total = { size: 0, gzip: 0 };
        for (const { info } of outputs) {
          total.size += info.size;
          if (info.gzip) {
            total.gzip += info.gzip.size;
          }
        }
        expect(summary.total.size).to.equal(total.size);
        expect(summary.total.hSize).to.equal(`${total.size} B`);
        expect(summary.gzip?.total.size).to.equal(total.gzip);
        expect(summary.gzip?.total.hSize).to.equal(`${total.gzip} B`);
      });
      const plugin = outputSize({ hide: true, summary });
      await bundle(true, {
        input: inputs.add,
        output: { dir: inputs.tmp },
        plugins: [plugin]
      });
      expect(summary.calledOnce).to.be.true;
    });

    it('should have all available output info', async () => {
      const summary = spy<SummaryCallback>((_, outputs) => {
        expect(outputs).to.have.length(3);
        for (const output of outputs) {
          expect(output).to.be.an('object');
          expect(output).to.have.property('info').that.is.an('object');
          expect(output).to.have.property('output').that.is.an('object');
          expect(output.info).to.be.an('object');
          expect(output.info.type).to.have.oneOf(OUTPUT_TYPES);
        }
      });
      const plugin = outputSize({ hide: true, gzip: ['asset'], summary });
      await bundle(true, {
        input: { main: inputs.main, index: inputs.index },
        output: { dir: inputs.tmp, chunkFileNames: 'shared/[name].js' },
        plugins: [plugin]
      });
      expect(summary.calledOnce).to.be.true;
    });

    it('should handle partial gzipped info', async () => {
      const summary = spy<SummaryCallback>(summary => {
        expect(summary.gzip).to.be.undefined;
      });
      const plugin = outputSize({ hide: true, gzip: ['asset'], summary });
      await bundle(true, {
        input: inputs.add,
        output: { dir: inputs.tmp, sourcemap: true },
        plugins: [plugin]
      });
      expect(summary.calledOnce).to.be.true;
    });
  });
});
