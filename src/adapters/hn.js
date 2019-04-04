const { timeAsync } = require('../core/time');

const fs    = require('fs');
const util  = require('util');
const path  = require('path');

class DiskCache {
  constructor(dir) {
    this._dir = dir;
  }

  async set(name, what) {
    const fullPath  = path.join(this._dir, name.toString());
    const write     = util.promisify(fs.writeFile);
    
    return write(fullPath, JSON.stringify(what));
  }

  async get(name) {
    const fullPath = path.join(this._dir, name.toString());
    const exists   = util.promisify(fs.exists);
    const read     = util.promisify(fs.readFile);

    return exists(fullPath).then(yes => {
      return yes ? read(fullPath, 'utf8').then(JSON.parse) : Promise.resolve(null);
    });
  }
}

const mapItem = item => { 
  let result = {
    id:     item.id,
    title:  item.title,
    url:    '',
    host:   ''
  };

  if (item.url) {
    const url = require('url');
    
    result = {
      ...result,
      url: item.url,
      host: url.parse(item.url).host
    };
  }

  return result;
};

const tap = (fn) => {
  return (args) => {
    fn(args); return args;
  };
};

const top = async (ports, opts = {}) => {
  const { baseUrl = 'https://hacker-news.firebaseio.com/v0', count = 10 } = opts;
  const { debug } = ports;

  const timedGet = args => {
    return timeAsync(() => ports.get(args)).
      then(timed => {
        debug(`Request to <${args}> took <${timed.duration}ms>`);
        return timed.result;
      });
  };

  const cache = new DiskCache('.cache');
  const enableCache = true;

  const getDetail = async id => {
    if (enableCache) {
      const cached = await cache.get(id);

      if (cached != null)
        return cached;
    }

    return ports.get(`${baseUrl}/item/${id}.json`).
      then(reply => {
        return cache.set(id, reply).
          then(() => reply);
      });
  };

  return await 
    timedGet(`${baseUrl}/topstories.json`, { 'Accept': 'application/json' }).
    then(tap(reply => debug(`${reply.statusCode}\n\n${reply.body}`))).
    then(reply     => JSON.parse(reply.body)).
    then(ids       => ids.slice(0, opts.count).map(id => getDetail(id))).
    then(tasks     => Promise.all(tasks)).
    then(replies   => replies.map(it => it.body)).
    then(result    => result.map(JSON.parse)).
    then(items     => items.map(mapItem));
};

const single = (ports, opts, id) => {
  const { baseUrl = 'https://hacker-news.firebaseio.com/v0' } = opts;

  return ports.get(`${baseUrl}/item/${id}.json`);
}

module.exports.top    = top;
module.exports.single = single;