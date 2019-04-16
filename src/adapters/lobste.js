const { timeAsync } = require('../core/time');

// [i] https://github.com/lobsters/lobsters/blob/master/config/routes.rb
const rs = async (ports, opts = {}) => {
  const { url = 'https://lobste.rs/rss', count = 50 } = opts;
  const { trace = () => {} }          = ports;  
  
  const rss = url => timeAsync(() => (ports.rss || defaultRssFeed)(url));

  return rss(url).
    then(timed  => { trace(`It took <${timed.duration} ms> to fetch rss from <${url}>`); return timed.result; }).
    then(result => result.items).
    then(items  => items.map(mapItem)).
    then(items  => items.slice(0, count));
}

const defaultRssFeed = url => {
  const Parser  = require('rss-parser');
  const parser  = new Parser({ customFields: {} });
  return parser.parseURL(url);
}

const hottest = (ports = { }, opts = {}) => {
  const { url = 'https://lobste.rs/hottest', count = 50 } = opts;
  const { get, trace = () => {} }          = ports;
  
  return get(url).
    then(reply => JSON.parse(reply.body)).
    then(items => items.map(item => {
      return mapItem({ 
        ...item,
        guid:     item.short_id_url,
        link:     item.url, 
        pubDate:  item.created_at });
    }));
}

const mapItem = item => {
  const url = require('url');
  
  return {
    ...item,
    id:   item.guid,
    url:  url.parse(item.link),
    host: url.parse(item.link).host,
    date: new Date(new Date(item.pubDate).toUTCString()),
  };
}

module.exports.rs = rs;
module.exports.hottest = hottest;