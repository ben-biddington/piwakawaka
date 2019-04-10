const timeAsync = async fn => {
  const start = new Date();

  return fn().then(result => ({ duration: (new Date() - start), result }));
}

module.exports.timeAsync = timeAsync;