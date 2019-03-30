const { get, post } = require('../../internet');
const fs      = require('fs');
const log     = m => fs.writeSync(1, `${m}\n`);
let debug;

const program = require('commander');

program.
  version('0.0.1').
  command("new").
  option("-v --verbose", "Enable verbose logging").
  action(cmd => {
    debug     = (process.env.DEBUG == 1 || cmd.verbose === true) ? m => fs.writeSync(1, `[DEBUG] ${m}\n`) : _ => {};
    return get(process.env.RSS_URL, { }).
      then(log);
  });

program.parse(process.argv);