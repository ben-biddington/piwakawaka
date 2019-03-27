const expect      = require('chai').expect;
const settings    = require('../../acceptance.tests/support/settings');
const stops    = require('../../../src/adapters/metlink').stops;
const enableDebug = settings.features.enableDebug;

describe('Querying for bus stops', () => {
  xit('can find stops by id', async () => {
    const ports = { get: fakeGet, log: settings.log };
    
    const result = await stops(ports, '4130');

    expect(result.name).to.equal('Wilton Road at Warwick Street');
    expect(result.sms) .to.equal('4130');
  });
});