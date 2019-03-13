function check(name, fun) {
  try {
    fun();
    console.log  (`[TEST-PASSED] ${name}`);
  } catch (e) {
    console.error(`[TEST-FAILED] ${name}\n${e}`);        
  }
}

async function checkAsync(name, fun) {
  try {
    await fun();
    console.log  (`[TEST-PASSED] ${name}`);
  } catch (e) {
    console.error(`[TEST-FAILED] ${name}\n${e}`);        
  }
}

function test(name, fun) {
  this[name.split(' ').map(it => it.trim()).join('_')] = check(name, fun);
}

function testAsync(name, fun) {
  this[name.split(' ').map(it => it.trim()).join('_')] = checkAsync(name, fun);
}

function skipTestAsync(name, fun, reason) {
  let message = `[TEST-SKIPPED] ${name}`;

  if (reason) {
    message += ` ${reason}`
  }

  this[name.split(' ').map(it => it.trim()).join('_')] = console.log(message);
}

function run() {
  const functions = Object.keys(this).
    filter(name => name.indexOf('check_') === 0).
    map   (name => this[name]());
}