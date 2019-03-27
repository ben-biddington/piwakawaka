const fs            = require('fs');
const { promisify } = require('util');
const readFile      = promisify(fs.readFile);
const writeFile     = promisify(fs.writeFile);
const exists        = promisify(fs.exists);

const fileName = "./.stops";

const readLines = ()  => readFile(fileName, 'utf8').
  then(         text  => text.split('\n')).
  then(         lines => lines.filter(line => line.length > 0));

const updateStops = (log, stopNumber) => {
  const write = text => writeFile(fileName, text, 'utf8');

  return exists(fileName).
    then(fileExists => {
      if (false === fileExists)
        return write('');

      return Promise.resolve();
    }).
    then(readLines).
    then(stops => {
      if (false === stops.includes(stopNumber)) {
        stops.push(stopNumber);
      }

      return stops.join('\n');
    }).
    then(write);
}

const listStops = (ports = {}, opts = {}) => {
  const { log, get }    = ports;
  const { enableDebug } = opts;

  const detail = (stopNumbers = []) => require('../../metlink').stops({ get, log }, { enableDebug }, ...stopNumbers);

  return exists(fileName).
    then(fileExists => {
      if (fileExists === true)
        return readFile(fileName, "utf8");

      return Promise.resolve('No stops on file');
    }).
    then(readLines).
    then(lines    => detail(lines)).
    then(results  => results.map(result => log(`${result.sms.padEnd(20)} - ${result.name}`)));
}

module.exports.updateStops  = updateStops;
module.exports.listStops    = listStops;