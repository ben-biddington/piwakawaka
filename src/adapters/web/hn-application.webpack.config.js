var path = require('path');

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, '../../core/hn-application.js'),
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: 'hn-application.bundle.js',
    libraryTarget: 'umd',
    globalObject: 'this',
    library: 'application'
  }
};