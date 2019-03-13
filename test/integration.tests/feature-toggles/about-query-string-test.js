const expect      = require('chai').expect;
const Application = require('../../../src/core/application').Application;
const Options     = require('../../../src/core/application').Options;

describe('setting feature toggles by query string', () => {
  it('examples', async () => {
    let application = new Application({}, new Options('?ENABLE_SAVE=1'));
    
    expect(application.featureToggles.enableSave.on).to.equal(true);

    application = new Application({}, new Options('?ENABLE_SAVE=0'));
    
    expect(application.featureToggles.enableSave.on).to.equal(false);
    
    expect(application.featureToggles.enableSave.name).to.equal('ENABLE_SAVE');
  });

  it('accepts a full url, too', async () => {
    let application = new Application({}, new Options('http://abc/def?ENABLE_SAVE=1'));
    
    expect(application.featureToggles.enableSave.on).to.equal(true);

    application = new Application({}, new Options('http://abc/def?ENABLE_SAVE=0'));
    
    expect(application.featureToggles.enableSave.on).to.equal(false);
    
    expect(application.featureToggles.enableSave.name).to.equal('ENABLE_SAVE');
  });

  it('defaults to off', async () => {
    let application = new Application({}, new Options());
    
    expect(application.featureToggles.enableSave.on).to.equal(false);
  });

  it('it uses the first value when toggle appears more than once', async () => {
    let application = new Application({}, new Options('http://abc/def?ENABLE_SAVE=1&ENABLE_SAVE=0'));
    
    expect(application.featureToggles.enableSave.on).to.equal(true);
  });
});