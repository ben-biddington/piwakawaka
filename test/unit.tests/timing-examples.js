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

  it('can time errors if you opt in', async () => {
    const opts = { timeErrors: true } 
    
    const timed = await timeAsync(() => {
      return new Promise((_, reject) => {
        setTimeout(() => reject('An error thrown on purpose'), 500);
      });
    }, opts).catch(error => error);  

    const { duration, error } = timed;

    expect(duration).to.be.gt(500);

    expect(error).to.equal('An error thrown on purpose');
  });

  describe('by default it does not time errors, for example', () => {
    const opts = [ { timeErrors: true }, null, {} ]; 
    
    opts.forEach(option => {
      it(`with options: ${JSON.stringify(option)}`, async () => {
        const error = await timeAsync(() => {
          return new Promise((_, reject) => {
            setTimeout(() => reject('An error thrown on purpose'), 20);
          });
        }, opts).catch(error => error);  
    
        expect(error).to.equal('An error thrown on purpose');
      });
    });
  });
});