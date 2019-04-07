const sqlite3 = require('sqlite3').verbose();

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

const createBlocked = (db) => {
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

const applySchema = db => Promise.all([createSeen(db), createSaved(db), createBlocked(db)]);

const connected = async fn => {
  const db = open();

  return applySchema(db).
    then(   () => fn(db)).
    finally(() => db.close());
}

const add = (ports = {}, ids=[], opts = {}) => {
  ids = ids.join ? ids : [ids];

  return run(`REPLACE INTO ${opts.save ? 'saved' : 'seen'} (id) VALUES ${ids.map(id => `(${id})`).join(',')}`).
    then(()  => get(`SELECT COUNT(1) as count FROM  ${opts.save ? 'saved' : 'seen'}`)).
    then(row => row.count); 
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
const exists = (ports, id)  => {
  const { log = () => {}, debug } = ports;

  return get(`SELECT COUNT(1) as count FROM seen where id = ?`, id).
    then(row => {
      debug(`Checking id <${id}>, result: ${JSON.stringify(row, null, 2)}`);
      return row;
    }).
    then(row => row.count > 0)
};

const block = (ports ={}, domain) => {
  return run(`REPLACE INTO blocked (domain) VALUES (?)`, domain).
    then(() => all(`SELECT domain as domain FROM blocked`)); 
}

const unblock = (ports ={}, domain) => {
  return run(`DELETE FROM blocked WHERE domain=?`, domain).
    then(() => all(`SELECT domain as domain FROM blocked`)); 
}

const isBlocked = (ports ={}, domain) => {
  return get(`SELECT COUNT(1) as count from blocked WHERE domain = ?`, domain).
    then(row => row.count === 1); 
}

const get = (query, args) => {
  return connected(db => {
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

const all = (query, args) => {
  return connected(db => {
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

const run = (query, args) => {
  return connected(db => {
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

module.exports.add        = add;
module.exports.exists     = exists;
module.exports.missing    = missing;
module.exports.listSaved  = listSaved;
module.exports.listSeen   = listSeen;
module.exports.block      = block;
module.exports.unblock      = unblock;
module.exports.isBlocked  = isBlocked;