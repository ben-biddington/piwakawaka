const tap = (fn) => {
  return (args) => {
    fn(args); return args;
  };
};

module.exports.tap = tap;