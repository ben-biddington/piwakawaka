const realTime  = require('../../metlink').realTime;
const { watch } = require('./metlink-watch');
const moment    = require('moment');
const chalk     = require('chalk');

const run = (ports, opts) => {
  const { log, debug, get } = ports;

  debug(JSON.stringify(opts));

  if (opts.watch === false)
    return realTime({ get, log }, opts).
      catch(e     => { throw e; }).
      then(result => render(ports, result, opts));

  return watch(ports, opts);
}

const render = (ports, result, opts) => {
  const {debug, log} = ports;

  log(`${result.stop.name} (${result.stop.sms})\n`);


  if (opts.routeNumber != '') {
    log(`(Filtering to route number <${opts.routeNumber}>)\n`);
  }

  const green   = chalk.green;
  const yellow  = chalk.yellow;
  const grey    = chalk.green.dim;

  result.arrivals.map(arrival => {
    const scheduled = arrival.isRealtime ? '' : 'SCHEDULED';
    log(`${chalk.bgYellow.black(arrival.code.padEnd(5))} ${yellow(arrival.destination.padEnd(20))} ${(arrival.status || '-').padEnd(10)} ` + 
        `${green(moment.duration(arrival.departureInSeconds, "seconds").humanize().padEnd(15))} ` + 
        `${green(arrivalTime(arrival))}` + 
        `${grey(scheduled)}`);
  });

  log('');

  debug(JSON.stringify(result, null, 2));
};

const arrivalTime = arrival => {
  const arrivalTime = moment(arrival.departureTime);
  
  const diff = moment.duration(arrivalTime.diff(new moment())).minutes();
  
  if (diff < 60) { 
    return arrivalTime.format('HH:mm A').padEnd(10);
  } else {
    return "".padEnd(5);
  }
} 

module.exports.run = run;
