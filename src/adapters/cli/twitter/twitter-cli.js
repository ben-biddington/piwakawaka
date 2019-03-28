const { get, post } = require('../../internet');
const fs      = require('fs');
const log     = m => fs.writeSync(1, `${m}\n`);
let debug;

const program = require('commander');

program.
  version('0.0.1').
  command("timeline <bearerToken>").
  option("-v --verbose", "Enable verbose logging").
  action((bearerToken, cmd) => {
    debug     = (process.env.DEBUG == 1 || cmd.verbose === true) ? m => fs.writeSync(1, `[DEBUG] ${m}\n`) : _ => {};

    // @todo: https://developer.twitter.com/en/docs/basics/authentication/overview/application-only
    return get(
      'https://api.twitter.com/1.1/statuses/user_timeline.json?count=10&screen_name=benbiddington', 
      { 
        'Authorization' : `Bearer ${bearerToken}`,
        'Accept'        : 'application/json;charset=UTF-8',
      }).
      then(JSON.parse).
      then(tweets => tweets.map(t => t.text).join('\n\n')).
      then(log);
  });

program.
  command('auth <key> <secret>').
  option("-v --verbose", "Enable verbose logging").
  action((key, secret, cmd) => {
    debug     = (process.env.DEBUG == 1 || cmd.verbose === true) ? m => fs.writeSync(1, `[DEBUG] ${m}\n`) : _ => {};

    const { getAuthHeader } = require('../../twitter-auth');
    
    // @todo: https://developer.twitter.com/en/docs/basics/authentication/overview/application-only
    post(
      'https://api.twitter.com/oauth2/token', 
      { 
        'Authorization' : `Basic ${getAuthHeader(key, secret)}`,
        'Content-type'  : 'application/x-www-form-urlencoded;charset=UTF-8',
      },  
      {
        'grant_type': 'client_credentials'
      }).
      catch(console.errors).
      then(text => {
        console.log(`Reply: ${text}`);
      });
  });

program.parse(process.argv);