const FeatureToggles = require('../feature-toggles').FeatureToggles;
const FeatureToggle = require('../feature-toggles').FeatureToggle;

const parse = (urlText, log = _ => {}) => {
  const parseUrl = require('url').parse;
  const url = parseUrl(urlText || '');

  const params  = new URLSearchParams(parseUrl(url || '').search);

  let result = new FeatureToggles();

  if (params.has('ENABLE_SAVE')) {
    result = result.withEnableSave(params.get("ENABLE_SAVE") == 1)
  }

  log(`[queryStringFeatureToggles#parse] url <${urlText}> <${JSON.stringify(url)}> parsed to ${JSON.stringify(params)} and returning <${JSON.stringify(result)}>`);

  return result;
}

module.exports.parse = parse;