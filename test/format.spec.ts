import { expect } from 'chai';
import util from 'util';
import { format, OutputInfo } from '../src';
import { formatBytes } from '../src/utils/format-bytes';

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
    const raw = util.stripVTControlCharacters(formatted);
    expect(raw).to.equal('[chunk] out/test/chunk.js is 30 B → 20 B (gzip)');
  });

  it('should handle no gzip info', () => {
    const info: OutputInfo = {
      path: 'out/test/asset.js.map',
      type: 'asset',
      size: 100,
      hSize: '100 B'
    };
    const raw = util.stripVTControlCharacters(format(info));
    expect(raw).to.equal('[asset] out/test/asset.js.map is 100 B');
  });

  it('should display bytes when the option is enabled', () => {
    let size = 0;
    let info: OutputInfo = {
      path: 'out/test/entry.js',
      type: 'entry',
      size,
      hSize: formatBytes(size)
    };
    let raw = util.stripVTControlCharacters(format(info, { bytes: true }));
    expect(raw).to.equal('[entry] out/test/entry.js is 0 B');

    size = 1234567890;
    info = {
      path: 'out/test/entry.js',
      type: 'entry',
      size,
      hSize: formatBytes(size)
    };
    raw = util.stripVTControlCharacters(format(info, { bytes: true }));
    expect(raw).to.equal('[entry] out/test/entry.js is 1,234,567,890 B');
  });
});
