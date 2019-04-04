const { timeAsync } = require('../core/time');

const fs        = require('fs');
const util      = require('util');
const path      = require('path');
const write     = util.promisify(fs.writeFile);
const exists    = util.promisify(fs.exists);
const mkdir     = util.promisify(fs.mkdir);
const read      = util.promisify(fs.readFile);

class DiskCache {
  constructor(dir) {
    this._dir = dir;
  }

  async set(name, what) {
    return write(this.fullPath(name), JSON.stringify(what));
  }

  async ensureDir() {
    return exists(this._dir).then(okay => okay === true ? Promise.resolve() : mkdir(this._dir));
  };

  async get(name) {
    const fullFilePath = this.fullPath(name);

    return this.ensureDir().
      then(()   => exists(fullFilePath)).
      then(yes  => yes ? read(fullFilePath, 'utf8').then(JSON.parse) : Promise.resolve());
  }

  fullPath(name) {
    return path.join(this._dir, name.toString())
  };
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

  const cache = new DiskCache('.cache');

  const getDetail = async id => {
    return (await cache.get(id)) || ports.get(`${baseUrl}/item/${id}.json`).then(tap(reply => cache.set(id, reply)));
  };

  const timedGetDetail = id => {
    return timeAsync(() => getDetail(id)).
      then(timed => {
        //console.log(`Request took <${timed.duration}.ms>`);
        return timed.result;
      });
  }

  return await 
    ports.get(`${baseUrl}/topstories.json`, { 'Accept': 'application/json' }).
    then(tap(reply => debug(`${reply.statusCode}\n\n${reply.body}`))).
    then(reply     => JSON.parse(reply.body)).
    then(ids       => ids.slice(0, opts.count).map(id => timedGetDetail(id))).
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