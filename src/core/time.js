const timeAsync = async fn => {
  let result;
  
  const start = new Date();
  let finish;

  try { 
    result = await fn(); 
  } finally {
    finish = new Date();
  }

  return { duration: (finish - start), result };
}

module.exports.timeAsync = timeAsync;