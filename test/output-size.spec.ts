import { expect } from 'chai';
import path from 'path';
import { rollup, RollupOptions } from 'rollup';
import { spy } from 'sinon';
import {
  OutputInfo,
  outputSize,
  OutputType,
  RollupOutputSizeOptions
} from '../src';

type Handle = Exclude<RollupOutputSizeOptions['handle'], undefined>;

function file(value: string) {
  return path.resolve(__dirname, value);
}

const inputs = {
  add: file('fixtures/add.js'),
  main: file('fixtures/main.js'),
  index: file('fixtures/index.js')
};

// generate bundles
async function bundle(options: RollupOptions) {
  const build = await rollup(options);
  const outputs = Array.isArray(options.output)
    ? options.output
    : options.output
    ? [options.output]
    : [];
  return Promise.all(outputs.map(output => build.generate(output)));
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

// ensure handle() gets called since this
// will be used to test other functionality
describe('options.handle', () => {
  it('should be called when generating build', async () => {
    const handle = spy<Handle>(() => {});
    const plugin = outputSize({ handle });
    expect(handle.calledOnce).to.be.false;
    await bundle({
      input: inputs.add,
      output: { dir: 'fixtures/test' },
      plugins: [plugin]
    });
    expect(handle.calledOnce).to.be.true;
  });

  it('should receive entry output type', async () => {
    const handle = spy<Handle>((info, output) => {
      expectOutputInfo(info);
      expect(info.path).to.equal('fixtures/test/add.js');
      expect(info.type).to.equal('entry');
      expect(output)
        .to.be.an('object')
        .with.property('type')
        .that.equals('chunk');
    });
    await bundle({
      input: inputs.add,
      output: { dir: 'fixtures/test' },
      plugins: [outputSize({ handle })]
    });
    expect(handle.calledOnce).to.be.true;
  });

  it('should receive asset output type', async () => {
    const types: OutputType[] = [];
    const handle = spy<Handle>(info => {
      expectOutputInfo(info);
      const name = info.type === 'asset' ? 'add.js.map' : 'add.js';
      expect(info.path).to.equal(`fixtures/test/${name}`);
      types.push(info.type);
    });
    await bundle({
      input: inputs.add,
      output: { dir: 'fixtures/test', sourcemap: true },
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
      const chunk = 'fixtures/test/shared/add.js';
      expect(info.path).to.have.oneOf([
        chunk,
        'fixtures/test/index.js',
        'fixtures/test/main.js'
      ]);
      if (info.type === 'chunk') {
        expect(info.path).to.equal(chunk);
      }
      types.push(info.type);
    });
    await bundle({
      input: { main: inputs.main, index: inputs.index },
      output: { dir: 'fixtures/test', chunkFileNames: 'shared/[name].js' },
      plugins: [outputSize({ handle })]
    });
    expect(handle.calledThrice).to.be.true;
    expect(types.filter(type => type === 'entry')).to.have.length(2);
    expect(types.filter(type => type === 'chunk')).to.have.length(1);
  });
});

describe('options.hide', () => {
  it('should hide entry output type', async () => {
    const handle = spy<Handle>(info => {
      expect(info.type).to.equal('asset');
    });
    await bundle({
      input: inputs.add,
      output: { dir: 'fixtures/test', sourcemap: true },
      plugins: [outputSize({ handle, hide: ['entry'] })]
    });
    // calls once for asset (sourcemap)
    expect(handle.calledOnce).to.be.true;
  });

  it('should hide asset output type', async () => {
    const handle2 = spy<Handle>(() => {});
    await bundle({
      input: inputs.add,
      output: { dir: 'fixtures/test', sourcemap: true },
      plugins: [outputSize({ handle: handle2, hide: ['asset', 'entry'] })]
    });
    expect(handle2.called).to.be.false;
  });

  it('should hide chunk output type', async () => {
    const handle = spy<Handle>(() => {});
    await bundle({
      input: { main: inputs.main, index: inputs.index },
      output: { dir: 'fixtures/test', sourcemap: true },
      plugins: [outputSize({ handle, hide: ['asset', 'chunk', 'entry'] })]
    });
    expect(handle.called).to.be.false;
  });
});

describe('options.silent', () => {
  it('should disable output', async () => {
    const handle1 = spy<Handle>(() => {});
    const handle2 = spy<Handle>(() => {});
    await bundle({
      input: { main: inputs.main, index: inputs.index },
      output: { dir: 'fixtures/test', sourcemap: true },
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

describe('options.gzip', () => {
  it('should get gzipped sizes by default', async () => {
    const handle = spy<Handle>(info => {
      expect(info.gzip).to.be.an('object');
    });
    await bundle({
      input: inputs.add,
      output: { dir: 'fixtures/test', sourcemap: true },
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
      output: { dir: 'fixtures/test', sourcemap: true },
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
      output: { dir: 'fixtures/test', sourcemap: true },
      plugins: [outputSize({ handle, gzip: ['chunk', 'entry'] })]
    });
    expect(handle.called).to.be.true;
  });
});
