class BrowserInteractor {
  constructor(url, options, log = null, features = null) {
    this._url         = url;
    this._options     = options;
    this._browser     = null;
    this._page        = null;
    this._log         = log;
    this._features    = features;
    this._screenshot  = this._features.enableScreenshots
      ? async path => {
        await this._page.screenshot({ path });
        this._log(`Saved screenshot to <${path}>`);
      }
      : async _ => { };
    this._browserConsoleMessages = [];
  }

  async browser() {
    if (this._browser)
      return this._browser;

    const puppeteer = require('puppeteer');

    this._browser = await puppeteer.launch({ headless: false == this._options.showGui });

    return this._browser;
  }

  async page() {
    if (this._page)
      return this._page;

    const browser = await this.browser();
    this._page = await browser.newPage();

    // [!] This does not collect interpreter errors like:
    //   invoice.html:8 Uncaught ReferenceError: foo is not defined
    this._page.on('console', msg => this._browserConsoleMessages.push(msg)); // https://github.com/GoogleChrome/puppeteer/blob/master/test/page.spec.js#L323

    return this._page;
  }

  async quit() {
    if (this._options.showGui && this._options.noClose)
      return;

    const b = await this.browser();
    await b.close();

    this._page = null;
    this._browser = null;
  }

  pretty(what) {
    return JSON.stringify(what, null, 2);
  }
}

module.exports.BrowserInteractor = BrowserInteractor;