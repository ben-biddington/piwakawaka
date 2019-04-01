class Measured {
  constructor(fn) {
    this._fn = fn;
    this._count = 0;
  }

  fun() {
    return args => {
      this._count++;
      return this._fn(args);
    };
  }

  count() {
    return this._count;
  }
}

const pretty = o => JSON.stringify(o, null, 2);

const tap = (fn) => {
  return (args) => {
    fn(args); return args;
  };
};

const search = (ports={}, apiKey, titleWords) => {
  const { get, log, debug} = ports;

  if (!apiKey)
    throw `You need to set the <OMDB_API_KEY> env var`;

  const measuredGet = new Measured(get);
  const _get = measuredGet.fun();

  const title = titleWords.join(' ');

  const url = `http://www.omdbapi.com?apikey=${apiKey}&type=movie&s=${encodeURI(title)}`;

  return _get(url).
      then(tap(reply  => debug(`Request to <${url}> returned status <${reply.statusCode}> with body:\n${pretty(reply.body)}`, 'list'))).
      then(reply      => JSON.parse(reply.body)).
      then(result     => result.Search || []).
      then(results    => Promise.all(results.map(it => 
        _get(`http://www.omdbapi.com?apikey=${apiKey}&i=${it.imdbID}`).
          then(reply      => JSON.parse(reply.body)).
          then(tap(detail => debug(pretty(detail), 'detail.http'))).
          then(detail     => ({ ...it, imdbRating: detail.imdbRating })).
          then(tap(result => debug(pretty(result), 'detail')))))).
      then(results => ({ results, apiHits: measuredGet.count() }));
}

module.exports.search = search;