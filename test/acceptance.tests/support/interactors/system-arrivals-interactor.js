const BrowserInteractor = require('./internal/browser-interactor').BrowserInteractor;

class SystemArrivalsInteractor extends BrowserInteractor {
  constructor(url, settings) {
    super(url, settings.browserOptions, settings.log, settings.features);
    this._settings  = settings;
    this._log       = settings.log;
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

  quit() {
    BrowserInteractor.prototype.quit.call(this);
  }
}

class ConsoleArrivalsInteractor {
  constructor(ports = {}) {
    this._log = console.log;
    this._exitStatus = null;
  }

  async list(opts = {}) {
    const { stopNumber = '4130', routeNumber } = opts;

    const util = require('util');
    const exec = util.promisify(require('child_process').exec);

    this._cliStdout = [];
    this._cliStderr = [];

    // [i] http://man7.org/linux/man-pages/man7/signal.7.html
    const { stdout, stderr } = await exec(`bash bus due ${stopNumber} ${routeNumber}`);

    this._cliStdout = stdout.split('\n');
    this._cliStderr = stderr.split('\n').filter(it => it != "");
  }

  async getArrivals() {
    return this._cliStdout.
      map   (line     => line.match(/^\d+/gi)).
      filter(matches  => matches != null).
      map   (matches  => ({ code: matches[0] }));
  }

  async quit() { }

  mustNotHaveErrors() {
    const errors = this._cliStderr;

    if (errors.length > 0)
      throw new Error(`Expected no errors, got the following <${errors.length}>:\n\n${errors.join('\n')}`);
  }
}

module.exports.SystemArrivalsInteractor     = SystemArrivalsInteractor;
module.exports.ConsoleArrivalsInteractor    = ConsoleArrivalsInteractor;
module.exports.newConsoleArrivalsInteractor = () => new ConsoleArrivalsInteractor();