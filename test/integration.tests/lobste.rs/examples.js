const expect    = require('chai').expect;
const settings  = require('../../acceptance.tests/support/settings');
const { get }   = require('../../../src/adapters/internet');

const cannedGet = (json) => {
  return (url, __) => {
    if (url.indexOf('topstories.json') != -1)
      return Promise.resolve({ statusCode:200, body: '[1]'});   
    
    return Promise.resolve({ statusCode:200, body: json });
  };
}

const realGet = get;

// [i] https://github.com/lobsters/lobsters/blob/master/config/routes.rb
const rs = () => {
  const Parser        = require('rss-parser');
  const parser        = new Parser({ customFields: {} });
  const url           = 'https://lobste.rs/rss';

  return parser.parseURL(url).then(result => result.items);
}

describe('Querying for top stories', () => {
  it('for example', async () => {
    const ports = { get: realGet, log: settings.log, debug: settings.debug, trace: () => {} };
    
    const result = await rs(ports, { count: 5, trace: true });

    expect(result.length).to.be.greaterThan(0);

    result.map(it => it.title).slice(0, 25).forEach((it, i) => settings.log(`${i+1} ${it}`));
  });
});