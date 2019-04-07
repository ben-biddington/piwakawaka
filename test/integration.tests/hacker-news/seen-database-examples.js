const expect    = require('chai').expect;
const Database  = require('../../../src/adapters/cli/hacker-news/database').Database;

const newTempFile = () => {
  const uuidv1 = require('uuid/v1');
  return `.tmp-${uuidv1()}.db`;
}

const database = new Database(newTempFile());

describe('The seen database', () => {
  it('can hide items', async () => {
    await database.schema().then(() => database.addSeen('abc'));
    
    const allSeen = await database.listSeen();

    expect(allSeen.map(it => it.id)).to.contain('abc');
  });

  it('can hide multiple items', async () => {
    await database.schema().then(() => database.addSeen(['abc', 'def', 'ghi']));
    
    const allSeen = await database.listSeen();

    expect(allSeen.map(it => it.id)).to.contain('abc');
    expect(allSeen.map(it => it.id)).to.contain('def');
    expect(allSeen.map(it => it.id)).to.contain('ghi');
  });

  it('can save items', async () => {
    await database.schema().then(() => database.addSaved('def'));
    
    const allSaved = await database.listSaved();

    expect(allSaved.map(it => it.id)).to.contain('def');
  });

  after(async () => {
    await database.delete();
  });
});