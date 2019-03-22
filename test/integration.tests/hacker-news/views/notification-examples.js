const expect                            = require('chai').expect
const settings                          = require('../../../acceptance.tests/support/settings');
const { newSystemHackerNewsInteractor } = require('../../../acceptance.tests/support/interactors/system-hacker-news-interactor');

// [i] Use `DISABLE_SERVER=1` if server is already running
// [i] Run server with `npm run server`
let interactor;

describe('[WIP] Saving hacker news items', () => {
  it('notifies with <save> action', async () => {
    interactor = newSystemHackerNewsInteractor('http://localhost:1080/vanilla/hn.html', settings);
    //../../../../src/adapters/web/vanilla/hn.html
    const stubTop = () => Promise.resolve([{
      "id":     19415983,
      "title":  "Sample",
      "url":    "http://www.purl.org/stefan_ram/pub/doc_kay_oop_en",
      "host":    "www.purl.org",
    }]);
    
    await interactor.unplug();
    
    await interactor.supplyPorts({ top: stubTop });

    await interactor.save(19415983);

    const notifications = await interactor.getNotifications().then(result => result.map(notification => notification.type));

    expect(notifications).to.contain('[action.saved]');

    interactor.mustNotHaveErrors();
  });

  after(async () => {
    if (interactor) {
      await interactor.quit();
    }
  })
})