const expect    = require('chai').expect;
const { timeAsync } = require('../../src/core/time');

describe('Timing', () => {
  it('for example', async () => {
    const timed = await timeAsync(() => {
      return new Promise(accept => {
        setTimeout(() => accept('example'), 500)
      });
    });

    const { duration, result } = timed;

    expect(duration).to.be.gt(500);

    expect(result).to.equal('example');
  });
});