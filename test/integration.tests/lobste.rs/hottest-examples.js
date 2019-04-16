const expect    = require('chai').expect;
const settings    = require('../../acceptance.tests/support/settings');
const { get }     = require('../../../src/adapters/internet');
const { hottest } = require('../../../src/adapters/lobste');

describe('Querying lobste.rs for hottest stories', () => {
  it('for example', async () => {
    const ports = { get, log: settings.log, debug: settings.debug, trace: () => {} };
    
    const result = await hottest(ports, { count: 5 });

    expect(result.length).to.be.greaterThan(0);

    result.map(it => it.title).slice(0, 25).forEach((it, i) => settings.log(`${i+1} ${it}`));
  });
});