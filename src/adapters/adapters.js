const { Storage : LocalStorage }  = require('../adapters/local/storage');
const { realTime }                = require('./metlink');
const { top }                     = require('../adapters/hn');

const log             = m => console.log(`[LOG.ADAPTER] ${m}`);
const newLocalStorage = () => new LocalStorage();
const get             = (url, headers) 
  => fetch(url).then(reply => reply.text().then(body => ({ statusCode: reply.status, body })));

module.exports = { get, log, newLocalStorage, realTime, top }
