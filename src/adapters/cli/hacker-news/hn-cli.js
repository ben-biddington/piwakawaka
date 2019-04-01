const { get } = require('../../internet');
const fs = require('fs');
const util = require('util');
const log = m => fs.writeSync(1, `${m}\n`);
let debug;
const { top, single } = require('../../hn');

const program = require('commander');

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

    const results = await top({ get, debug }, { count: opts.count });

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
  command("hide <id>").
  option("-v --verbose", "Enable verbose logging").
  option("-s --save", "Whether to save or hide", false).
  action(async (id, opts) => {
    debug = (process.env.DEBUG == 1 || opts.verbose === true)
      ? (m, label = null) => {
        if (opts.logLabels.length === 0 || opts.logLabels.includes(label)) {
          const prefix = label ? `[DEBUG, ${label}]` : '[DEBUG]';

          fs.writeSync(1, `${prefix} ${m}\n`);
        }
      }
      : () => { };

    const { add } = require('./seen.js');

    const count = await add({ log }, id, { save: opts.save });

    log(`You have <${count}> ${opts.save ? 'saved' : 'seen'} items`);
  });

program.
  version('0.0.1').
  command("saved").
  option("-v --verbose", "Enable verbose logging").
  action(async (opts) => {
    debug = (process.env.DEBUG == 1 || opts.verbose === true)
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