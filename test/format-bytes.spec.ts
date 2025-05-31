import { expect } from 'chai';
import prettyBytes from 'pretty-bytes';
import { formatBytes } from '../src/utils/format-bytes';

// NOTE: this is internal but test it anyway for correctness

// expect not equal to prettyBytes output
function expectNotEqual(list: [number, string][]) {
  for (const [bytes, actual] of list) {
    const hBytes = formatBytes(bytes);
    expect(hBytes).to.not.equal(prettyBytes(bytes));
    expect(hBytes).to.equal(actual);
  }
}

describe('formatBytes', () => {
  it('should be a function', () => {
    expect(formatBytes).to.be.a('function');
  });

  it('should properly format bytes', () => {
    const list = [0, 99, 999, 1_000, 1_337, 9_999, 1_234_567, 1_234_567_890];
    for (const bytes of list) {
      expect(formatBytes(bytes)).to.equal(prettyBytes(bytes));
    }
  });

  it('should format with commas and decimals', () => {
    expectNotEqual([
      [999.5, '999.5 B'], // 1000 B
      [999_999, '1,000 kB'], // 1000 kB
      [123_456, '123.46 kB'], // 123 kB
      [999_999_999, '1,000 MB'], // 1000 MB
      [123_456_789_000, '123.46 GB'], // 123 GB
      [999_999_999_999, '1,000 GB'] // 1000 GB
    ]);
  });

  it('should not format more than GB', () => {
    expectNotEqual([
      [1_234_567_890_000, '1,234.57 GB'], // 1.23 TB
      [123_456_789_876_543, '123,456.79 GB'], // 123 TB
      [999_999_999_999_999, '1,000,000 GB'] // 1 PB
    ]);
  });
});
