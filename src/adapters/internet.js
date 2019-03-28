const get = (url, headers = {}) => {
  const request   = require("request");
  
  return new Promise(function(resolve, reject){
    request({ uri: url, headers }, (error, _, body) => {
      if (error){
        reject(error);
        return;
      }

      resolve(body);
    })  
  });
};

module.exports.get = get;