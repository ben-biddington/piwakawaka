const expect    = require('chai').expect;
const read      = require('fs').readFileSync;
const exists    = require('fs').existsSync;
const filename  = './.conf/.mysql'

const config = exists(filename) ? JSON.parse(read(filename)) : null;

const check = config ? it : (name) => xit(`'${name}' -- skipped because the <${filename}> file does not exist`);

const Database = require('../../../../src/adapters/cli/hacker-news/mysql/database').Database;

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
        then(   () => database.listSeen()) });

    expect(seen.map(it => it.id)).to.contain(1337);
  });
});