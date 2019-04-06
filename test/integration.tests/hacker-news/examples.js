const expect    = require('chai').expect;
const settings  = require('../../acceptance.tests/support/settings');
const hn        = require('../../../src/adapters/hn');
const { get }   = require('../../../src/adapters/internet');

const cannedGet = (json) => {
  return (url, __) => {
    if (url.indexOf('topstories.json') != -1)
      return Promise.resolve({ statusCode:200, body: '[1]'});   
    
    return Promise.resolve({ statusCode:200, body: json });
  };
}

const realGet = get;

describe('Querying for top stories', () => {
  it('for example', async () => {
    const ports = { get: realGet, log: settings.log, debug: () => {}, trace: () => {} };
    
    const result = await hn.top(ports, { count: 5 });

    expect(result.length).to.equal(5);

    settings.log(JSON.stringify(result, null, 2));
  });

  it('handles missing url', async () => {
    const json =
      {
        "by": "tosh",
        "descendants": 152,
        "id": 19415983,
        "kids": [],
        "score": 220,
        "time": 1552851272,
        "title": "Alan Kay on the Meaning of “Object-Oriented Programming” (2003)",
        "type": "story",
      };

    const ports = { get: cannedGet(JSON.stringify(json)), log: settings.log };
    
    const result = await hn.top(ports);

    expect(result.length).to.equal(1);

    const item = result[0];

    expect(item.url).to.equal("");
    expect(item.host).to.equal("");
  });
});