const parse = (text) => {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw `Failed to parse this text to json:\n\n${JSON.stringify(text)}`;
  }
}

const realTime = async (ports = {}, opts = {}) => { 
  const { get, log = _ => {} } = ports;
  const { baseUrl = 'https://www.metlink.org.nz/api/v1/StopDepartures', stopNumber, enableDebug = false } = opts;
  let { routeNumbers, routeNumber } = opts;

  routeNumbers = routeNumbers || routeNumber || []; 

  if (routeNumbers && false === Array.isArray(routeNumbers))
    routeNumbers = [routeNumbers];

  const debug = enableDebug === true ? (m) => log(`[DEBUG] ${m}`) : _ => {};

  if (!get)
    throw "You need to supply ports with a `get` function";

  if (!stopNumber)
    throw "You need to supply options with `stopNumber`";

  const url  = `${baseUrl}/${stopNumber}`;

  debug(`URL: ${url}, routeNumbers: ${routeNumbers}`);

  const reply = await get(url, {}).
    then(reply => parse(reply)).
    then(reply => { debug(`Full reply from <${url}>:\n${JSON.stringify(reply, null, 2)}`); return reply; });

  const arrivals = reply.Services.
    filter(service => routeNumbers.length > 0 ? routeNumbers.indexOf(service.Service.Code) > -1 : true ).
    map(   service => ( 
      { 
        code:               service.Service.Code,
        destination:        service.DestinationStopName,
        aimedArrival:       new Date(service.AimedArrival),
        aimedDeparture:     new Date(service.AimedArrival),
        departureInSeconds: service.DisplayDepartureSeconds,
        status:             service.DepartureStatus,
        isRealtime:         service.IsRealtime,
      }));

  return { stop: { name: reply.Stop.Name, sms: reply.Stop.Sms}, arrivals };
}

const stops = async (ports = {}, opts = {}, ...stopNumbers) => {
  const { get, log = _ => {} } = ports;
  const { baseUrl = 'https://www.metlink.org.nz/api/v1/Stop', enableDebug = false } = opts;
  
  const debug = enableDebug === true ? (m) => log(`[DEBUG] ${m}`) : _ => {};

  if (!get)
    throw "You need to supply ports with a `get` function";
  
  debug(`stopNumbers: ${stopNumbers}`);

  const result = await Promise.all(stopNumbers.map(stopNumber => {
    const url  = `${baseUrl}/${stopNumber}`;
    
    debug(`URL: ${url}, stopNumber: ${stopNumber}`);
    
    return get(url, {}).
      catch(_ => {
        throw `Failed to get ${url}`;
      }).
      then(reply => parse(reply)).
      then(reply => { debug(`Full reply from <${url}>:\n${JSON.stringify(reply, null, 2)}`); return reply; }).
      then(thirdPartyStop => ({
        name: thirdPartyStop.Name,
        sms : thirdPartyStop.Sms
      }));
  }));

  debug(result);

  return result;
}

module.exports.realTime = realTime;
module.exports.stops    = stops;