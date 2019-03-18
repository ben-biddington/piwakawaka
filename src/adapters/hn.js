const top = async (ports, opts = {}) => {
  const { baseUrl = 'https://hacker-news.firebaseio.com/v0', count = 10 } = opts;
  
  const log = args => { console.log(args); return args; }

  return await ports.
    get(`${baseUrl}/topstories.json`, { 'Accept': 'application/json' }).
    then(JSON.parse).
    then(ids    => ids.slice(0, count).map(id => ports.get(`${baseUrl}/v0/item/${id}.json`))).
    then(tasks  => Promise.all(tasks)).
    then(result => result.map(JSON.parse)).
    then(items  => items.map(item => (
      {
        id:     item.id,
        title:  item.title,
        url:    item.url,
      })));
};

module.exports.top = top;