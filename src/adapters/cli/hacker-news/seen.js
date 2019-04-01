const sqlite3 = require('sqlite3').verbose();
const util = require('util');

const open = () => {
  return new sqlite3.Database('seen.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);
} 

const applySchema = (db) => {
  return new Promise((accept, reject) => {
    db.run(`CREATE TABLE IF NOT EXISTS seen (id text PRIMARY KEY);`, (e, row) => {
        if (e)
        {
          reject(e);
          return;
        }

        accept(row);
    });
  });
};

const connected = async fn => {
    let db;
    
    try {
      db = open();

      await applySchema(db);
      
      return fn(db);
    } 
    finally 
    {
      db.close();
    }
}

const add = (ports = {}, id) => {
  return connected(db => {
    db.run(`REPLACE INTO seen (id) VALUES (?)`, id);
    
    return new Promise((accept, reject) => {
      db.get(`SELECT COUNT(1) as count FROM seen`, (e, row) => {
        if (e)
          {
            reject(e);
            return;
          }

          accept(row.count);
      })
    });
  });
};

const missing = (ports, id) => exists(ports, id).then(result => !result);
const exists = (ports, id) => {
    return connected(db => {
        return new Promise((accept, reject) => {
          db.get(`SELECT COUNT(1) as count FROM seen where id = ?`, id, (e, row) => {
            if (e)
              {
                reject(e);
                return;
              }
    
              accept(row.count > 0);
          })
        });
      });
};

module.exports.add      = add;
module.exports.exists   = exists;
module.exports.missing  = missing;