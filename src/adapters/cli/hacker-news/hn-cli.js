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

  debug(count);

  return takeAsync(results, count, item => fn(item)).
    then(results => results.map(it => it.item));
}

program.
  version('0.0.1').
  command("pop").
  option("-v --verbose", "Enable verbose logging").
  option("-t --trace", "Enable trace logging").
  option("-l --logLabels <logLabels...>", "Log labels", []).
  option("-c --count <count>", "Count", 25).
  action(async (opts) => {
    debug = (process.env.DEBUG == 1 || opts.verbose === true)
      ? (m, label = null) => {
        if (opts.logLabels.length === 0 || opts.logLabels.includes(label)) {
          const prefix = label ? `[DEBUG, ${label}]` : '[DEBUG]';

          fs.writeSync(1, `${prefix} ${m}\n`);
        }
      }
      : () => { };

    const results = await topNew({ get, debug, cache: new DiskCache('.cache') }, { count: opts.count });

    let index = 1;

    const chalk = require('chalk');

    log(`\nShowing <${results.length}> stories\n`);

    const { exists } = require('./seen.js');

    const filtered = await Promise.all(results.map(async item => {
      const isSeen = await exists({ log }, item.id);
      return { ...item, isSeen };
    })).then(result => result.filter(it => false === it.isSeen && it.url));

    filtered.forEach(story => {
      const label = `${index++}.`;
      log(chalk.green(`${label.padEnd(3)}${story.title}\n`));
      log(`   ${story.url}\n`);
      log(`   ${story.id}\n`);
    });
  });

program.
  version('0.0.1').
  command("hide [id]").
  option("-v --verbose"         , "Enable verbose logging").
  option("-s --save"            , "Whether to save or hide", false).
  option("-c --count <count>"   , "How many to hide", 0).
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
        topNew({ get, debug }, { count: opts.count }).
        then(results => { log(results.map(it => it.id).join(', ')); return results; }).
        then(results => Promise.all(results.map(result => hide({ log }, result.id))));
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
        then(items => items.map(item => item.id)).
        then(ids => ids.map(id => single({ get }, {}, id))).
        then(promises => Promise.all(promises)).
        then(replies => replies.map(it => it.body)).
        then(result => result.map(JSON.parse));

    allSaved.forEach(story => {
      log(`${story.id} - ${story.title}`);
    });
  });

program.parse(process.argv);