import { expect } from 'chai';
import prettyBytes from 'pretty-bytes';
import util from 'util';
import { Size, summarize, Summary, SummarySizes } from '../src';

function size(size: number): Size {
  return { size, hSize: prettyBytes(size) };
}

function getSizes(): SummarySizes {
  return { asset: size(20), chunk: size(30), entry: size(40), total: size(90) };
}

describe('summarize', () => {
  it('should be a function', () => {
    expect(summarize).to.be.a('function');
  });

  it('should return a string', () => {
    const sizes = getSizes();
    const summary: Summary = { ...sizes, gzip: sizes };
    const formatted = summarize(summary);
    expect(formatted).to.be.a('string');
    const raw = util.stripVTControlCharacters(formatted);
    const text = '[total] 40 B + 30 B + 20 B = 90 B';
    expect(raw).to.equal(`${text}\n${text} (gzip)`);
  });

  it('should handle no gzip info', () => {
    const summary: Summary = getSizes();
    const formatted = summarize(summary);
    expect(formatted).to.be.a('string');
    const raw = util.stripVTControlCharacters(formatted);
    expect(raw).to.equal('[total] 40 B + 30 B + 20 B = 90 B');
  });

  it('should handle no type sizes (total only)', () => {
    const sizes: SummarySizes = { total: { size: 90, hSize: '90 B' } };
    const summary: Summary = { ...sizes, gzip: sizes };
    const formatted = summarize(summary);
    expect(formatted).to.be.a('string');
    const raw = util.stripVTControlCharacters(formatted);
    expect(raw).to.equal('[total] 90 B\n[total] 90 B (gzip)');
  });

  it('should display bytes when the option is enabled', () => {
    const summary: Summary = {
      asset: size(2000),
      chunk: size(3000),
      entry: size(4000),
      total: size(9000)
    };
    const formatted = summarize(summary, { bytes: true });
    expect(formatted).to.be.a('string');
    const raw = util.stripVTControlCharacters(formatted);
    expect(raw).to.equal('[total] 4,000 B + 3,000 B + 2,000 B = 9,000 B');
  });
});
