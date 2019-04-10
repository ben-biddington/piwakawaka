const expect                      = require('chai').expect
const settings                    = require('../../../acceptance.tests/support/settings');
const SystemHackerNewsInteractor  = require('../../../acceptance.tests/support/interactors/system-hacker-news-interactor').SystemHackerNewsInteractor;

let interactor;

describe('[WIP] Saving hacker news items', () => {
  it('notifies with <save> action', async () => {
    interactor = new SystemHackerNewsInteractor('http://localhost:1080/vanilla/hn.html', settings);
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