const { get } = require('../../internet');
const fs      = require('fs');
const path    = require('path');

const util  = require('util');
const { search }  = require('./imdb');
const { take }  = require('../../../core/array');

const log     = m => fs.writeSync(1, `${m}\n`);
const { debug: taggedDebug } = require('./debug');
const debugLog = (opts) => (process.env.DEBUG == 1 || opts.verbose === true) ? taggedDebug : () => {};

const program = require('commander');

program.
  version('0.0.1').
  command("rating [title...]").
  option("-v --verbose"                   , "Enable verbose logging").
  option("-t --trace"                     , "Enable trace logging").
  option("-l --logLabels <logLabels...>"  , "Log labels", []).
  action(async (titleWords, opts) => {
    const debug = debugLog(opts);

    const apiKey  = process.env.OMDB_API_KEY;

    const searchResults = await search({ get, debug, log }, apiKey, titleWords);

    debug(JSON.stringify(searchResults, null, 2), 'results');

    searchResults.results.map(it => ({
      title:  it.Title,
      rating: it.imdbRating,
      actors: it.actors,
      plot:   it.plot,
    })).
    forEach(result => {
      log(`${result.title.padEnd(50)} - ${result.rating}\n`);
      log(`${result.plot}\n`);
      log(`${result.actors}\n`);
    });

    log(`\nAPI hits: ${searchResults.apiHits}`);
  });

program.
  version('0.0.1').
  command("pop").
  option("-v --verbose"       , "Enable verbose logging").
  option("-t --trace"         , "Enable trace logging").
  option("-s --enableSeen"    , "Enable seen filter").
  option("-m --magnet"        , "Show magnet links").
  option("-c --count <count>" , "Count", 25).
  action(async   (opts) => {
    const debug = debugLog(opts);

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

    take(feed.items, parseInt(opts.count), item => {
      if (opts.enableSeen === false)
        return item;

      return isNotSeen(item) ? item : null;
    }).forEach(result => {
      const { index, item } = result;

      const age = moment.duration(new moment(item.pubDate).diff(new moment()));  
      
      log(
        `${index.toString().padEnd(2)} - ${age.humanize().padEnd(10)} ${item.title.padEnd(75)}` + 
        (opts.magnet ? ` ${item.torrent.magnetURI}` : ''));
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