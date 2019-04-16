const { timeAsync } = require('../core/time');

// [i] https://github.com/lobsters/lobsters/blob/master/config/routes.rb
const rs = async (ports, opts = {}) => {
  const rss = url => timeAsync(() => {
    const fn = ports.rss || defaultRssFeed;
    return fn(url);
  });
  
  const { url = 'https://lobste.rs/rss', count = 50 } = opts;
  const { trace = () => {} }          = ports;  

  return rss(url).
    then(timedResult  => { trace(`It took <${timedResult.duration} ms> to fetch rss from <${url}>`); return timedResult.result; }).
    then(result       => result.items).
    then(items        => items.map(mapItem)).
    then(items        => items.slice(0, count));
}

const defaultRssFeed = url => {
  const Parser  = require('rss-parser');
  const parser  = new Parser({ customFields: {} });
  return parser.parseURL(url);
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