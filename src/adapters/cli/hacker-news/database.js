const sqlite3 = require('sqlite3').verbose();

class Database {
  constructor(fileName) {
    this._fileName = fileName;
  }

  schema() {
    return this.applySchema();
  };

  add(id, opts = {}) {
    return this.run(`REPLACE INTO ${opts.save ? 'saved' : 'seen'} (id) VALUES (?)`, id).
      then(()  => this.get(`SELECT COUNT(1) as count FROM  ${opts.save ? 'saved' : 'seen'}`)).
      then(row => row.count); 
  };
  
  delete() {
    const { unlink } = require('fs');

    const del = require('util').promisify(unlink);
    
    return del(this._fileName);
  }

  // private

  get(query, args) { return this.ex('get', query, args); }
  all(query, args) { return this.ex('all', query, args); }

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
  
  run(query, args) {
    return this.connected(db => {
      return new Promise((accept, reject) => {
        db.run(query, args, (e, row) => {
          if (e) {
            reject(e);
            return;
          }
  
          accept(row);
        })
      });
    });
  }

  applySchema(db){
    return Promise.all([
      this.run('CREATE TABLE IF NOT EXISTS seen     (id     text PRIMARY KEY)'), 
      this.run('CREATE TABLE IF NOT EXISTS saved    (id     text PRIMARY KEY);'), 
      this.run('CREATE TABLE IF NOT EXISTS blocked  (domain text PRIMARY KEY);')]);
  };

  connected(fn) {
    const db = this.open();

    return fn(db).finally(() => db.close());
  }

  open () {
    return new sqlite3.Database(this._fileName, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);
  }
}

module.exports.Database = Database;