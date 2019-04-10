const expect                            = require('chai').expect
const settings                          = require('./support/settings');
const { choose: chooseInteractor }      = require('./support/interactors/interactors');

const interactor = chooseInteractor(settings);

describe('listing arrivals', () => {
  it('shows filtered bus numbers only', async () => {
    await interactor.list({ stopNumber: '4130', routeNumber: '14' });

    const arrivals = await interactor.getArrivals();

    interactor.mustNotHaveErrors();

    expect(arrivals).to.not.be.empty;
    
    arrivals.every(arrival => expect(arrival.code).to.equal('14'));
  });

  it('non-existent route number produces no results', async () => {
    await interactor.list({ stopNumber: '4130', routeNumber: 'xxx' });

    const arrivals = await interactor.getArrivals();

    interactor.mustNotHaveErrors();

    expect(arrivals).be.empty;
  });

  after(async () => {
    await interactor.quit();
  })
})