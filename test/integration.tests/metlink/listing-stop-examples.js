const expect      = require('chai').expect;
const settings    = require('../../acceptance.tests/support/settings');
const stops       = require('../../../src/adapters/metlink').stops;
const enableDebug = settings.features.enableDebug;
const { cannedGet } = require('../support/net');
const { get }       = require('../../../src/adapters/internet');

describe('Querying for bus stops', () => {
  it('can find stops by id', async () => {
    let jsonText = '{"Name":"Manners Street at Cuba Street - Stop A","Sms":"5515","Farezone":"1","Lat":-41.2914083,"Long":174.7771028,"LastModified":"2019-03-27T00:01:07+13:00"}';
    
    jsonText= `{
      "stop_id": "4130",
      "stop_name": "Wilton Road at Warwick Street",
      "stop_code": "4130",
      "stop_lat": -41.267979,
      "stop_lon": 174.760231,
      "route_ids": [
        "140"
      ],
      "tags": [],
      "demand_info": {
        "default_dataset": "weekdays",
        "data": {
          "weekdays": [
            0.4,
            0.6,
            1.41,
            0.2,
            0.2,
            0.4,
            0.4,
            0.4,
            0.4,
            0.4,
            0.4,
            0.2,
            0.2,
            0.2,
            0.2,
            0
          ],
          "saturday": [
            0,
            0.2,
            0.2,
            0.2,
            0.6,
            0.2,
            0.4,
            0.2,
            1.21,
            0.4,
            0.2,
            0.2,
            0.4,
            0.2,
            0.2,
            0
          ],
          "sunday": [
            0,
            0,
            0.2,
            0.4,
            0.2,
            0.4,
            0.2,
            0.2,
            0.4,
            0.6,
            0.2,
            0.4,
            0.2,
            0.2,
            0.2,
            0.2
          ]
        }
      },
      "lastEdited": "2021-07-12T09:09:39+1200"
    }`

    const ports = { get: cannedGet(jsonText), log: settings.log };
    
    const results = await stops(ports, { enableDebug }, '4130');

    const result = results[0];

    expect(result.name).to.equal('Wilton Road at Warwick Street');
    expect(result.sms) .to.equal('4130');
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