const expect    = require('chai').expect;
const Cloneable = require('../../src/core/cloneable').Cloneable;
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

describe('Cloning', () => {
  it('preserves values', () => {
    var tim       = new Person("Tim", 11);
    var olderTim  = tim.aged(12);

    expect(tim.name     ).to.equal("Tim");
    expect(olderTim.name).to.equal("Tim");
    expect(olderTim.age ).to.equal(12);
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
    const func = new Function("return 1+1");

    const result = func();

    expect(result).to.equal(2);
  });
});