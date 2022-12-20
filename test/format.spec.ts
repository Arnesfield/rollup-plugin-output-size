import { expect } from 'chai';
import stripAnsi from 'strip-ansi';
import { format, OutputInfo } from '../src';

describe('format', () => {
  it('should be a function', () => {
    expect(format).to.be.a('function');
  });

  it('should return a string', () => {
    const info: OutputInfo = {
      path: 'out/test/chunk.js',
      type: 'chunk',
      size: 30,
      hSize: '30 B',
      gzip: { size: 20, hSize: '20 B' }
    };
    const formatted = format(info);
    expect(formatted).to.be.a('string');
    const raw = stripAnsi(formatted);
    expect(raw).to.equal('[chunk] out/test/chunk.js is 30 B → 20 B (gzip)');
  });

  it('should handle no gzip info', () => {
    const info: OutputInfo = {
      path: 'out/test/asset.js.map',
      type: 'asset',
      size: 100,
      hSize: '100 B'
    };
    const raw = stripAnsi(format(info));
    expect(raw).to.equal('[asset] out/test/asset.js.map is 100 B');
  });
});
