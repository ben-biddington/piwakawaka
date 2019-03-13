const realTime  = require('../adapters/metlink').realTime;
const fs        = require('fs');
const log       = m => fs.writeSync(1, `${m}\n`);
const debug     = process.env.DEBUG == 1 ? m => fs.writeSync(1, `[DEBUG] ${m}\n`) : _ => {};

const get = (url, headers) => {
    const request   = require("request");
    
    return new Promise(function(resolve, reject){
      request({ uri: url }, (error, _, body) => {
        if (error){
          reject(error);
          return;
        }
  
        resolve(body);
      })  
    });
};

const render = (result, opts) => {
  log(`${result.stop.name} (${result.stop.sms})\n`);

  const moment = require('moment');

  if (opts.routeNumber) {
    log(`(Filtering to route number <${opts.routeNumber}>)\n`);
  }

  result.arrivals.map(arrival => {
    log(` - ${arrival.code.padEnd(5)} ${arrival.destination.padEnd(20)} ${moment.duration(arrival.departureInSeconds, "seconds").humanize()}`);
  });

  debug(JSON.stringify(result, null, 2));
};

const program = require('commander');

program.
  version('0.0.1').
  command("due <stopNumber> [routeNumber...]").
  action((stopNumber, routeNumber) => {
    const opts = { stopNumber, routeNumber };

    realTime({ get }, opts).
      catch(e     => { throw e; }).
      then(result => render(result, opts));
  });

  program.parse(process.argv);
  
// debug(JSON.stringify(program, null, 2));