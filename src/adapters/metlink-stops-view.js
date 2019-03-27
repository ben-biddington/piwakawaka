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
        if (fileExists === true)
          return readFile(fileName, "utf8");
         
        return Promise.resolve();
      }).
      then(text => log(JSON.parse(text || "[]").join('\n')));
  }

  module.exports.updateStops = updateStops;
  module.exports.listStops = listStops;