const expect    = require('chai').expect;
const Cloneable = require('.././../src/core/internal/cloneable').Cloneable; //@todo: it's not iternal if there are tests on it.
const util      = require('util');

class Person extends Cloneable {
  constructor(name, age) {
    super();
    this.name = name;
    this.age = age;
  }

  aged(age) {
    return this.clone(it => it.age = age);
  }
}

describe('that cloning preserves values', () => {
  it('for example', () => {
    var tim       = new Person("Tim", 11);
    var olderTim  = tim.aged(12);

    expect(tim.name).to.equal("Tim");
    expect(olderTim.name).to.equal("Tim");
    expect(olderTim.age).to.equal(12);
  });
});

describe('Eval-ing', () => { 
  it('works with functions', () => { 
    const result = eval("1 + 1");

    expect(result).to.equal(2);
  });

  it('works with serialized functions', () => { 
    const fun = () => 1 + 1;
    
    const result = eval(fun.toString())();

    expect(result).to.equal(2);
  });

  it('works with function ctor', () => { 
    const fun = () => 1 + 1;
    
    const func = new Function("return 1+1");

    const result = func();

    expect(result).to.equal(2);
  });
});

describe('Regular expressions', () => {
  it('use literals', () => {
    const match = 'The Highwaymen'.match(/.+highway.+/ig);

    expect(match[0]).to.equal('The Highwaymen');
  });

  it('when parsing from string you must omit slashes', () => {
    const match = 'The Highwaymen'.match(new RegExp('.+highway.+', "ig"));

    expect(match[0]).to.equal('The Highwaymen');
  });
});