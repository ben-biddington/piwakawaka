const { run }                     = require('./metlink-view');
const { listStops, updateStops }  = require('./metlink-stops-view');
const { get }                     = require('../../internet');
const fs                          = require('fs');
const log                         = m => fs.writeSync(1, `${m}\n`);
let debug;

const program = require('commander');

program.
  version('0.0.1').
  command("due <stopNumber> [routeNumber...]").
  option("-d --dryRrun"             , "Dry run only").
  option("-w --watch [watch]"       , "Watch and notify", 30).
  option("-v --verbose"             , "Enable verbose logging").
  option("-s --sound"               , "Play sound").
  option("-l --limit <limit>"       , "Limit how many results", 3).
  action((stopNumber, routeNumber, cmd) => {
    const opts = { 
      stopNumber, 
      routeNumber, 
      enableDebug:  process.env.DEBUG == 1,
      interval:     cmd.watch, 
      dryRun:       cmd.dryRun  || false,
      watch:        program.rawArgs.includes('-w') || program.rawArgs.includes('--watch'),
      verbose:      cmd.verbose || false,
      enableSound:  cmd.sound   || false,
      limit:        cmd.limit
    };
    
    debug     = (process.env.DEBUG == 1 || cmd.verbose === true) ? m => fs.writeSync(1, `[DEBUG] ${m}\n`) : _ => {};

    return Promise.all([updateStops(log, stopNumber), run({ log, debug, get }, opts)]);
  });

program.
  command("stops").
  action(() => listStops({ log, debug, get }, { enableDebug: process.env.DEBUG == 1 }));

program.parse(process.argv);