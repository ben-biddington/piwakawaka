const realTime = async (ports = {}, opts = {}) => { 
  const { get, log = _ => {} } = ports;
  const { baseUrl = 'https://www.metlink.org.nz/api/v1/StopDepartures', stopNumber, enableDebug = false } = opts;
  let { routeNumbers, routeNumber } = opts;

  routeNumbers = routeNumbers || routeNumber || []; 

  if (routeNumbers && false === Array.isArray(routeNumbers))
    routeNumbers = [routeNumbers];

  const debug = enableDebug === true ? m => log(`[DEBUG] ${m}`) : _ => {};

  if (!get)
    throw "You need to supply ports with a `get` function";

  if (!stopNumber)
    throw "You need to supply options with `stopNumber`";

  const url  = `${baseUrl}/${stopNumber}`;

  debug(`URL: ${url}, routeNumbers: ${routeNumbers}`);

  const parse = (text) => {
    try {
      return JSON.parse(text);
    } catch (error) {
      throw `Failed to parse this text to json:\n\n${JSON.stringify(text)}`;
    }
  }

  const reply = await get(url, {}).
    then(reply => { debug(`Raw reply:\n${JSON.stringify(reply)}`); return reply; }).
    then(reply => parse(reply));

  debug(`Full reply from <${url}>:\n${JSON.stringify(reply, null, 2)}`)

  const arrivals = reply.Services.
    filter(service => routeNumbers.length > 0 ? routeNumbers.indexOf(service.Service.Code) > -1 : true ).
    map(   service => ( 
      { 
        code:               service.Service.Code,
        destination:        service.DestinationStopName,
        aimedArrival:       new Date(service.AimedArrival),
        aimedDeparture:     new Date(service.AimedArrival),
        departureInSeconds: service.DisplayDepartureSeconds,
        destination:        service.DestinationStopName
      }));

  return { stop: { name: reply.Stop.Name, sms: reply.Stop.Sms}, arrivals };
}

module.exports.realTime = realTime;