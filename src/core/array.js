const take = (arr = [], count, selector) => {
  const results = [];

  for (let index = 0; index < arr.length; index++) {
    const item = arr[index];

    const i = selector(item);
    
    if (i != null) {
      results.push({ index, item: i });
    } else {
      seenItems.push(item);
    }

    if (results.length === count)
      return results;
  }

  return results;
};

module.exports.take =take;