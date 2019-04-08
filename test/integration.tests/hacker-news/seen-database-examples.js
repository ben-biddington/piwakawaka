const expect    = require('chai').expect;
const Database  = require('../../../src/adapters/cli/hacker-news/database').Database;

const newTempFile = () => {
  const uuidv1 = require('uuid/v1');
  return `.tmp-${uuidv1()}.db`;
}

const databases = [];

const database = new Database(newTempFile());

databases.push(database);

const withNew = fn => {
  const database = new Database(newTempFile());

  databases.push(database);

  return database.schema().then(() => fn(database));
}

describe('The seen database', () => {
  describe('Hiding/saving', () => {
    it('can hide items', async () => {
      await database.schema().then(() => database.addSeen('abc'));
      
      const allSeen = await database.listSeen();
  
      expect(allSeen.map(it => it.id)).to.contain('abc');

      expect(await database.isSeen('abc')).to.equal(true);
      expect(await database.isSeen('xxx-does-not-exist-xxx')).to.equal(false);
    });

    it('can hide multiple items', async () => {
      await database.schema().then(() => database.addSeen(['abc', 'def', 'ghi']));
      
      const allSeen = await database.listSeen();
  
      expect(allSeen.map(it => it.id)).to.contain('abc');
      expect(allSeen.map(it => it.id)).to.contain('def');
      expect(allSeen.map(it => it.id)).to.contain('ghi');
    });
  
    const nonWindowsOnly = () => {
      return process.platform === "win32" ? () => it.skip(`Skipping due to os being <${process.platform}>`) : () => it;
    };

    nonWindowsOnly()('cannot hide multiple items like this', async () => {
      return withNew(async database => {
        let error = null;
        
        await Promise.all(Array(50).map(() => database.addSeen('abc').catch(e => error = e)));
      
        expect(error).to.match(/SQLITE_BUSY: database is locked/);
      });
    });

    it('can save items', async () => {
      await database.schema().then(() => database.addSaved('def'));
      
      const allSaved = await database.listSaved();
  
      expect(allSaved.map(it => it.id)).to.contain('def');
    });
  });

  describe('Blocking', () => {
    it('can block domains', async () => {
      return withNew(async database => {
        const allBlocked = await database.block('nytimes.com');
  
        expect(allBlocked.map(it => it.domain)).to.contain('nytimes.com');
      });
    });
  
    it('can unblock domains', async () => {
      return withNew(async database => {
        const allBlocked = await database.block('nytimes.com').
          then(() => database.unblock('nytimes.com'));
  
        expect(allBlocked.length).to.equal(0);
      });
    });
  });

  after(() => {    
    return Promise.all(databases.map(d => d.delete()));  
  });
});