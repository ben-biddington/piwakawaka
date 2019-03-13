const log = console.log;

const features = {
  enableScreenshots: process.env.ENABLE_SCREENSHOTS == 1 ,
  enableLog:         process.env.ENABLE_LOG == 1 || process.env.LOG == 1,
  enableDebug:       process.env.ENABLE_DEBUG == 1 || process.env.ENABLE_DEBUG == 1,
  hexagonal:         process.env.RUN_HEXAGONALLY == 1
};

viewAdapter = process.env.VIEW_ADAPTER || '';

const browserOptions = {
  showGui: process.env.BROWSER_ENABLE_GUI == 1,
  noClose: process.env.BROWSER_NO_CLOSE   == 1,
}

module.exports.log            = features.enableLog ? log : _ => {};
module.exports.features       = features;
module.exports.viewAdapter    = viewAdapter;
module.exports.browserOptions = browserOptions;