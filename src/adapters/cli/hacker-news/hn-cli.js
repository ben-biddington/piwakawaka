const { get } = require('../../internet');
const fs = require('fs');
const log = m => fs.writeSync(1, `${m}\n`);
const { top, single } = require('../../hn');
const { takeAsync } = require('../../../core/array');
const DiskCache     = require('../../cli/hacker-news/disk-cache').DiskCache;
const program = require('commander');

const topNew = async (ports = {}, opts = {}) => {
  const { count }   = opts;
  const { missing } = require('./seen.js');
  const results     = await top(ports, { count: 50 });

  const fn = item => missing(ports, item.id).then(it => it === true ? item : null);

  ports.debug(count);

  return takeAsync(results, count, item => fn(item)).
    then(results => results.map(it => it.item));
}

const cache = new DiskCache('.cache');
const chalk = require('chalk');

class TraceLog {
  constructor(enabled = true) {
    this._messages = [];
    this._enabled  = enabled;
  }

  record(m) {
    if (this._enabled === true) {
      this._messages.push(m);
    }
  }

  forEach(fn) {
    this._messages.forEach(fn);
  }
}

const traceLog = new TraceLog(process.env.TRACE == 1);

const render = (stories = [], format) => {
  let index = 1;

  stories.forEach(story => {
    const label = `${index++}.`;
    log(chalk.green(`${label.padEnd(4)}${story.title}`) + ' ' + chalk.gray(story.url.host) + '\n');
    if (format == 'long') {
      log(`   ${story.id}, ${story.url.href}\n`);
    }
  });
};

program.
  version('0.0.1').
  command("pop").
  option("-v --verbose", "Enable verbose logging").
  option("-t --trace", "Enable trace logging").
  option("-l --logLabels <logLabels...>", "Log labels", []).
  option("-c --count <count>", "Count", 25).
  option("-f --format <format>", "Output formatting", 'short').
  action(async (opts) => {
    debug = (process.env.DEBUG == 1 || opts.verbose === true)
      ? (m, label = null) => {
        if (opts.logLabels.length === 0 || opts.logLabels.includes(label)) {
          const prefix = label ? `[DEBUG, ${label}]` : '[DEBUG]';

          fs.writeSync(1, `${prefix} ${m}\n`);
        }
      }
      : () => { };

    const results = await topNew({ get, debug, cache, trace: m => traceLog.record(m) }, { count: opts.count });

    log(`\nShowing <${results.length}> stories\n`);

    const { exists } = require('./seen.js');

    const filtered = await Promise.all(results.map(async item => {
      const isSeen = await exists({ log }, item.id);
      return { ...item, isSeen };
    })).then(result => result.filter(it => false === it.isSeen && it.url));

    render(filtered, opts.format);

    cache.count().
      then(count => log(chalk.grey(`Cache contains <${count}> articles`))).
      then(()    => traceLog.forEach(m => log(chalk.grey(m))));
  });

program.
  version('0.0.1').
  command("hide [id]").
  option("-v --verbose"         , "Enable verbose logging").
  option("-s --save"            , "Whether to save or hide", false).
  option("-c --count <count>"   , "How many to hide", 0).
  option("-d --domain <domain>" , "A domain to block").
  action(async (id, opts) => {
    const { add: hide } = require('./seen.js');
    
    const debug = (process.env.DEBUG == 1 || opts.verbose === true)
      ? (m, label = null) => {
          if (opts.logLabels.length === 0 || opts.logLabels.includes(label)) {
            const prefix = label ? `[DEBUG, ${label}]` : '[DEBUG]';

            fs.writeSync(1, `${prefix} ${m}\n`);
          }
        }
      : () => { };

    if (opts.count) {
      log(`Hiding the top <${opts.count}> items`);

      await 
        topNew({ get, debug, cache, trace: m => traceLog.record(m) }, { count: opts.count }).
        then(results => { log(results.map(it => it.id).join(', ')); return results; }).
        then(results => Promise.all(results.map(result => hide({ log }, result.id))));
    } else if (opts.domain) {
      log(`Blocking domain <${opts.domain}> items`);
      
      const { block } = require('./seen.js');
      
      return block({ log }, opts.domain).
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
  command("saved").
  option("-v --verbose", "Enable verbose logging").
  action(async (opts) => {
    const debug = (process.env.DEBUG == 1 || opts.verbose === true)
      ? (m, label = null) => {
        if (opts.logLabels.length === 0 || opts.logLabels.includes(label)) {
          const prefix = label ? `[DEBUG, ${label}]` : '[DEBUG]';

          fs.writeSync(1, `${prefix} ${m}\n`);
        }
      }
      : () => { };

    const { listSaved } = require('./seen.js');

    const allSaved = await
      listSaved({ log }).
        then(items    => items.map(item => item.id)).
        then(ids      => ids.map(id => single({ get }, {}, id))).
        then(promises => Promise.all(promises)).
        then(replies  => replies.map(it => it.body)).
        then(result   => result.map(JSON.parse));

    allSaved.forEach(story => {
      log(`${story.id} - ${story.title}`);
    });
  });

program.parse(process.argv);