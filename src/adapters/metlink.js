const parse = (text) => {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw `Failed to parse this text to json:\n\n${JSON.stringify(text)}`;
  }
}

const apiGatewayKey = 'iuoMNXQjzC1PjijgMjKkHhYWPb4ZES2UpaYfgsd0';
const defaultHeaders = { 'X-Author': 'ben.biddington@gmail.com', 'x-api-key': apiGatewayKey };
const apiBaseUrl='https://api.opendata.metlink.org.nz/v1';

// https://api.opendata.metlink.org.nz/v1/stop-predictions?stop_id=4130
const realTime = async (ports = {}, opts = {}) => { 
  const { get, log = _ => {} } = ports;
  const { baseUrl = `${apiBaseUrl}/stop-predictions`, stopNumber, enableDebug = false } = opts;
  let { routeNumbers, routeNumber } = opts;

  routeNumbers = routeNumbers || routeNumber || []; 

  if (routeNumbers && false === Array.isArray(routeNumbers))
    routeNumbers = [routeNumbers];

  const debug = enableDebug === true ? (m) => log(`[DEBUG] ${m}`) : _ => {};

  if (!get)
    throw "You need to supply ports with a `get` function";

  if (!stopNumber)
    throw "You need to supply options with `stopNumber`";

  const url  = `${baseUrl}?stop_id=${stopNumber}`;

  debug(`URL: ${url}, headers: ${JSON.stringify(defaultHeaders)}, routeNumbers: ${routeNumbers}`);

  const reply = await get(url, defaultHeaders).
    then(reply => parse(reply.body)).
    then(reply => { debug(`Full reply from <${url}>:\n${JSON.stringify(reply, null, 2)}`); return reply; });

  const arrivals = reply.departures.
    slice(0, opts.limit).
    filter(service => routeNumbers.length > 0 ? routeNumbers.indexOf(service.service_id) > -1 : true ).
    map(   service => ( 
      { 
        code:               service.service_id,
        destination:        service.name, //service.DestinationStopName,
        aimedArrival:       new Date(service.arrival.aimed),
        aimedDeparture:     new Date(service.departure.aimed),
        departureTime:      new Date(service.DisplayDeparture),
        //departureInSeconds: service.DisplayDepartureSeconds,
        status:             service.status, //service.DepartureStatus,
        //isRealtime:         service.IsRealtime,
      }));

  return { stop: { name: reply.departures[0].name, sms: reply.departures[0].service_id}, arrivals };
}

const stops = async (ports = {}, opts = {}, ...stopNumbers) => {
  const { get, log = _ => {} } = ports;
  const { baseUrl = `https://backend.metlink.org.nz/api/v1/stops`, enableDebug = false } = opts;
  
  const debug = enableDebug === true ? (m) => log(`[DEBUG] ${m}`) : _ => {};

  if (!get)
    throw "You need to supply ports with a `get` function";
  
  debug(`stopNumbers: ${stopNumbers}`);

  //const token = accessToken(get);

  const validStopNumbers = stopNumbers.
    filter(it => it != null).
    filter(it => it.trim() != '');

  const result = await Promise.all(validStopNumbers.map(async stopNumber => {
    const url  = `${baseUrl}/${stopNumber}`;
    
    debug(`URL: ${url}, stopNumber: ${stopNumber}`);
    
    const reply = await get(url, defaultHeaders).
      catch(_ => {
        throw `Failed to get ${url}`;
      });

      if (reply.statusCode === 404)
        return Promise.resolve({ name: `UNKNOWN STOP`, sms: stopNumber });

      if (reply.statusCode != 200)
        return Promise.reject(`Request to <${baseUrl}> returned stated code <${reply.statusCode}> and body <${reply.body}>`);

      return Promise.resolve(reply).
        then(reply => parse(reply.body)).
        then(body  => { debug(`Full reply from <${url}>:\n${JSON.stringify(body, null, 2)}`); return body; }).
        then(thirdPartyStop => ({
          name: thirdPartyStop.stop_name,
          sms : thirdPartyStop.stop_id
        }));
  }));

  debug(result);

  return result;
}

const accessToken = async (get) => {
  const url = 'https://www.metlink.org.nz/api/v2/access_token';

  const reply = await get(url);

  return JSON.parse(reply.body).access_token;
}

module.exports.realTime = realTime;
module.exports.stops    = stops;