# 3. Vehicle positions

Date: 2022-04-06

## Status

Accepted

## Context

The issue motivating this decision, and any context that influences or constrains the decision.

## Decision

### Finding vehicle id

Stop predictions have `vehicle_id`:

```
https://api.opendata.metlink.org.nz/v1/stop-predictions?stop_id=4130
```

```json
{
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
        "stop_id": "5516",
        "name": "Courtenay Pl"
      },
      "delay": "PT1M13S",
      "vehicle_id": "2208",
      "name": "WiltonRd at Warwick",
      "arrival": {
        "aimed": "2022-04-06T08:09:00+12:00",
        "expected": "2022-04-06T08:10:13+12:00"
      },
      "departure": {
        "aimed": "2022-04-06T08:09:00+12:00",
        "expected": "2022-04-06T08:10:13+12:00"
      },
      "status": "ontime",
      "monitored": true,
      "wheelchair_accessible": true,
      "trip_id": "14__1__122__NBM__150__150_1"
    },
  ]
}
```

Which can then be used to find position.

### Finding positions

```
https://api.opendata.metlink.org.nz/v1/gtfs-rt/vehiclepositions
```

(Snipped to single entity. In reality there are hundreds.)

```json
{
  "header": {
    "gtfsRealtimeVersion": "2.0",
    "incrementality": 0,
    "timestamp": 1649188948
  },
  "entity": [
    {
      "id": "46e60da7-6455-481a-a934-089d5876aecf",
      "vehicle": {
        "trip": {
          "start_time": "07:54:00",
          "trip_id": "737__1__104__NBM__20__3__20__3_1",
          "direction_id": 1,
          "route_id": 7370,
          "schedule_relationship": 0,
          "start_date": "20220406"
        },
        "position": {
          "bearing": 210,
          "latitude": -41.2826996,
          "longitude": 174.7521973
        },
        "vehicle": {
          "id": "1445"
        },
        "timestamp": 1649188940
      }
    }
  ]
}
```

### What is `route_id`

## Consequences

What becomes easier or more difficult to do and any risks introduced by the change that will need to be mitigated.
