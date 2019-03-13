const Options = require('./options').Options;
const events  = require('events');

class Application {
  constructor(ports, options = new Options()) {
    this._ports         = ports;
    this._invoice       = {};
    
    this._events = new events.EventEmitter();
    
    const parse = require('../core/internal/queryStringFeatureToggles').parse;

    this.featureToggles = parse(options.url, this._ports.log);
  }

  async edit(invoice) {
    const lineItem =  invoice.lineItems[0];

    this._invoice = {
      lineItems: [
        {
          quantity: lineItem.quantity, 
          unitPrice: lineItem.unitPrice, 
          total: lineItem.quantity*lineItem.unitPrice
        }
      ]
    }
    
    this._ports.log(`[APPLICATION] Edited invoice: ${JSON.stringify(this._invoice)}`);

    this._events.emit('edited', this._invoice);
  }

  onEdited(handler) {
    this._events.on('edited', handler);
  }
  
  async save() {
    this._ports.log(`[APPLICATION] Saving this invoice: ${JSON.stringify(this._invoice)}`);
    this._events.emit('saved', this._invoice);
    this._events.emit('message', {
      text: 'Invoice saved'
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

module.exports.newApplication = (ports, opts = new Options()) => { return new Application(ports, opts); }
module.exports.Application = Application;
module.exports.Options = Options;