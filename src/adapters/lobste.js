
// [i] https://github.com/lobsters/lobsters/blob/master/config/routes.rb
const rs = async (ports, opts) => {
  const defaultRssFeed = url => {
    const Parser  = require('rss-parser');
    const parser  = new Parser({ customFields: {} });
    return parser.parseURL(url);
  }
  
  const { url = 'https://lobste.rs/rss', trace = false } = opts;
  const { log, debug, rss = defaultRssFeed, get = () => Promise.reject('No `get` port supplied') } = ports;

  if (trace) {
    const xml = await (get(url).catch(e => {throw e;}));
    
    debug(`Reply from <${url}>:\n\n${xml.body}`);
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

  return rss(url).
    then(result => result.items).
    then(items  => items.map(mapItem));
}

module.exports.rs = rs;