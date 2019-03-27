const fileName = "./.stops"; 

const updateStops = (log, stopNumber) => {
    const fs        = require('fs');
  
    const { promisify } = require('util');
    const readFile      = promisify(fs.readFile);
    const writeFile     = promisify(fs.writeFile);
    const exists        = promisify(fs.exists);
  
    return exists(fileName).
      then(fileExists => {
        if (false === fileExists)
          return writeFile(fileName, '', "utf8");
         
        return Promise.resolve();
      }).
      then(()   => readFile(fileName, "utf8")).
      then(text => {
        const stops = text.split('\n').filter(line => line.length > 0);
        
        if (stops.filter(stop => stop == stopNumber).length === 0) {
          stops.push(stopNumber);
        }

        return stops;
      }).
      then(stops => writeFile(fileName, stops.join('\n'), "utf8"));
  }
  
  const listStops = log => {
    const fs        = require('fs');
  
    const { promisify } = require('util');
    const readFile      = promisify(fs.readFile);
    const exists        = promisify(fs.exists);
  
    return exists(fileName).
      then(fileExists => {
        if (fileExists === true)
          return readFile(fileName, "utf8");
         
        return Promise.resolve('No stops on file');
      }).
      then(log);
  }

  module.exports.updateStops = updateStops;
  module.exports.listStops = listStops;