const expect                            = require('chai').expect
const settings                          = require('./support/settings');
const { newSystemHackerNewsInteractor } = require('./support/interactors/system-hacker-news-interactor');

// [i] Use `DISABLE_SERVER=1` if server is already running
// [i] Run server with `npm run server`
let interactor;

describe('listing hacker news', () => {
  it.only('shows 5 items', async () => {
    // There is a problem with trying to start server on the same port
    interactor = newSystemHackerNewsInteractor('http://localhost:1080/vanilla/hn.html', settings);
    
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