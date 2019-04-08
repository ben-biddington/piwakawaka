const expect    = require('chai').expect;
const read = require("util").promisify(require('fs').readFile);

const readConfig = async () => await read('./.conf/.mysql', 'utf8').then(JSON.parse);
let config;

describe('Connecting to mysql database', async () => {
  before(async () => {
    config = await readConfig();
  })

  it('allows connection', async () => {

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