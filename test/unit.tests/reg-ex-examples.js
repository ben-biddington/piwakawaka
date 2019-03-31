const expect    = require('chai').expect;

describe('Regular expressions', () => {
  it('use literals', () => {
    const match = 'The Highwaymen'.match(/.+highway.+/ig);

    expect(match[0]).to.equal('The Highwaymen');
  });

  it('when parsing from string you must omit slashes', () => {
    let match = 'The Highwaymen'.match(new RegExp('.+highway.+', "ig"));

    expect(match[0]).to.equal('The Highwaymen');

    match = 'The Highwaymen'.match(new RegExp('/.+highway.+/', "ig"));

    expect(match).to.equal(null);
  });
});