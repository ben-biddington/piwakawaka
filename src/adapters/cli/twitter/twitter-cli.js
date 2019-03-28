const { get } = require('../../internet');
const fs      = require('fs');
const log     = m => fs.writeSync(1, `${m}\n`);
let debug;

const program = require('commander');

program.
  version('0.0.1').
  command("timeline").
  option("-v --verbose", "Enable verbose logging").
  action(cmd => {
    debug     = (process.env.DEBUG == 1 || cmd.verbose === true) ? m => fs.writeSync(1, `[DEBUG] ${m}\n`) : _ => {};

    // @todo: https://developer.twitter.com/en/docs/basics/authentication/overview/application-only
    return get('https://api.twitter.com/1.1/statuses/home_timeline.json', {}).
      then(text => { console.log(text); return text; });
  });

program.
  command('auth <key> <secret>').
  option("-v --verbose", "Enable verbose logging").
  action((key, secret, cmd) => {
    debug     = (process.env.DEBUG == 1 || cmd.verbose === true) ? m => fs.writeSync(1, `[DEBUG] ${m}\n`) : _ => {};
    
    const { getAuthHeader } = require('../twitter'); 
  });

program.parse(process.argv);