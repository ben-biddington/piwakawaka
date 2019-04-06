const expect    = require('chai').expect;
const settings  = require('../../acceptance.tests/support/settings');
const Database  = require('../../../src/adapters/cli/hacker-news/database').Database;

const newTempFile = () => {
  const uuidv1 = require('uuid/v1');
  return `.tmp-${uuidv1()}.db`;
}

const database = new Database(newTempFile());

describe('The seen database', () => {
  it('can hide items', async () => {
    await database.schema().then(() => database.add('abc'));
  })

  after(async () => {
    await database.delete();
  });
});