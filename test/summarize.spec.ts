import { expect } from 'chai';
import stripAnsi from 'strip-ansi';
import { summarize, Summary, SummarySizes } from '../src/index.js';

function getSizes(): SummarySizes {
  return {
    asset: { size: 20, hSize: '20 B' },
    chunk: { size: 30, hSize: '30 B' },
    entry: { size: 40, hSize: '40 B' },
    total: { size: 90, hSize: '90 B' }
  };
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
    const raw = stripAnsi(formatted);
    const text = '[total] 40 B + 30 B + 20 B = 90 B';
    expect(raw).to.equal(`${text}\n${text} (gzip)`);
  });

  it('should handle no gzip info', () => {
    const summary: Summary = getSizes();
    const formatted = summarize(summary);
    expect(formatted).to.be.a('string');
    const raw = stripAnsi(formatted);
    expect(raw).to.equal('[total] 40 B + 30 B + 20 B = 90 B');
  });

  it('should handle no type sizes (total only)', () => {
    const sizes: SummarySizes = { total: { size: 90, hSize: '90 B' } };
    const summary: Summary = { ...sizes, gzip: sizes };
    const formatted = summarize(summary);
    expect(formatted).to.be.a('string');
    const raw = stripAnsi(formatted);
    expect(raw).to.equal('[total] 90 B\n[total] 90 B (gzip)');
  });

  it('should display bytes when the option is enabled', () => {
    const summary: Summary = getSizes();
    const formatted = summarize(summary, { bytes: true });
    expect(formatted).to.be.a('string');
    const raw = stripAnsi(formatted);
    expect(raw).to.equal('[total] 40 + 30 + 20 = 90');
  });
});
