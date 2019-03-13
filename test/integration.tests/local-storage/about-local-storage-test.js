const settings = require('../../acceptance.tests/support/settings');
const tools    = require('../support/system-interactor');

var path       = require('path');

const url      = `file://${path.resolve(__dirname, './how-to-use.html')}`;

const interactor = new tools.SystemInteractor(
  url, 
  settings.browserOptions,
  settings.log,
  settings.features);

describe('local storage', () => {
  it('examples', async () => {
    await interactor.run();

    const tests = interactor.collectTests();

    console.log(`${tests.map(m => `    ${m}`).join('\n')}`);
  });

  afterEach(async () => {
    await interactor.quit();
  });
});