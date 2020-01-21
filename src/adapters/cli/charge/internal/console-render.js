const chalk     = require('chalk');

const render = (ports, result) => {
  const { console } = ports;

  const green   = chalk.green;
  const yellow  = chalk.yellow;
  const grey    = chalk.green.dim;

  console(`There are <${result.length}> stations.`);
  console(`The first one looks like this:`);
  console(`${JSON.stringify(result[0], null, 2)}`);
};

module.exports.render = render;