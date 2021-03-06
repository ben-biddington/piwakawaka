const BrowserInteractor = require('./internal/browser-interactor').BrowserInteractor;
const util = require('util');

class SystemHackerNewsInteractor extends BrowserInteractor {
  constructor(url, settings) {
    super(url, settings.browserOptions, settings.log, settings.features);
    this._settings  = settings;
    this._log       = settings.log;
  }

  async supplyPorts(ports = {}) {
    this._page = await this.page();

    await this._page.evaluate(fun => {
      core.queryWith(() => eval(fun)());

      core.onSaved(e => console.log(`[ACTION.SAVED]`));
      
      window.console.log(`Reset hacker news port and added action listener`);

      core.news();
    }, ports.top.toString());
  }

  async unplug() {
    await this.page();
    await this._page.goto(`${this._url}?unplugged=true`);
    await this._page.waitForSelector('div#news');
  }

  async list(opts = {}) {
    const { count = '5' } = opts;
    
    this._page = await this.page();

    const fullUrl = `${this._url}?count=${count}`;

    await this._page.goto(fullUrl);
  }

  async save(id) {
    this._page = await this.page();

    await this._page.click(`#save-${id}`);
  }

  async getNewsItems() {
    this._page = await this.page();

    await this._page.waitForSelector('div#news li');

    return await this._page.$$eval('div#news li', items => items.map(it => ( { title: it.innerHTML } )));
  }

  async getNotifications() {
    return this._browserConsoleMessages.
      filter(it => it._text.match(/\[ACTION/g)).
      map(it => ({ type: it._text.toString().toLowerCase() }));
  }

  mustNotHaveErrors() {
    this._log(`${util.inspect(this._browserConsoleMessages)}`);
    const errors = this._browserConsoleMessages.filter(m => m._type == 'error').map(m => this.pretty(m));

    if (errors.length > 0)
      throw new Error(`Expected no errors, got the following <${errors.length}>:\n\n${errors.join('\n')}`);
  }

  quit() {
    BrowserInteractor.prototype.quit.call(this);
  }
}

module.exports.newSystemHackerNewsInteractor  = (url, settings) => new SystemHackerNewsInteractor(url, settings);
module.exports.SystemHackerNewsInteractor     = SystemHackerNewsInteractor