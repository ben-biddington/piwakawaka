const BrowserInteractor = require('./internal/browser-interactor').BrowserInteractor;

class SystemArrivalsInteractor extends BrowserInteractor {
  constructor(url, options, log = null, features = null) {
    super(url, options, log, features);
  }

  async list(opts = {}) {
    const { stopNumber = '4130', routeNumber } = opts;
    
    this._page = await this.page();

    const fullUrl = `${this._url}?stopNumber=${stopNumber}&routeNumbers=${routeNumber}`;

    await this._page.goto(fullUrl);
  }

  async getArrivals() {
    this._page = await this.page();

    await this._page.waitForSelector('div#arrivals ul');

    return await this._page.$$eval('div#arrivals ul li', items => items.map(it => ( { code: it.getAttribute("routeNumber") } )));
  }

  mustNotHaveErrors() {
    const util = require('util');
    this._log(`${util.inspect(this._browserConsoleMessages)}`);
    const errors = this._browserConsoleMessages.filter(m => m._type == 'error').map(m => this.pretty(m));

    if (errors.length > 0)
      throw new Error(`Expected no errors, got the following <${errors.length}>:\n\n${errors.join('\n')}`);
  }
}

module.exports.SystemArrivalsInteractor = SystemArrivalsInteractor;