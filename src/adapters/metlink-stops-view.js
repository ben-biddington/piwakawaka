const fileName = "./.stops"; 

const updateStops = (log, stopNumber) => {
    const fs        = require('fs');
  
    const { promisify } = require('util');
    const readFile      = promisify(fs.readFile);
    const writeFile     = promisify(fs.writeFile);
    const exists        = promisify(fs.exists);
    
    const read  = ()    => readFile (fileName,       'utf8');
    const write = text  => writeFile(fileName, text, 'utf8');

    return exists(fileName).
      then(fileExists => {
        if (false === fileExists)
          return write('');
         
        return Promise.resolve();
      }).
      then(read).
      then(text => {
        const stops = text.split('\n').filter(line => line.length > 0);
        
        if (false === stops.includes(stopNumber)) {
          stops.push(stopNumber);
        }

        return stops.join('\n');
      }).
      then(write);
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