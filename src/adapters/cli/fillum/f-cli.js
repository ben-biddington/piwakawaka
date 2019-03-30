const { get, post } = require('../../internet');
const fs      = require('fs');
const log     = m => fs.writeSync(1, `${m}\n`);
let debug;
const util  = require('util');

const program = require('commander');

program.
  version('0.0.1').
  command("pop").
  option("-v --verbose", "Enable verbose logging").
  action(async   (opts) => {
    debug         = (process.env.DEBUG == 1 || opts.verbose === true) ? m => fs.writeSync(1, `[DEBUG] ${m}\n`) : _ => {};

    const Parser  = require('rss-parser');
    const parser  = new Parser({
        customFields: {
          feed: [],
          item: ['torrent']}});

    const url     = process.env.RSS_URL;

    const feed = await parser.parseURL(url);
    
    if (opts.verbose) {
      const format = require('xml-formatter');
      
      const xml = await (get(url).catch(e => {throw e;}));

      debug(`Reply from <${url}>:\n\n${xml.body}`);
    }

    log(`${feed.title} (${url})\n`);
    
    const moment  = require('moment');

    feed.items.slice(0, 25).forEach(item => {
      const age = moment.duration(new moment(item.pubDate).diff(new moment()));  
      log(`${age.humanize().padEnd(10)} ${item.title.padEnd(75)} ${item.torrent.infoHash}`)
    });

    log('');
  });

program.parse(process.argv);