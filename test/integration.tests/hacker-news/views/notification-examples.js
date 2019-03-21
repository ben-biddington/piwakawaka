const expect                            = require('chai').expect
const settings                          = require('../../../acceptance.tests/support/settings');
const { newSystemHackerNewsInteractor } = require('../../../acceptance.tests/support/interactors/system-hacker-news-interactor');

// [i] Use `DISABLE_SERVER=1` if server is already running
// [i] Run server with `npm run server`
let interactor;

describe.only('Saving hacker news items', () => {
  it('notifies with <save> action', async () => {
    interactor = newSystemHackerNewsInteractor('http://localhost:1080/vanilla/hn.html', settings);
    
    const stubTop = () => [];

    await interactor.supplyPorts({ top: stubTop });

    await interactor.list({ count: '5' });

    const newsItems = await interactor.getNewsItems();

    interactor.mustNotHaveErrors();

    expect(newsItems).to.not.be.empty;
    
    newsItems.every(newsItem => expect(newsItem.title).to.not.be.null);
  });

  after(async () => {
    await interactor.quit();
  })
})