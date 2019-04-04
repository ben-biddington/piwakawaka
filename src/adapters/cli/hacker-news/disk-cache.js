const fs        = require('fs');
const util      = require('util');
const path      = require('path');
const write     = util.promisify(fs.writeFile);
const exists    = util.promisify(fs.exists);
const mkdir     = util.promisify(fs.mkdir);
const read      = util.promisify(fs.readFile);

class DiskCache {
  constructor(dir) {
    this._dir = dir;
  }

  async set(name, what) {
    return write(this.fullPath(name), JSON.stringify(what));
  }

  async ensureDir() {
    return exists(this._dir).then(okay => okay === true ? Promise.resolve() : mkdir(this._dir));
  };

  async get(name) {
    const fullFilePath = this.fullPath(name);

    return this.ensureDir().
      then(()   => exists(fullFilePath)).
      then(yes  => yes ? read(fullFilePath, 'utf8').then(JSON.parse) : Promise.resolve());
  }

  fullPath(name) {
    return path.join(this._dir, name.toString())
  };
}

module.exports.DiskCache = DiskCache;