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
  action(async (opts) => {
    debug         = (process.env.DEBUG == 1 || opts.verbose === true) 
      ? (m, label = null) => {
        if (opts.logLabels.length === 0 || opts.logLabels.includes(label)) {
          const prefix = label ? `[DEBUG, ${label}]` : '[DEBUG]';

          fs.writeSync(1, `${prefix} ${m}\n`);
        }
      }
      : () => {};

    const results = await top({ get, debug });

    let index = 1;

    results.forEach(story => {
      log(`${index++}. ${story.title}\n     ${story.url}\n`);
    });
  });

program.parse(process.argv);