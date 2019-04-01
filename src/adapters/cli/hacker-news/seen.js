const sqlite3 = require('sqlite3').verbose();
const util = require('util');

const open = () => {
  return new sqlite3.Database('hn.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);
}

const createSeen = (db) => {
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

const createSaved = (db) => {
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

const applySchema = db => Promise.all([createSeen(db), createSaved(db)]);

const connected = async fn => {
  const db = open();

  return applySchema(db).
    then(   () => fn(db)).
    finally(() => db.close());
}

const add = (ports = {}, id, opts = {}) => {
  return connected(db => {
    const { save = false } = opts;

    db.run(`REPLACE INTO ${save ? 'saved' : 'seen'} (id) VALUES (?)`, id);

    return new Promise((accept, reject) => {
      db.get(`SELECT COUNT(1) as count FROM  ${save ? 'saved' : 'seen'}`, (e, row) => {
        if (e) {
          reject(e);
          return;
        }

        accept(row.count);
      })
    });
  });
};

const listSaved = () => list('saved');
const listSeen  = () => list('seen');

const list = (table) => {
  return connected(db => {
    return new Promise((accept, reject) => {
      db.all(`SELECT id from ${table}`, (e, rows) => {
        if (e) {
          reject(e);
          return;
        }

        accept(rows);
      })
    });
  });
};

const missing = (ports, id) => exists(ports, id).then(result => !result);
const exists = (ports, id) => {
  return connected(db => {
    return new Promise((accept, reject) => {
      db.get(`SELECT COUNT(1) as count FROM seen where id = ?`, id, (e, row) => {
        if (e) {
          reject(e);
          return;
        }

        accept(row.count > 0);
      })
    });
  });
};

module.exports.add = add;
module.exports.exists = exists;
module.exports.missing = missing;
module.exports.listSaved = listSaved;