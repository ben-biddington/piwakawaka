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

  get(query, args) {
    return this.connected(db => {
      return new Promise((accept, reject) => {
        db.get(query, args, (e, row) => {
          if (e) {
            reject(e);
            return;
          }
  
          accept(row);
        })
      });
    });
  }
  
  all(query, args) {
    return this.connected(db => {
      return new Promise((accept, reject) => {
        db.all(query, args, (e, row) => {
          if (e) {
            reject(e);
            return;
          }
  
          accept(row);
        })
      });
    });
  }

  delete() {
    const { unlink } = require('fs');

    const del = require('util').promisify(unlink);
    
    return del(this._fileName);
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
    return this.connected(db => Promise.all([this.createSeen(db), this.createSaved(db), this.createBlocked(db)]));
  };
  
  createSeen(db) {
    return new Promise((accept, reject) => {
      db.run(`
            CREATE TABLE IF NOT EXISTS seen (id text PRIMARY KEY);`, (e, row) => {
          if (e) {
            reject(e);
            return;
          }
  
          accept(row);
        });
    });
  };
  
  createSaved(db) {
    return new Promise((accept, reject) => {
      db.run(`
            CREATE TABLE IF NOT EXISTS saved (id text PRIMARY KEY);`, (e, row) => {
          if (e) {
            reject(e);
            return;
          }
  
          accept(row);
        });
    });
  };
  
  createBlocked(db) {
    return new Promise((accept, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS blocked (domain text PRIMARY KEY);`, (e, row) => {
          if (e) {
            reject(e);
            return;
          }
  
          accept(row);
        });
    });
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