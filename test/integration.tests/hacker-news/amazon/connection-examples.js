const expect    = require('chai').expect;
const read      = require('fs').readFileSync;
const exists    = require('fs').existsSync;
const filename  = './.conf/.mysql'

const config = exists(filename) ? JSON.parse(read(filename)) : null;

const check = config ? it : (name) => xit(`'${name}' -- skipped because the <${filename}> file does not exist`);

class Database {
  constructor(config) {
    this._config = config;
    this._connection = null;
  }

  async run(fn) {
    return fn(this).finally(() => this.close());
  }

  async applySchema() {
    const sql = 'CREATE TABLE IF NOT EXISTS seen (id INT, timestamp DATE, PRIMARY KEY (id))';
    
    return this.connect().then(() => this.query(sql));
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

  async connect() {
    if (this._connection)
      return Promise.resolve();

    const mysql      = require('mysql');
    
    this._connection = await mysql.createConnection(config, error => {
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

describe('Connecting to mysql database', async () => {
  check('can list all seen items', async () => {
    const database  = new Database(config);
    
    await database.applySchema();

    return database.listSeen().finally(() => database.close());
  });

  check('can add seen items', async () => {
    const seen = await new Database(config).run(database => {
      return database.applySchema().
        then(   () => database.removeSeen(1337)).
        then(   () => database.addSeen(1337)).
        then(   () => database.listSeen())
    });

    expect(seen.map(it => it.id)).to.contain(1337);
  });

  check('allows connection', async () => {
    let connection = null;
    
    try {
      const mysql      = require('mysql');
      
      connection = await mysql.createConnection(config, error => {
        if (error)
          throw error;
      });
 
      await new Promise((accept, reject) => {
        connection.connect(e => {
          if (e) {
            reject(e);
            return;
          }

          accept();
        });
      });

      const result = await new Promise((accept, reject) => {
        connection.query('SELECT 1 as result', (error, results, fields) => {
          if (error){
            reject(error);
            return;
          }

          accept(results);
        });
      });

      expect(result[0].result).to.equal(1);
 
    } finally {
      connection.end();
    }
  });
});