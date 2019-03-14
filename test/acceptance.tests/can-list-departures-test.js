const expect                            = require('chai').expect
const settings                          = require('./support/settings');
const { choose: chooseInteractor }      = require('./support/interactors/interactors');
const { newConsoleArrivalsInteractor }  = require('./support/interactors/system-arrivals-interactor');

const interactor = newConsoleArrivalsInteractor({ log : settings.log }); //chooseInteractor(settings);

// [i] Use `DISABLE_SERVER=1` if server is already running
// [i] Run server with `npm run server`

let server;

describe('listing arrivals', () => {
  before(() => {
    if (settings.features.enableServer){
      // [i] https://nodejs.org/api/child_process.html#child_process_event_message
      const { spawn } = require('child_process');
      server = spawn('node', ['src/adapters/web/server.js']);

      server.stdout.on('data', (data) => {
        settings.log(`stdout: ${data}`);
      });
    }
  });

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

    if (settings.features.enableServer){
      server.kill();
    }
  })
})