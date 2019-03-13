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

describe('that it preserves values', () => {
  it('for example', () => {
    var tim       = new Person("Tim", 11);
    var olderTim  = tim.aged(12);

    expect(tim.name).to.equal("Tim");
    expect(olderTim.name).to.equal("Tim");
    expect(olderTim.age).to.equal(12);
  });
});