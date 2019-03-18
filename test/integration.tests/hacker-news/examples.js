const expect    = require('chai').expect;
const settings  = require('../../acceptance.tests/support/settings');
const hn        = require('../../../src/adapters/hn');

const cannedGet = (json) => {
  return (url, __) => {
    if (url.indexOf('topstories.json') != -1)
      return Promise.resolve('[1]');   
    
    return Promise.resolve(json);
  };
}

const realGet = async (url, headers) => {
  const request = require("request");
  return new Promise((resolve, reject) => {
    request({ uri: url, headers }, async (error, _, body) => {
      if (error)
        reject(error);
  
      resolve(body);
    });
  });
}

describe('Querying for top stories', () => {
  it('for example', async () => {
    const ports = { get: realGet, log: settings.log };
    
    const result = await hn.top(ports, { count: 5 });

    expect(result.length).to.equal(5);

    settings.log(JSON.stringify(result, null, 2));
  });

  it('converts to our format', async () => {
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
        "url": "http://www.purl.org/stefan_ram/pub/doc_kay_oop_en"
      };

    const ports = { get: cannedGet(JSON.stringify(json)), log: settings.log };
    
    const result = await hn.top(ports);

    expect(result.length).to.equal(1);

    const item = result[0];

    expect(item).to.deep.equal({
      "id":     19415983,
      "title":  "Alan Kay on the Meaning of “Object-Oriented Programming” (2003)",
      "url":    "http://www.purl.org/stefan_ram/pub/doc_kay_oop_en"
    });
  });
});