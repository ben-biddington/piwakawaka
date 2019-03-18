const Options = require('./options').Options;
const events  = require('events');

class HackerNewsApplication {
  constructor(ports, options = new Options()) {
    this._ports         = ports;
     
    this._events = new events.EventEmitter();
    
    const parse = require('../core/internal/queryStringFeatureToggles').parse;

    this.featureToggles = parse(options.url, this._ports.log);
  }

  onEdited(handler) {
    this._events.on('edited', handler);
  }
  
  async save(item) {
    this._ports.log(`[APPLICATION] Saving this item: ${JSON.stringify(item)}`);
    this._events.emit('saved', item);
    this._events.emit('message', {
      text: 'Item saved'
    });
  }

  onSaved(handler) {
    this._events.on('saved', handler);
  }

  onMessage(handler) {
    this._events.on('message', handler);
  }

  printFeatures(log) {
    this.featureToggles.forEach(toggle => { log(`[FEATURE-TOGGLE] ${toggle.name} = ${toggle.on}`) });
  }
}

module.exports.newHackerNewsApplication = (ports, opts = new Options()) => { return new HackerNewsApplication(ports, opts); }
module.exports.HackerNewsApplication    = HackerNewsApplication;
module.exports.Options                  = Options;