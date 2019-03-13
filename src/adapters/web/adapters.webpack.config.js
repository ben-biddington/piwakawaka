var path = require('path');

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, '../adapters.js'),
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: 'adapters.bundle.js',
    libraryTarget: 'umd',
    globalObject: 'this',
    library: 'adapters'
  }
};