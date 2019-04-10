const Cloneable = require('./cloneable').Cloneable;

class FeatureToggle extends Cloneable {
  constructor(name, on = false) {
    super();
    this.name = name;
    this.on   = on === true;
  }

  with(onOrOff) {
    return this.clone(it => {
      it.on = onOrOff;
    });
  }
}

class FeatureToggles extends Cloneable {
  constructor() {
    super();
    this.enableSave         = new FeatureToggle("ENABLE_SAVE");
    this.enableVerboseLogs  = new FeatureToggle("ENABLE_VERBOSE_LOGS");
  }

  default() {
    return new FeatureToggles();
  }

  all() { return [ this.enableSave, this.enableVerboseLogs ] };

  forEach(fun) {
    const all = this.all();

    for (let index = 0; index < all.length; index++) {
      fun(all[index]);
    }
  }

  withEnableSave(on) {
    return this.clone(it => it.enableSave = this.enableSave.with(on));
  }
}

module.exports.FeatureToggle  = FeatureToggle;
module.exports.FeatureToggles = FeatureToggles;