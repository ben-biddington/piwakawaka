const fakeGet = filePath => (url, headers) => {
  const fs = require('fs');
  return new Promise(function(resolve, reject){
    fs.readFile(filePath, 'utf-8', (err, data) => {
        err ? reject(err) : resolve(data);
    });
  });
};

const cannedGet = (json) => {
  return (_, __) => {
    return Promise.resolve(json);
  };
}

module.exports.fakeGet   = fakeGet;
module.exports.cannedGet = cannedGet;