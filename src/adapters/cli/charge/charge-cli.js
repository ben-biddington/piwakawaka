const { list }                    = require('./charge-list-command');
const { render: consoleRender }   = require('./internal/console-render');
const { get }                     = require('../../internet');
const fs                          = require('fs');
const log                         = m => fs.writeSync(1, `${m}\n`);
let debug;

const program = require('commander');

program.
  version('0.0.1').
  command("info").
  option("-v --verbose", "Enable verbose logging").
  action((cmd) => {
    debug     = (process.env.DEBUG == 1 || cmd.verbose === true) 
      ? m => fs.writeSync(1, `[DEBUG] ${m}\n`) 
      : _ => {};

    const render = result => consoleRender({ console: log }, result);

    return list({ get, render }, {});
  });

program.parse(process.argv);