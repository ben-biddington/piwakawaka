const timeAsync = (fn, opts) => {
  const start = new Date();

  return fn().
    then(result => ({ duration: (new Date() - start), result })).
    catch(error => {
      if (opts.timeErrors) 
         return Promise.reject({ duration: (new Date() - start), error });
      
      return Promise.reject(error);
    });
}

module.exports.timeAsync = timeAsync;