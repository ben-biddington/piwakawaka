const expect      = require('chai').expect;
const settings    = require('../../acceptance.tests/support/settings');
const stops       = require('../../../src/adapters/metlink').stops;
const enableDebug = settings.features.enableDebug;
const { cannedGet } = require('../support/net');
const { get }       = require('../../../src/adapters/internet');

describe('Querying for bus stops', () => {
  it('can find stops by id', async () => {
    const jsonText = '{"Name":"Manners Street at Cuba Street - Stop A","Sms":"5515","Farezone":"1","Lat":-41.2914083,"Long":174.7771028,"LastModified":"2019-03-27T00:01:07+13:00"}';
    
    const ports = { get: cannedGet(jsonText), log: settings.log };
    
    const results = await stops(ports, { enableDebug }, '5515');

    const result = results[0];

    expect(result.name).to.equal('Manners Street at Cuba Street - Stop A');
    expect(result.sms) .to.equal('5515');
  });

  it('it handle nonexistent stops', async () => {
    const ports = { get: () => Promise.resolve({ statusCode: 404, body: "NOT FOUND" }) , log: settings.log };
    
    const results = await stops(ports, { enableDebug }, '20');

    const result = results[0];

    expect(result.name).to.equal('UNKNOWN STOP');
    expect(result.sms) .to.equal('20');
  });

  it('ignores blanks', async () => {
    const actualUrls = [];

    const ports = { 
      get: (url) => {
        actualUrls.push(url);
        return Promise.resolve({ statusCode: 200, body: "{}" });
      }, 
      log: settings.log
    };
    
    const stopsContainingBlanks = ['1','',' ', null,'5'];

    await stops(ports, { enableDebug, baseUrl: 'http://example' }, ...stopsContainingBlanks);

    expect(actualUrls).to.eql([ 'http://example/1', 'http://example/5' ]);
  });
});

describe('access tokens', () => {
  it('get one like this', async () => {
    const url = 'https://www.metlink.org.nz/api/v2/access_token';

    const reply = await get(url);

    //console.log(JSON.stringify(JSON.parse(reply.body), null, 2));

    const token = JSON.parse(reply.body).access_token;

    console.log(token);
  });
});