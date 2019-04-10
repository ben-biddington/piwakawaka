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

  it('times errors, too', async () => {
    const timed = await timeAsync(() => {
      return new Promise((_, reject) => {
        setTimeout(() => reject('An error thrown on purpose'), 500);
      });
    }).catch(error => error);  

    const { duration, error } = timed;

    expect(duration).to.be.gt(500);

    expect(error).to.equal('An error thrown on purpose');
  });
});