const mapItem = item => { 
  let result = {
    id:     item.id,
    title:  item.title,
    url:    '',
    host:   ''
  };

  if (item.url) {
    const url = require('url');
    
    result = {
      ...result,
      url: item.url,
      host: url.parse(item.url).host
    };
  }

  return result;
};

const top = async (ports, opts = {}) => {
  const { baseUrl = 'https://hacker-news.firebaseio.com/v0', count = 10 } = opts;

  const log = args => { console.log(args); return args; }

  return await ports.
    get(`${baseUrl}/topstories.json`, { 'Accept': 'application/json' }).
    then(JSON.parse).
    then(ids    => ids.slice(0, count).map(id => ports.get(`${baseUrl}/item/${id}.json`))).
    then(tasks  => Promise.all(tasks)).
    then(result => result.map(JSON.parse)).
    then(items  => items.map(mapItem));
};

module.exports.top = top;