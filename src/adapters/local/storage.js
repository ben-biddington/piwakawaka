class Storage {
  constructor() {
    this._storage = window.localStorage;
  }

  save(key, what) {
    this._storage.setItem(key, JSON.stringify(what));
  }

  get(key) {
    return JSON.parse(this._storage.getItem(key));
  }

  clear() {
    return this._storage.clear();
  }
}

module.exports.Storage = Storage;