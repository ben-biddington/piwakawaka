const sqlite3 = require('sqlite3').verbose();

class Database {
  constructor(fileName) {
    this._fileName = fileName;
  }

  schema() {
    return this.applySchema();
  };

  addSeen(ids) { return this.add(ids); };
  addSaved(id) { return this.add(id, { save: true }); };

  listSeen()    { return this.all(`SELECT id from seen`) };
  listSaved()   { return this.all(`SELECT id from saved`) };
  listBlocked() { return this.all(`SELECT domain from blocked`) };
  
  delete() {
    const { unlink } = require('fs');

    const del = require('util').promisify(unlink);
    
    return del(this._fileName);
  }

  add(ids, opts = {}) {
    ids = ids.map ? ids : [ids];
    
    return this.run(`REPLACE INTO ${opts.save ? 'saved' : 'seen'} (id) VALUES ${ids.map(id => `('${id}')`).join(',')}`).
      then(()  => this.get(`SELECT COUNT(1) as count FROM  ${opts.save ? 'saved' : 'seen'}`)).
      then(row => row.count); 
  };

  block(domain) {
    return this.run(`REPLACE INTO blocked (domain) VALUES (?)`, domain).
      then(() => this.all(`SELECT domain as domain FROM blocked`)); 
  }

  unblock(domain) {
    return this.run(`DELETE FROM blocked WHERE domain = ?`, domain).
      then(() => this.all(`SELECT domain as domain FROM blocked`)); 
  }

  // private

  applySchema() {
    return this.run(      'CREATE TABLE IF NOT EXISTS seen     (id     text PRIMARY KEY)').
      then(() => this.run('CREATE TABLE IF NOT EXISTS saved    (id     text PRIMARY KEY);')).
      then(() => this.run('CREATE TABLE IF NOT EXISTS blocked  (domain text PRIMARY KEY);'));
  };

  get(query, args) { return this.ex('get', query, args); }
  all(query, args) { return this.ex('all', query, args); }
  run(query, args) { return this.ex('run', query, args); }

  ex(name, query, args) {
    return this.connected(db => {
      return new Promise((accept, reject) => {
        db[name](query, args, (e, row) => {
          if (e) {
            reject(e);
            return;
          }
  
          accept(row);
        })
      });
    });
  }

  connected(fn) {
    const db = this.open();

    return fn(db).finally(() => db.close());
  }

  open () {
    return new sqlite3.Database(this._fileName, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);
  }
}

module.exports.Database = Database;