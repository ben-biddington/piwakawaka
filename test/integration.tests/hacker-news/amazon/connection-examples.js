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

  async applySchema() {
    const sql = 'CREATE TABLE IF NOT EXISTS seen (id INT, timestamp DATE, PRIMARY KEY (id))';
    
    await this.connect();

    return new Promise((accept, reject) => {
      this._connection.query(sql, (error, results, fields) => {
        if (error){
          reject(error);
          return;
        }

        accept(results);
      });
    });
  }

  async listSeen() {
    await this.connect();

    return new Promise((accept, reject) => {
      this._connection.query('SELECT id from seen', (error, results, fields) => {
        if (error){
          reject(error);
          return;
        }

        accept(results);
      });
    });
  }

  async connect() {
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
    await this._connection.end();
  }
}

describe('Connecting to mysql database', async () => {
  check('can list all seen items', async () => {
    const database  = new Database(config);
    
    await database.applySchema();

    const seen      = await database.listSeen().finally(() => database.close());

    expect(seen.length).to.equal(0);
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