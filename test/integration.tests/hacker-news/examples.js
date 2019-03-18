const expect    = require('chai').expect;
const settings  = require('../../acceptance.tests/support/settings');

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

const top = async (ports, opts = {}) => {
  const { count = 10 } = opts;
  
  const log = args => { console.log(args); return args; }

  return await ports.
    get(`https://hacker-news.firebaseio.com/v0/topstories.json`, { 'Accept': 'application/json' }).
    then(JSON.parse).
    then(ids    => ids.slice(0, count).map(id => ports.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`))).
    then(tasks  => Promise.all(tasks)).
    then(result => result.map(JSON.parse)).
    then(items  => items.map(item => (
      {
        id:     item.id,
        title:  item.title,
        url:    item.url,
      })));
};

describe('Querying for top stories', () => {
  it('for example', async () => {
    const ports = { get: realGet, log: settings.log };
    
    const result = await top(ports, { count: 5 });

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
    
    const result = await top(ports);

    expect(result.length).to.equal(1);

    const item = result[0];

    expect(item).to.deep.equal({
      "id":     19415983,
      "title":  "Alan Kay on the Meaning of “Object-Oriented Programming” (2003)",
      "url":    "http://www.purl.org/stefan_ram/pub/doc_kay_oop_en"
    });
  });
});