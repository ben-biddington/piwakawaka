const run       = require('../adapters/metlink-view').run;
const get       = require('../adapters/internet').get;
const fs        = require('fs');
const log       = m => fs.writeSync(1, `${m}\n`);

const program = require('commander');

const updateStops = (log, stopNumber) => {
  const fs        = require('fs');

  const { promisify } = require('util');
  const readFile      = promisify(fs.readFile);
  const writeFile     = promisify(fs.writeFile);
  const exists        = promisify(fs.exists);

  const fileName = "./.stops"; 

  return exists(fileName).
    then(fileExists => {
      if (false === fileExists)
        return writeFile("./.stops", '[]', "utf8");
       
      return Promise.resolve();
    }).
    then(()   => readFile(fileName, "utf8")).
    then(text => {
      const stops = JSON.parse(text || "[]");
      
      if (stops.filter(stop => stop == stopNumber).length === 0) {
        stops.push(stopNumber);
      }
      
      return stops;
    }).
    then(stops => writeFile("./.stops", JSON.stringify(stops), "utf8"));
}

const listStops = log => {
  const fs        = require('fs');

  const { promisify } = require('util');
  const readFile      = promisify(fs.readFile);
  const exists        = promisify(fs.exists);

  const fileName = "./.stops"; 

  return exists(fileName).
    then(fileExists => {
      if (false === fileExists)
        return writeFile("./.stops", '[]', "utf8");
       
      return Promise.resolve();
    }).
    then(()   => readFile(fileName, "utf8")).
    then(text => log(JSON.parse(text || "[]").join('\n')));
}

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