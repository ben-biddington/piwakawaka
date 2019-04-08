const expect    = require('chai').expect;
const read      = require('fs').readFileSync;
const exists    = require('fs').existsSync;
const filename  = './.conf/.mysql'

const config = exists(filename) ? JSON.parse(read(filename)) : null;

const check = config ? it : (name) => xit(`'${name}' -- skipped because the <${filename}> file does not exist`);

describe('Connecting to mysql database', async () => {
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