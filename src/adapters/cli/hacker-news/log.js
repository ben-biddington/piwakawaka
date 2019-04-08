const fs      = require('fs');

const info = m => fs.writeSync(1, `${m}\n`);

const selectDebug = (opts) => (process.env.DEBUG == 1 || opts.verbose === true)
  ? (m, label = null) => {
    if (opts.logLabels.length === 0 || opts.logLabels.includes(label)) {
      const prefix = label ? `[DEBUG, ${label}]` : '[DEBUG]';

      fs.writeSync(1, `${prefix} ${m}\n`);
    }
  }
  : () => { };

module.exports.selectDebug  = selectDebug
module.exports.info         = info