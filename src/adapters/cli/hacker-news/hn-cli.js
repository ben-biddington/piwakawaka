const { get }         = require('../../internet');
const { top, single } = require('../../hn');
const { rs }          = require('../../lobste');
const { takeAsync }   = require('../../../core/array');
const DiskCache       = require('../../cli/hacker-news/disk-cache').DiskCache;
const TraceLog        = require('./trace-log').TraceLog;
const Database        = require('./database').Database;
const { selectDebug, info: log } = require('./log');

const program = require('commander');
const moment  = require('moment');
const chalk   = require('chalk');

const traceLog = new TraceLog(process.env.TRACE == 1);

const select = selectDebug;

const database  = new Database('hn.db');
const cache     = new DiskCache('.cache');

const topNew = async (ports = {}, opts = {}) => {
  const { count, useLobsters = false }   = opts;

  const sourceName  = useLobsters ? 'lobste.rs' : 'hn'; 
  const source      = useLobsters ? rs : top;

  ports.debug(`useLobsters: ${useLobsters}`);

  const results     = await source(ports, { count: 100 }).then(results => results.map((result, index) => ({...result, index, source: sourceName})));

  const isUnseen = item => database.isUnseen(item.id).then(it => it === true ? item : null);

  ports.debug(count);

  return takeAsync(results, count, isUnseen).then(results => results.map(it => it.item));
}

const render = (stories = [], format) => 
  Promise.all(stories.map(story => database.isBlocked(story.url.host).then(blocked => ({ ...story, blocked })))).
    then(stories => stories.forEach((story, index)=> {
      const label = `${index + 1}.`;
    
      const color = story.blocked ? chalk.green.dim : chalk.green;

      log(
        color(`${label.padEnd(3)} ${chalk.white.dim(`(${(story.index + 1).toString()})`.padEnd(4))} ${story.title.padEnd(80)}`) + ' ' + 
        chalk.yellow.dim(`${moment.duration(moment().diff(moment(story.date))).humanize()} ago`.padEnd(15)) + ' ' + 
        chalk.green.dim(story.url.host.padEnd(30)) + chalk.green.dim(story.source) + '\n');
      
      if (format == 'long') {
        log(`   ${story.id}, ${story.url.href}\n`);
      }
  }));

program.
  version('0.0.1').
  command("pop").
  option("-v --verbose"                 , "Enable verbose logging").
  option("-t --trace"                   , "Enable trace logging").
  option("-l --logLabels <logLabels...>", "Log labels", []).
  option("-c --count <count>"           , "Count"             , 25).
  option("-f --format <format>"         , "Output formatting" , 'short').
  option("-r --rs"                      , "Use lobste.rs instead").
  action(async (opts) => {
    const debug = select(opts);

    const results = await topNew(
      { get, log, debug, cache, trace: m => traceLog.record(m) }, 
      { count: opts.count, useLobsters: opts.rs });

    log(`\nShowing <${results.length}> stories\n`);

    const filtered = results.filter(it => it.url);

    return render(filtered, opts.format).
      then(() => cache.count().
        then(count => log(chalk.white.dim(`Cache contains <${count}> articles`))).
        then(()    => traceLog.forEach(m => log(chalk.grey(m)))));
  });

program.
  version('0.0.1').
  command("hide [id]").
  option("-v --verbose"         , "Enable verbose logging").
  option("-s --save"            , "Whether to save or hide", false).
  option("-c --count <count>"   , "How many to hide", 0).
  option("-d --domain <domain>" , "A domain to block").
  option("-r --rs"              , "[EXPERIMENTAL] Use lobste.rs instead").
  action(async (id, opts) => {
    const hide = opts.save ? ids => database.addSaved(ids) : ids => database.addSeen(ids);
    
    if (opts.count) {
      log(`Hiding the top <${opts.count}> items`);

      return await
        topNew(
          { get, debug: select(opts), cache, trace: m => traceLog.record(m) }, 
          { count: opts.count, useLobsters: opts.rs }).
        then(results => { log(results.map(it => it.id).join(', ')); return results; }).
        then(results => hide(results.map(result => result.id))).
        then(count   => log(`You have <${count}> ${opts.save ? 'saved' : 'seen'} items`));
    } 
    else if (opts.domain) {
      log(`Blocking domain <${opts.domain}>`);
      
      return database.block(opts.domain).
        then(list => log(`You have <${list.length}> blocked domains: ${list.map(it => it.domain).join(', ')}`));
    }
    else {
      log(`Hiding item with id <${id}>`);

      const count = await hide({ log }, id, { save: opts.save });

      log(`You have <${count}> ${opts.save ? 'saved' : 'seen'} items`);
    }
  });

program.
  version('0.0.1').
  command("unhide").
  option("-v --verbose"         , "Enable verbose logging").
  option("-d --domain <domain>" , "A domain to unhide").
  action(async (opts) => {
    if (opts.domain) {
      log(`Unblocking domain <${opts.domain}> items`);
      
      return database.unblock(opts.domain).
        then(list => log(`You have <${list.length}> blocked domains: ${list.map(it => it.domain).join(', ')}`));
    }
  });

program.
  version('0.0.1').
  command("saved").
  option("-v --verbose", "Enable verbose logging").
  action(async (opts) => {
    const allSaved = await
      database.listSaved().
        then(items    => { log(`items: ${items}`); return items;}).
        then(items    => items.map(item => item)).
        then(ids      => ids.map(id => single({ get }, {}, id))).
        then(promises => Promise.all(promises)).
        then(replies  => replies.map(it => it.body)).
        then(result   => result.map(JSON.parse));

    allSaved.forEach(story => {
      log(`${story.id} - ${story.title}`);
    });
  });

program.
  version('0.0.1').
  command("seen").
  option("-v --verbose", "Enable verbose logging").
  action(async (opts) => {
    
    const allSeen = await
      database.listSeen().
        then(items    => items.map(item => item.id)).
        then(ids      => ids.map(id => single({ get }, {}, id))).
        then(promises => Promise.all(promises)).
        then(replies  => replies.map(it => it.body)).
        then(result   => result.map(JSON.parse));

    allSeen.filter(it => it != null).forEach(story => {
      log(`${story.id} - ${story.title}`);
    });
  });

program.
  version('0.0.1').
  command("db").
  option("-v --verbose", "Enable verbose logging").
  action(async (opts) => database.applySchema());

program.parse(process.argv);