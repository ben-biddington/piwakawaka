const timeAsync = async fn => {
  const start = new Date();

  return fn().
    then(result => ({ duration: (new Date() - start), result })).
    catch(error => Promise.reject({ duration: (new Date() - start), error }));
}

module.exports.timeAsync = timeAsync;