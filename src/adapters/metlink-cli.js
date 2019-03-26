const realTime  = require('../adapters/metlink').realTime;
const fs        = require('fs');
const log       = m => fs.writeSync(1, `${m}\n`);
const debug     = process.env.DEBUG == 1 ? m => fs.writeSync(1, `[DEBUG] ${m}\n`) : _ => {};

const get = url => {
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
    command("watch <intervalInSeconds> <stopNumber> [routeNumber...]").
    action((intervalInSeconds = 30, stopNumber, routeNumber) => {
      const opts = { stopNumber, routeNumber, enableDebug: process.env.DEBUG == 1 };
      
      const notifier = require('node-notifier');

      const notify = (result, opts) => {
        const moment = require('moment');

        const message = result.arrivals.map(arrival => {
          return `${arrival.code.padEnd(5)} ${arrival.destination.padEnd(10)} ` + 
                 `${(arrival.status || '-').padEnd('10')} ` +
                 `${moment.duration(arrival.departureInSeconds, "seconds").humanize()}`;
        }).join('\n');

        notifier.notify(
          {
            title: `${result.stop.name} (${result.stop.sms})`,
            message: message,
            time: 10000,
            sound: false,
            wait: false
          }, function(args) {
            log(`${args}`);
          }
        );
      }

      log(`Starting watch, notifying every ${intervalInSeconds}s`);

      const action = () => {
        realTime({ get, log }, opts).
        catch(e     => { throw e; }).
        then(result => notify(result, opts));
      }

      action();

      setInterval(action, intervalInSeconds*1000);

      const readline = require('readline');

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      return new Promise((resolve, reject) => {
        rl.question('Press any key to quit', () => {
          rl.close();
          log(`Stopping...`);
          resolve();
        })
      });
    })

program.parse(process.argv);