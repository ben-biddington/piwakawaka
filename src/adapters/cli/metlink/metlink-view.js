const realTime  = require('../../metlink').realTime;

const run = (ports, opts) => {
  const { log, debug, get } = ports;
  const { interval, dryRun = false, enableSound = false } = opts;

  debug(JSON.stringify(opts));

  if (opts.watch === false)
    return realTime({ get, log }, opts).
      catch(e     => { throw e; }).
      then(result => render(ports, result, opts));

  const limit = 20;

  if (interval < limit)
    throw `Interval <${interval}> is too short, limit is <${limit}>`; 

  const notifier = require('node-notifier');

  const notify = result => {
    const moment  = require('moment');
    const path    = require('path');

    const message = result.arrivals.map(arrival => {
      return `${arrival.code.padEnd(4)} ${arrival.destination.padEnd(20)} ` + 
             `${moment.duration(arrival.departureInSeconds, "seconds").humanize()}`;
    }).join('\n');

    notifier.notify(
      {
        title: `${result.stop.name} (${result.stop.sms})`,
        message: message,
        time: 10000,
        sound: enableSound,
        wait: false,
        icon: path.join(__dirname, 'metlink.ico'),
        appId: 'xxx'
      }, function(args) {
        log(`${args}`);
      }
    );
  }

  log(`Starting watch, notifying every ${interval}s`);

  const action = () => {
    realTime({ get, log }, opts).
    catch(e     => { throw e; }).
    then(result => notify(result, opts));
  }

  action();

  if (dryRun === false) {
    setInterval(() => {
      action();
      log(new Date());
    }, interval*1000);
  } else {
    log(`[DRY-RUN] Not scheduling because dry run has value <${dryRun}>`);
  }

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
}

const render = (ports, result, opts) => {
  const {debug, log} = ports;

  log(`${result.stop.name} (${result.stop.sms})\n`);

  const moment = require('moment');

  if (opts.routeNumber != '') {
    log(`(Filtering to route number <${opts.routeNumber}>)\n`);
  }

  const arrivalTime = arrival => {
    const arrivalTime = moment(arrival.aimedArrival);

    if (arrivalTime.fromNow() < 60) { 
      return arrivalTime.format('HH:mm A').padEnd(10);
    } else {
      return "".padEnd(5);
    }
  } 

  result.arrivals.map(arrival => {
    const scheduled = arrival.isRealtime ? '' : 'SCHEDULED';
    log(`${arrival.code.padEnd(5)} ${arrival.destination.padEnd(20)} ${(arrival.status || '-').padEnd(10)} ` + 
        `${moment.duration(arrival.departureInSeconds, "seconds").humanize().padEnd(15)} ` + 
        `${arrivalTime(arrival)}` + 
        `${scheduled}`);
  });

  log('');

  debug(JSON.stringify(result, null, 2));
};

module.exports.run = run;
