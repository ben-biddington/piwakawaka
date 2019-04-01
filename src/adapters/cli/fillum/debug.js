const debug = (m, label = null) => {
  if (opts.logLabels.length === 0 || opts.logLabels.includes(label)) {
    const prefix = label ? `[DEBUG, ${label}]` : '[DEBUG]';

    fs.writeSync(1, `${prefix} ${m}\n`);
  }
};

module.exports.default = debug;