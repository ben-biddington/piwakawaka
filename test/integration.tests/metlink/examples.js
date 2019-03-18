const expect    = require('chai').expect;
const settings  = require('../../acceptance.tests/support/settings');
const realTime  = require('../../../src/adapters/metlink').realTime;
const enableDebug = settings.features.enableDebug;

const fakeGet = (url, headers) => {
  const fs = require('fs');
  const path = require('path'),
  filePath = path.join(__dirname, 'samples/metlink-4130.json')
  
  return new Promise(function(resolve, reject){
    fs.readFile(filePath, 'utf-8', (err, data) => {
        err ? reject(err) : resolve(data);
    });
  });
};

const cannedGet = (json) => {
  return (_, __) => {
    return Promise.resolve(json);
  };
}

describe('Querying for realtime information', () => {
  it('for example, filtering by route', async () => {
    const ports = { get: fakeGet, log: settings.log };
    
    const result = await realTime(ports, { routeNumbers: '14', stopNumber: '4130', enableDebug });

    expect(result.stop.name).to.equal('Wilton Road at Warwick Street');
    expect(result.stop.sms) .to.equal('4130');
    expect(result.arrivals).to.not.be.empty;
    result.arrivals.every(arrival => expect(arrival.code).to.equal('14'));
  });

  it('can filter by multiple routes', async () => {
    const sample = {
      "LastModified": "2019-03-13T08:23:55+13:00",
      "Stop": {
        "Name": "Wilton Road at Warwick Street",
        "Sms": "4130",
        "Farezone": "2",
        "Lat": -41.2679786,
        "Long": 174.7602313,
        "LastModified": "2019-03-13T00:00:50+13:00"
      },
      "Services": [
        {
          "ServiceID": "14",
          "Service": {
            "Code": "14",
          }
        },
        {
          "ServiceID": "673",
          "Service": {
            "Code": "673",
          }
        }]
      };

    const ports = { get: cannedGet(JSON.stringify(sample)), log: settings.log };

    let result = await realTime(ports, { routeNumbers: ['14', '673'], stopNumber: '4130', enableDebug });

    expect(result.arrivals[0].code) .to.equal('14');
    expect(result.arrivals[1].code) .to.equal('673');

    // Ensure this is non-breaking change
    result = await realTime(ports, { routeNumber: ['14', '673'], stopNumber: '4130' });

    expect(result.arrivals[0].code) .to.equal('14');
    expect(result.arrivals[1].code) .to.equal('673');
  });

  it('unfiltered returns them all', async () => {
    const ports = { get: fakeGet, log: settings.log };
    
    const result = await realTime(ports, { stopNumber: '4130', enableDebug });

    expect(result.arrivals.length).to.equal(19);
  });

  it('returns fields mapped like this', async () => {
    const sample = {
      "LastModified": "2019-03-13T08:23:55+13:00",
      "Stop": {
        "Name": "Wilton Road at Warwick Street",
        "Sms": "4130",
        "Farezone": "2",
        "Lat": -41.2679786,
        "Long": 174.7602313,
        "LastModified": "2019-03-13T00:00:50+13:00"
      },
      "Services": [
        {
          "ServiceID": "14",
          "IsRealtime": false,
          "VehicleRef": null,
          "Direction": "Inbound",
          "OperatorRef": "NBM",
          "OriginStopID": "4136",
          "OriginStopName": "Wilton-SurreySt",
          "DestinationStopID": "5516",
          "DestinationStopName": "Courtenay Pl",
          "AimedArrival": "2019-03-13T08:25:00+13:00",
          "AimedDeparture": "2019-03-14T08:25:01+13:00",
          "VehicleFeature": null,
          "DepartureStatus": null,
          "ExpectedDeparture": null,
          "DisplayDeparture": "2019-03-13T08:25:00+13:00",
          "DisplayDepartureSeconds": 84,
          "Service": {
            "Code": "14",
            "TrimmedCode": "14",
            "Name": "Wilton - Wellington - Roseneath - Hataitai - Kilbirnie",
            "Mode": "Bus",
            "Link": "/timetables/bus/14"
          }
        }]
      };

      const ports = { get: cannedGet(JSON.stringify(sample)), log: settings.log };
    
      const result = await realTime(ports, { routeNumbers: '14', stopNumber: '4130' });

      expect(result.arrivals.length).to.equal(1);

      expect(result.stop.name).to.equal('Wilton Road at Warwick Street');
      expect(result.stop.sms) .to.equal('4130');

      const first = result.arrivals[0];
      
      expect(first.destination).to.equal('Courtenay Pl');
      expect(first.aimedArrival).to.deep.equal(new Date('2019-03-13T08:25:00+13:00'));
      expect(first.aimedDeparture).to.deep.equal(new Date('2019-03-13T08:25:00+13:00'));
      expect(first.departureInSeconds).to.deep.equal(84);
      expect(first.destination).to.equal('Courtenay Pl');
  });
});