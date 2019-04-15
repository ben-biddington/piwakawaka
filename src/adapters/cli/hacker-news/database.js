const sqlite3 = require('sqlite3').verbose();

class Database {
  constructor(fileName) {
    this._fileName          = fileName;
    this._hasAppliedSchema  = false;
  }

  schema() {
    if (false === this._hasAppliedSchema)
      return this.applySchema().then(() => this._hasAppliedSchema = true);

    return Promise.resolve();
  };

  addSeen(ids)  { return this.add(ids, { save: false }); };
  addSaved(ids) { return this.add(ids, { save: true }); };

  listSeen()    { return this.all(`SELECT id,date from seen order by date DESC`) };
  isUnseen(id)  { return this.isSeen(id).then(result => result === false); };  
  isSeen(id)    { return this.get(`SELECT 1 as isSeen from seen where id=?`, id).then(row => (row || { }).isSeen === 1); };
  listSaved()   { return this.all(`SELECT id from saved`) };
  listBlocked() { return this.all(`SELECT domain from blocked`) };
  
  delete() {
    const { unlink } = require('fs');

    const del = require('util').promisify(unlink);
    
    return del(this._fileName);
  }

  block(domain) {
    return this.run(`REPLACE INTO blocked (domain) VALUES (?)`, domain).
      then(() => this.all(`SELECT domain FROM blocked`)); 
  }

  isBlocked(id) { return this.get(`SELECT 1 as isBlocked from blocked where domain=?`, id).then(row => (row || { }).isBlocked === 1); };

  unblock(domain) {
    return this.run(`DELETE FROM blocked WHERE domain = ?`, domain).
      then(() => this.all(`SELECT domain as domain FROM blocked`)); 
  }

  // private

  add(ids, opts = {}) {
    ids = ids.map ? ids : [ids];

    const tableName = opts.save ? 'saved' : 'seen';

    return this.run(`REPLACE INTO ${tableName} (id) VALUES ${ids.map(id => `('${id}')`).join(',')}`).
      then(()  => this.get(`SELECT COUNT(1) as count FROM  ${tableName}`)).
      then(row => row.count); 
  };

  applySchema() {
    return this.run(      'CREATE TABLE IF NOT EXISTS seen     (id     text PRIMARY KEY)').
      then(() => this.run('CREATE TABLE IF NOT EXISTS saved    (id     text PRIMARY KEY);')).
      then(() => this.run('CREATE TABLE IF NOT EXISTS blocked  (domain text PRIMARY KEY);')).
      then(() => this.run('ALTER TABLE seen ADD COLUMN date dateTime'));
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