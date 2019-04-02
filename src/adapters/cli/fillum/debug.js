const fs = require('fs');

const debug = (m, label = null) => {
  const prefix = label ? `[DEBUG, ${label}]` : '[DEBUG]';

  fs.writeSync(1, `${prefix} ${m}\n`);
};

module.exports.debug = debug;