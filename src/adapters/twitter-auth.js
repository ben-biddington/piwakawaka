const getAuthHeader = (key, secret) => {
  return Buffer.from([ key, secret ].join(':')).toString('base64');
};

module.exports.getAuthHeader = getAuthHeader;