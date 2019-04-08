
class Database {
  constructor(config) {
    this._config = config;
    this._connection = null;
  }

  async run(fn) {
    return fn(this).finally(() => this.close());
  }

  async applySchema() {
    const sql = 'CREATE TABLE IF NOT EXISTS seen (id INT, timestamp DATE, saved BIT(0), PRIMARY KEY (id))';

    return this.connect().
      then(() => this.query('DROP TABLE seen')).
      then(() => this.query(sql));
  }

  async addSeen(id) {
    return this.connect().
      then(   () => this.query('INSERT into seen SET ?', { id, timestamp: new Date() })).
      finally(() => this.close());
  }

  async removeSeen(id) {
    return this.connect().
      then(   () => this.query('DELETE FROM seen WHERE id=?', id)).
      finally(() => this.close());
  }

  async listSeen() {
    return this.connect().
      then(   () => this.query('SELECT id from seen')).
      finally(() => this.close());
  }

  async clearSeen() {
    return this.connect().
      then(   () => this.query('DELETE from seen')).
      finally(() => this.close());
  }

  async addSaved(id) {
    return this.connect().
      then(   () => this.query('INSERT into seen SET ?', { id, timestamp: new Date(), saved: true })).
      finally(() => this.close());
  }

  async removeSaved(id) {
    return this.connect().
      then(   () => this.query('DELETE FROM seen WHERE id=?', id)).
      finally(() => this.close());
  }

  async listSaved() {
    return this.connect().
      then(   () => this.query('SELECT id from seen WHERE ?', { saved: true })).
      finally(() => this.close());
  }

  async clearSeen() {
    return this.connect().
      then(   () => this.query('DELETE from seen')).
      finally(() => this.close());
  }

  async connect() {
    if (this._connection)
      return Promise.resolve();

    const mysql      = require('mysql');
    
    this._connection = await mysql.createConnection(this._config, error => {
      if (error)
        throw error;
    });

    await new Promise((accept, reject) => {
      this._connection.connect(e => {
        if (e) {
          reject(e);
          return;
        }

        accept();
      });
    });  
  }

  async close() {
    if (this._connection) {
      await this._connection.end();
      this._connection = null;
    }
  }

  // private

  async query(sql, args) {
    return new Promise((accept, reject) => {
      this._connection.query(sql, args, (error, results, fields) => {
        if (error){
          reject(error);
          return;
        }

        accept(results);
      });
    });
  }
}

module.exports.Database = Database;