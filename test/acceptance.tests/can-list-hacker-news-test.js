const expect                            = require('chai').expect
const settings                          = require('./support/settings');
const { newSystemHackerNewsInteractor } = require('./support/interactors/system-hacker-news-interactor');

let interactor;

describe('listing hacker news', () => {
  it('shows 5 items', async () => {
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