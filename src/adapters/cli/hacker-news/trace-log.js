class TraceLog {
  constructor(enabled = true) {
    this._messages = [];
    this._enabled  = enabled;
  }

  record(m) {
    if (this._enabled === true) {
      this._messages.push(m);
    }
  }

  forEach(fn) {
    this._messages.forEach(fn);
  }
}

module.exports.TraceLog = TraceLog;