const realTime  = require('../../metlink').realTime;
const { watch } = require('./metlink-watch');
const { render } = require('./internal/console-render');

const run = (ports, opts) => {
  const { log, debug, get } = ports;

  debug(JSON.stringify(opts));

  if (opts.watch === false)
    return realTime({ get, log }, opts).
      catch(e     => { throw e; }).
      then(result => render(ports, result, opts));

  return watch(ports, opts);
}

module.exports.run = run;
