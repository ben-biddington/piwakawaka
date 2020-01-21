const list = (ports) => {
  const { get, render } = ports;

  return get('https://api.charge.net.nz/v1/locations').
    then(r    => JSON.parse(r.body)).
    then(render);
}

module.exports.list = list;
