const realTime  = require('../adapters/metlink').realTime;
const run       = require('../adapters/metlink-view').run;
const get       = require('../adapters/internet').get;
const fs        = require('fs');
const log       = m => fs.writeSync(1, `${m}\n`);
const debug     = process.env.DEBUG == 1 ? m => fs.writeSync(1, `[DEBUG] ${m}\n`) : _ => {};

const render = (result, opts) => {
  log(`${result.stop.name} (${result.stop.sms})\n`);

  const moment = require('moment');

  if (opts.routeNumber) {
    log(`(Filtering to route number <${opts.routeNumber}>)\n`);
  }

  result.arrivals.map(arrival => {
    const scheduled = arrival.isRealtime ? '' : 'SCHEDULED';
    log(`${arrival.code.padEnd(5)} ${arrival.destination.padEnd(20)} ${(arrival.status || '-').padEnd('20')} ` + 
        `${moment.duration(arrival.departureInSeconds, "seconds").humanize().padEnd(15)} ` + 
        `${scheduled}`);
  });

  debug(JSON.stringify(result, null, 2));
};

const program = require('commander');

program.
  version('0.0.1').
  command("due <stopNumber> [routeNumber...]").
  action((stopNumber, routeNumber) => {
    const opts = { stopNumber, routeNumber, enableDebug: process.env.DEBUG == 1 };
    realTime({ get, log }, opts).
      catch(e     => { throw e; }).
      then(result => render(result, opts));
  });

  program.
    command("watch <stopNumber> [routeNumber...]").
    option("-i --interval <interval>" , "How often to poll" , 30).
    option("-d --dryRrun"             , "Dry run only"      , false).
    action((stopNumber, routeNumber, cmd) => {
      const opts = { 
        stopNumber, 
        routeNumber, 
        enableDebug: process.env.DEBUG == 1,
        interval: cmd.interval, 
        dryRun:   cmd.dryRun
       };

      return run({ log }, opts);
    })

program.parse(process.argv);