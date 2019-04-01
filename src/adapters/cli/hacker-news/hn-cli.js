const { get } = require('../../internet');
const fs      = require('fs');
const log     = m => fs.writeSync(1, `${m}\n`);
let debug;
const { top } = require('../../hn');

const program = require('commander');

program.
  version('0.0.1').
  command("pop").
  option("-v --verbose"                   , "Enable verbose logging").
  option("-t --trace"                     , "Enable trace logging").
  option("-l --logLabels <logLabels...>"  , "Log labels", []).
  option("-c --count <count>"             , "Count"     , []).
  action(async (opts) => {
    debug         = (process.env.DEBUG == 1 || opts.verbose === true) 
      ? (m, label = null) => {
        if (opts.logLabels.length === 0 || opts.logLabels.includes(label)) {
          const prefix = label ? `[DEBUG, ${label}]` : '[DEBUG]';

          fs.writeSync(1, `${prefix} ${m}\n`);
        }
      }
      : () => {};

    const results = await top({ get, debug }, { count: opts.count });

    let index = 1;

    const chalk = require('chalk');

    log(`\nShowing <${results.length}> stories\n`);

    results.forEach(story => {
      const label = `${index++}.`;
      log(chalk.green(`${label.padEnd(3)}${story.title}\n`));
      log(`   ${story.url}\n`);
      log(`   ${story.id}\n`);
    });
  });

program.
  version('0.0.1').
  command("hide [id]").
  option("-v --verbose"                   , "Enable verbose logging").
  option("-t --trace"                     , "Enable trace logging").
  option("-l --logLabels <logLabels...>"  , "Log labels", []).
  action(async (id, opts) => {
    debug         = (process.env.DEBUG == 1 || opts.verbose === true) 
      ? (m, label = null) => {
        if (opts.logLabels.length === 0 || opts.logLabels.includes(label)) {
          const prefix = label ? `[DEBUG, ${label}]` : '[DEBUG]';

          fs.writeSync(1, `${prefix} ${m}\n`);
        }
      }
      : () => {};

    // [i] http://lokijs.org/#/
    const loki = require('lokijs');

    var db = new loki('loki.json');

    const seen = db.addCollection('children');

    seen.insert({ id });

    log(`There are <${seen.count()}> seen items`);
  });

program.parse(process.argv);