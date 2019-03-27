const run                         = require('../adapters/metlink-view').run;
const { listStops, updateStops }  = require('../adapters/metlink-stops-view');
const get                         = require('../adapters/internet').get;
const fs                          = require('fs');
const log                         = m => fs.writeSync(1, `${m}\n`);

const program = require('commander');

program.
  version('0.0.1').
  command("due <stopNumber> [routeNumber...]").
  option("-i --interval <interval>" , "How often to poll" , 30).
  option("-d --dryRrun"      , "Dry run only").
  option("-w --watch"        , "Watch and notify").
  option("-v --verbose"      , "Enable verbose logging").
  action((stopNumber, routeNumber, cmd) => {
    const opts = { 
      stopNumber, 
      routeNumber, 
      enableDebug:  process.env.DEBUG == 1,
      interval:     cmd.interval, 
      dryRun:       cmd.dryRun  || false,
      watch:        cmd.watch   || false,
      verbose:      cmd.verbose || false
    };
    
    const debug     = (process.env.DEBUG == 1 || cmd.verbose === true) ? m => fs.writeSync(1, `[DEBUG] ${m}\n`) : _ => {};

    return Promise.all([updateStops(log, stopNumber), run({ log, debug, get }, opts)]);
  });

program.
  command("stops").
  action(cmd => {
    listStops(log);
  });

program.parse(process.argv);