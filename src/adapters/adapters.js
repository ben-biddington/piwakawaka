const { Storage : LocalStorage } = require('../adapters/local/storage');
const { realTime } = require('../adapters/metlink');

const log = m => console.log(`[LOG.ADAPTER] ${m}`);
const newLocalStorage = () => new LocalStorage();

module.exports = { log, newLocalStorage, realTime }
