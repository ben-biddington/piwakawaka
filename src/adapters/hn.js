const { timeAsync } = require('../core/time');
const { tap }       = require('../core/sugar');
const  util         = require('util');

const mapItem = (ports = {}, item) => { 
  let result = {
    id:     item.id,
    title:  item.title,
    url:    '',
    host:   '',
    date: ''
  };

  const { trace } = ports;

  if (item.url) {
    const url = require('url');
    
    result = {
      ...result,
      url: url.parse(item.url),
      host: url.parse(item.url).host,
      date: new Date(parseInt(item.time) * 1000),
      score: item.score
    };
  }
  
  trace(`Translated this:\n${util.inspect(item)}\n\n into this:\n\n${util.inspect(result)}`);

  return result;
};

class DevNullCache {
  get(id) { return null; }
  set(id) {  }
}

const top = async (ports, opts = {}) => {
  const { baseUrl = 'https://hacker-news.firebaseio.com/v0', count = 10 } = opts;
  const { debug = () => {}, cache = new DevNullCache(), trace = () => {} } = ports;

  const getDetail = async id => {
    return (await cache.get(id)) || ports.get(`${baseUrl}/item/${id}.json`).then(tap(reply => cache.set(id, reply)));
  };

  const timedGetDetail = (id) => {
    return timeAsync(() => getDetail(id)).
      then(timed => {
        trace(`Request took <${timed.duration}.ms> and returned:\n${util.inspect(timed.result)}`);
        return timed.result;
      });
  }

  const url = `${baseUrl}/topstories.json`;

  return await 
    ports.get(url, { 'Accept': 'application/json' }).
    then(tap(reply => debug(`Reply from <${url}> return status <${reply.statusCode}> and body:\n\n${reply.body}`))).
    then(reply     => JSON.parse(reply.body)).
    then(ids       => ids.slice(0, opts.count).map(id => timedGetDetail(id))).
    then(tasks     => Promise.all(tasks)).
    then(replies   => replies.map(it => it.body)).
    then(result    => result.map(JSON.parse)).
    then(items     => items.map(item => mapItem({ trace }, item)));
};

const single = (ports, opts, id) => {
  const { baseUrl = 'https://hacker-news.firebaseio.com/v0' } = opts;

  return ports.get(`${baseUrl}/item/${id}.json`);
}

module.exports.top    = top;
module.exports.single = single;