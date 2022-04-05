const expect = require("chai").expect;
const vehiclePositions =
  require("../../../src/adapters/metlink").vehiclePositions;
const vehicles = require("../../../src/adapters/metlink").vehicles;
const { get } = require("../../../src/adapters/internet");
const stops = require("../../../src/adapters/metlink").stops;
const GeoPoint = require("geopoint");

describe("Querying for vehicles for a stop", () => {
  it("for example find vehicles by stop number", async () => {
    const reply = await vehicles({ get }, { stopNumber: 4130 });

    expect(reply.length).to.be.greaterThan(1);
  });
});

describe("Querying for vehicle positions", () => {
  it("for example find all vehicle positions by stop number", async () => {
    const reply = await vehiclePositions({ get }, { stopNumber: 4130 });

    // console.log(JSON.stringify(reply, null, 2));

    expect(reply.length).to.be.greaterThan(0);
  });

  it("for example finding distance from bus stop", async () => {
    const busStop = (
      await stops({ get, log: console.log }, { enableDebug: false }, "4130")
    )[0];

    const reply = await vehiclePositions({ get }, { stopNumber: 4130 });

    //console.log(JSON.stringify(reply, null, 2));

    expect(reply.length).to.be.greaterThan(0);

    reply.forEach((position) => {
      // console.log(position);
      var distance = new GeoPoint(
        position.vehicle.position.latitude,
        position.vehicle.position.longitude
      ).distanceTo(
        new GeoPoint(busStop.position.lat, busStop.position.long),
        true
      );

      console.log(
        `Vehicle <${position.vehicle.vehicle.id}> is <${distance} km> away heading <${position.vehicle.position.bearing}> -- ` + 
        `${position.link}`
      );
    });
  });
});
