const { get, post } = require('../../internet');
const fs      = require('fs');
const path    = require('path');
const log     = m => fs.writeSync(1, `${m}\n`);
let debug;
const util  = require('util');

const program = require('commander');

program.
  version('0.0.1').
  command("rating [title...]").
  option("-v --verbose"                   , "Enable verbose logging").
  option("-t --trace"                     , "Enable trace logging").
  option("-l --logLabels <logLabels...>"  , "Log labels", []).
  action(async   (titleWords, opts) => {
    const apiKey  = process.env.OMDB_API_KEY;
    debug         = (process.env.DEBUG == 1 || opts.verbose === true) 
      ? (m, label = null) => {
        if (opts.logLabels.length === 0 || opts.logLabels.includes(label)) {
          fs.writeSync(1, `[DEBUG] ${m}\n`);
        }
      }
      : () => {};

    if (!apiKey)

    throw `You need to set the <OMDB_API_KEY> env var`;

    const title = titleWords.join(' ');

    const url = `http://www.omdbapi.com?apikey=${apiKey}&s=${encodeURI(title)}`;

    const reply = await get(url).then(result => ({ statusCode: result.statusCode, body: JSON.parse(result.body) }));

    debug(`Request to <${url}> returned status <${reply.statusCode}> with body:\n${JSON.stringify(reply.body, null, 2)}`, 'list');

    const searchResults = await Promise.all(reply.body.Search.map(it => {
      const detailUrl = `http://www.omdbapi.com?apikey=${apiKey}&i=${it.imdbID}`;
      return get(detailUrl).
        then(reply  => JSON.parse(reply.body)).
        then(detail => { debug(JSON.stringify(detail, null, 2), 'detail.http'); return detail; }).
        then(detail => ({ ...it, imdbRating: detail.imdbRating })).
        then(result => { debug(JSON.stringify(result, null, 2), 'detail'); return result; });
    })); 

    debug(JSON.stringify(searchResults, null, 2), 'results');

    const ratings = searchResults.map(it => ({
      title: it.Title,
      rating: it.imdbRating
    }));

    ratings.forEach(result => {
      log(`${result.title.padEnd(50)} - ${result.rating}`);
    });
  });

program.
  version('0.0.1').
  command("pop").
  option("-v --verbose"   , "Enable verbose logging").
  option("-t --trace"     , "Enable trace logging").
  option("-s --enableSeen", "Enable seen filter").
  option("-c --count <count>", "Count", 25).
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
      const xml = await (get(url).catch(e => {throw e;}));

      debug(`Reply from <${url}>:\n\n${xml.body}`);
    }

    log(`${feed.title} (${url})\n`);
    
    const moment    = require('moment');
    const seenFile  = path.join(process.cwd(), '.seen');
    const read      = util.promisify(fs.readFile);

    const seen = await read(seenFile, 'utf8').
      catch(_ => '').
      then(text => { return text.split('\n').filter(line => line.length > 0); });
    
    const seenItems = [];
    
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

    const take = (arr = [], count, selector) => {
      const results = [];

      for (let index = 0; index < arr.length; index++) {
        const item = arr[index];

        const i = selector(item);
        
        if (i != null) {
          results.push({ index, item: i });
        } else {
          seenItems.push(item);
        }

        if (results.length === count)
          return results;
      }

      return results;
    };

    take(feed.items, parseInt(opts.count), item => {
      if (opts.enableSeen === false)
        return item;

      return isNotSeen(item) ? item : null;
    }).forEach(result => {
      const { index, item } = result;

      const age = moment.duration(new moment(item.pubDate).diff(new moment()));  
      
      log(`${index.toString().padEnd(2)} - ${age.humanize().padEnd(10)} ${item.title.padEnd(75)} ${item.torrent.infoHash}`);
    });

    log('');

    if (seenItems.length > 0) {
      log(`<${seenItems.length}> items skipped as seen`);

      if (opts.verbose) {
        log('');
        
        seenItems.forEach(item => {
          log(`${item.title.padEnd(75)} ${item.torrent.infoHash}`);
        });
      }
    }
  });

program.parse(process.argv);