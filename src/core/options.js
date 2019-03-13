const FeatureToggles  = require('./feature-toggles').FeatureToggles;

class Options {
  constructor(url) {
    this.featureToggles = new FeatureToggles() 
    this.url = url;
  }

  default() {
    return new Options();
  }
}

module.exports.Options = Options;