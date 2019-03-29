const get = (url, headers = {}) => {
  const request   = require("request");
  
  return new Promise(function(resolve, reject){
    request({ method: 'get', uri: url, headers }, (error, reply, body) => {
      if (error){
        reject(error);
        return;
      }

      resolve(reply);
    })  
  });
};

const post = (url, headers = {}, body = {}) => {
  const request   = require("request");
  
  const _body = Object.keys(body).map(key => `${key}=${body[key]}`).join('&');

  return new Promise(function(resolve, reject){
    request({ method: 'post', uri: url, headers, body: _body }, (error, reply, body) => {
      if (error){
        reject(error);
        return;
      }

      resolve(reply);
    })  
  });
};

module.exports.get  = get;
module.exports.post = post;