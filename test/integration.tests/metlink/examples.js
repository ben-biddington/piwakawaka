const expect      = require('chai').expect;
const path        = require('path');
const settings    = require('../../acceptance.tests/support/settings');
const realTime    = require('../../../src/adapters/metlink').realTime;
const enableDebug = settings.features.enableDebug;
const { fakeGet: fakeGetFun, cannedGet } = require('../support/net');

const fakeGet = (args) => fakeGetFun(path.join(__dirname, 'samples/metlink-4130-july-2021.json'))(...args); 

const updatedSample = {
  "farezone": "2",
  "closed": false,
  "departures": [
    {
      "stop_id": "4130",
      "service_id": "14",
      "direction": "inbound",
      "operator": "NBM",
      "origin": {
        "stop_id": "4136",
        "name": "Wilton-SurreySt"
      },
      "destination": {
        "stop_id": "6224",
        "name": "Kilbirnie"
      },
      "delay": "-PT9S",
      "vehicle_id": "2066",
      "name": "WiltonRd at Warwick",
      "arrival": {
        "aimed": "2021-07-22T11:03:00+12:00",
        "expected": "2021-07-22T11:02:51+12:00"
      },
      "departure": {
        "aimed": "2021-07-22T11:03:00+12:00",
        "expected": "2021-07-22T11:02:51+12:00"
      },
      "status": "ontime",
      "monitored": true,
      "wheelchair_accessible": true,
      "trip_id": false
    }
  ]
}

describe('Querying for realtime information', () => {
  it('for example, filtering by route', async () => {
    const fakeGet2021 = (args) => fakeGetFun(path.join(__dirname, 'samples/metlink-4130-july-2021.json'))(...args); 

    const ports = { get: fakeGet2021, log: settings.log };
    
    const result = await realTime(ports, { routeNumbers: '14', stopNumber: '4130', enableDebug });

    expect(result.stop.name).to.equal('WiltonRd at Warwick');
    expect(result.stop.sms) .to.equal('4130');
    expect(result.arrivals).to.not.be.empty;
    result.arrivals.every(arrival => expect(arrival.code).to.equal('14'));
  });

  it('can filter by multiple routes', async () => {
    let sample = {
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

      sample = {
        "farezone": "2",
        "closed": false,
        "departures": [
          {
            "stop_id": "4130",
            "service_id": "14",
            "direction": "inbound",
            "operator": "NBM",
            "origin": {
              "stop_id": "4136",
              "name": "Wilton-SurreySt"
            },
            "destination": {
              "stop_id": "6224",
              "name": "Kilbirnie"
            },
            "delay": "-PT9S",
            "vehicle_id": "2066",
            "name": "WiltonRd at Warwick",
            "arrival": {
              "aimed": "2021-07-22T11:03:00+12:00",
              "expected": "2021-07-22T11:02:51+12:00"
            },
            "departure": {
              "aimed": "2021-07-22T11:03:00+12:00",
              "expected": "2021-07-22T11:02:51+12:00"
            },
            "status": "ontime",
            "monitored": true,
            "wheelchair_accessible": true,
            "trip_id": false
          },
          {
            "stop_id": "4130",
            "service_id": "673",
            "direction": "inbound",
            "operator": "NBM",
            "origin": {
              "stop_id": "4136",
              "name": "Wilton-SurreySt"
            },
            "destination": {
              "stop_id": "6224",
              "name": "Kilbirnie"
            },
            "delay": "-PT9S",
            "vehicle_id": "2066",
            "name": "WiltonRd at Warwick",
            "arrival": {
              "aimed": "2021-07-22T11:03:00+12:00",
              "expected": "2021-07-22T11:02:51+12:00"
            },
            "departure": {
              "aimed": "2021-07-22T11:03:00+12:00",
              "expected": "2021-07-22T11:02:51+12:00"
            },
            "status": "ontime",
            "monitored": true,
            "wheelchair_accessible": true,
            "trip_id": false
          }
        ]
      }  

    const ports = { get: cannedGet(JSON.stringify(sample)), log: settings.log };

    let result = await realTime(ports, { routeNumbers: ['14', '673'], stopNumber: '4130', enableDebug });

    expect(result.arrivals[0].code) .to.equal('14');
    expect(result.arrivals[1].code) .to.equal('673');

    // Ensure this is non-breaking change
    result = await realTime(ports, { routeNumber: ['14', '673'], stopNumber: '4130' });

    expect(result.arrivals[0].code) .to.equal('14');
    expect(result.arrivals[1].code) .to.equal('673');
  });

  it('returns fields mapped like this', async () => {
      const sample = {
        "farezone": "2",
        "closed": false,
        "departures": [
          {
            "stop_id": "4130",
            "service_id": "14",
            "direction": "inbound",
            "operator": "NBM",
            "origin": {
              "stop_id": "4136",
              "name": "Wilton-SurreySt"
            },
            "destination": {
              "stop_id": "6224",
              "name": "Courtenay Pl"
            },
            "delay": "-PT9S",
            "vehicle_id": "2066",
            "name": "WiltonRd at Warwick",
            "arrival": {
              "aimed": "2021-07-22T11:03:00+12:00",
              "expected": "2021-07-22T11:02:51+12:00"
            },
            "departure": {
              "aimed": "2021-07-22T11:03:00+12:00",
              "expected": "2021-07-22T11:02:51+12:00"
            },
            "status": "ontime",
            "monitored": true,
            "wheelchair_accessible": true,
            "trip_id": false
          }
        ]
      }

      const ports = { get: cannedGet(JSON.stringify(sample)), log: settings.log };
    
      const result = await realTime(ports, { routeNumbers: '14', stopNumber: '4130' });

      expect(result.arrivals.length).to.equal(1);

      expect(result.stop.name).to.equal('WiltonRd at Warwick');
      expect(result.stop.sms) .to.equal('4130');

      const first = result.arrivals[0];
      
      expect(first.destination).to.equal('Courtenay Pl');
      expect(first.aimedArrival).to.deep.equal(new Date('2021-07-22T11:03:00+12:00'));
      expect(first.aimedDeparture).to.deep.equal(new Date('2021-07-22T11:03:00+12:00'));
      expect(first.departureTime).to.deep.equal(new Date('2021-07-22T11:02:51+12:00'));
      expect(first.destination).to.equal('Courtenay Pl');
      expect(first.status).to.equal('ontime');
      expect(first.isRealtime).to.equal(true);
  });
});