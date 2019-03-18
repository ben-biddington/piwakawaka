const expect    = require('chai').expect;
const settings  = require('../../acceptance.tests/support/settings');
const enableDebug = settings.features.enableDebug;

const cannedGet = (json) => {
  return (_, __) => {
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

const top = async (ports, opts) => {
  const { count = 10 } = opts;
  
  return await ports.
    get(`https://hacker-news.firebaseio.com/v0/topstories.json?`).
    then(JSON.parse).
    then(ids    => ids.slice(0,count).map(id => ports.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`))).
    then(tasks  => Promise.all(tasks)).
    then(result => result.map(JSON.parse));
};

describe('Querying for top stories', () => {
  it('for example', async () => {
    const ports = { get: realGet, log: settings.log };
    
    const result = await top(ports, { count: 5 });

    settings.log(JSON.stringify(result, null, 2));
  });
});