const { get, post } = require('../../internet');
const fs      = require('fs');
const path    = require('path');
const log     = m => fs.writeSync(1, `${m}\n`);
let debug;
const util  = require('util');

const program = require('commander');

program.
  version('0.0.1').
  command("pop").
  option("-v --verbose"   , "Enable verbose logging").
  option("-t --trace"     , "Enable trace logging").
  option("-s --enableSeen", "Enable seen filter").
  action(async   (opts) => {
    debug         = (process.env.DEBUG == 1 || opts.verbose === true) ? m => fs.writeSync(1, `[DEBUG] ${m}\n`) : _ => {};
    debug(util.inspect(opts));
    const Parser  = require('rss-parser');
    const parser  = new Parser({
        customFields: {
          feed: [],
          item: ['torrent']}});

    const url     = process.env.RSS_URL;
    
    if (!url)
      throw `You need to set the <RSS_URL> env var`;

    const feed = await parser.parseURL(url);

    if (opts.trace) {
      const format = require('xml-formatter');
      
      const xml = await (get(url).catch(e => {throw e;}));

      debug(`Reply from <${url}>:\n\n${xml.body}`);
    }

    log(`${feed.title} (${url})\n`);
    
    const moment  = require('moment');
    const seenFile = path.join(process.cwd(), '.seen');
    const read = util.promisify(fs.readFile);

    const seen = await read(seenFile, 'utf8').
      catch(_ => '').
      then(text => { return text.split('\n').filter(line => line.length > 0); });
    
    let seenCount = 0;
    
    debug(`Using seen list at <${seenFile}>: ${seen.join(',')}`);

    const isNotSeen = item => {
      const matchesPattern = (line, title) => {
        const pattern = new RegExp(line.replace(/\//g, ''), 'ig');

        const matches = title.toString().match(pattern) || [];

        return matches != matches.length > 0;
      }

      return seen.filter(line => item.torrent.infoHash.toString() === line).length === 0 && 
             seen.filter(line => matchesPattern(line, item.title.toString())).length === 0;
    }

    feed.items.slice(0, 25).forEach(item => {
      const age = moment.duration(new moment(item.pubDate).diff(new moment()));  
      
      const keep = (opts.enableSeen === true)
        ? isNotSeen(item) 
        : true;

      if (keep) {
        log(`${age.humanize().padEnd(10)} ${item.title.padEnd(75)} ${item.torrent.infoHash}`);
      } else {
        seenCount++;
      }
    });

    log('');

    if (seenCount > 0) {
      log(`<${seenCount}> items skipped as seen`);
    }
  });

program.parse(process.argv);