const chalk     = require('chalk');
const { formatDistance, differenceInSeconds, differenceInMinutes, format } = require('date-fns')

const render = (ports, result, opts) => {
  const { debug, log } = ports;

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
        `${green(formatDistance(new Date(), new Date(arrival.departureTime)).padEnd(15))} ` + 
        `${green(arrivalTime(arrival))}` + 
        `${grey(scheduled)}`);
  });

  log('');

  debug(JSON.stringify(result, null, 2));
};

const arrivalTime = arrival => {
  const arrivalTime = new Date(arrival.departureTime);
  
  const diff = differenceInMinutes(arrivalTime, new Date());// moment.duration(arrivalTime.diff(new moment())).minutes();
  
  if (diff < 60) { 
    return format(arrivalTime, 'HH:mm aaa').padEnd(10);
  } else {
    return "".padEnd(10);
  }
} 

module.exports.render = render;