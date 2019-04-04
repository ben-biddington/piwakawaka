const expect    = require('chai').expect;

const timeAsync = async fn => {
  let result;
  
  const start = new Date();
  let finish;

  try { 
    result = await fn(); 
  } finally {
    finish = new Date();
  }

  return { duration: (finish - start), result };
}

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