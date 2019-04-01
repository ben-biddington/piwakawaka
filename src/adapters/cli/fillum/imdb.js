class Measured {
  constructor(fn) {
    this._fn = fn;
    this._count = 0;
  }

  get fun() {
    return args => {
      this._count++;
      return this._fn(args);
    };
  }

  get stats() {
    return () => ({ count: this._count });
  }
}

const pretty = o => JSON.stringify(o, null, 2);

const tap = (fn) => {
  return (args) => {
    fn(args); return args;
  };
};

const search = (ports={}, apiKey, titleWords) => {
  const { debug} = ports;

  if (!apiKey)
    throw `You need to set the <OMDB_API_KEY> env var`;

  const { stats, fun: get } = new Measured(ports.get);

  const title = titleWords.join(' ');

  const url = `http://www.omdbapi.com?apikey=${apiKey}&type=movie&s=${encodeURI(title)}`;

  return get(url).
      then(tap(reply  => debug(`Request to <${url}> returned status <${reply.statusCode}> with body:\n${pretty(reply.body)}`, 'list'))).
      then(reply      => JSON.parse(reply.body)).
      then(result     => result.Search || []).
      then(results    => Promise.all(results.map(it => 
        get(`http://www.omdbapi.com?apikey=${apiKey}&i=${it.imdbID}`).
          then(reply      => JSON.parse(reply.body)).
          then(tap(detail => debug(pretty(detail), 'detail.http'))).
          then(detail     => ({ ...it, imdbRating: detail.imdbRating })).
          then(tap(result => debug(pretty(result), 'detail')))))).
      then(results => ({ results, apiHits: stats().count }));
}

module.exports.search = search;