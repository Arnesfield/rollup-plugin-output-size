import { expect } from 'chai';
import { gzip } from '../src/index.js';

describe('gzip', () => {
  it('should be a function', () => {
    expect(gzip).to.be.a('function');
  });

  it('should return a promise', () => {
    expect(gzip('Hello World!')).to.be.a('promise');
  });

  it('should return an object with proper sizes', async () => {
    const info = await gzip('Hello World!');
    expect(info).to.be.an('object');
    expect(info).to.have.property('size').that.is.a('number');
    expect(info).to.have.property('hSize').that.equals(`${info.size} B`);
  });
});
