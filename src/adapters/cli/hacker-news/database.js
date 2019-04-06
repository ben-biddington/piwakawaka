const sqlite3 = require('sqlite3').verbose();

class Database {
  constructor(fileName) {
    this._fileName = fileName;
  }

  schema() {
    return this.applySchema();
  };

  addSeen(id) { return this.add(id); };
  addSaved(id) { return this.add(id, { save: true }); };

  listSeen()  { return this.all(`SELECT id from seen`) };
  listSaved() { return this.all(`SELECT id from saved`) };
  
  delete() {
    const { unlink } = require('fs');

    const del = require('util').promisify(unlink);
    
    return del(this._fileName);
  }

  // private
  
  add(id, opts = {}) {
    return this.run(`REPLACE INTO ${opts.save ? 'saved' : 'seen'} (id) VALUES (?)`, id).
      then(()  => this.get(`SELECT COUNT(1) as count FROM  ${opts.save ? 'saved' : 'seen'}`)).
      then(row => row.count); 
  };

  applySchema(db){
    return Promise.all([
      this.run('CREATE TABLE IF NOT EXISTS seen     (id     text PRIMARY KEY)'), 
      this.run('CREATE TABLE IF NOT EXISTS saved    (id     text PRIMARY KEY);'), 
      this.run('CREATE TABLE IF NOT EXISTS blocked  (domain text PRIMARY KEY);')]);
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