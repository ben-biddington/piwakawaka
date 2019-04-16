const expect    = require('chai').expect;
const settings    = require('../../acceptance.tests/support/settings');
const { get }     = require('../../../src/adapters/internet');
const { hottest } = require('../../../src/adapters/lobste');

describe('Querying lobste.rs for hottest stories', () => {
  it('for example', async () => {
    const ports = { get, log: settings.log, debug: settings.debug, trace: () => {} };
    
    const result = await hottest(ports, { count: 5 });

    expect(result.length).to.be.greaterThan(0);

    result.map(it => it.title).slice(0, 25).forEach((it, i) => settings.log(`${i+1} ${it}`));
  });

  it('parses like this', async () => {
    const json = `[
      {
        "short_id": "i6ph0r",
        "short_id_url": "https://lobste.rs/s/i6ph0r",
        "created_at": "2019-04-15T16:35:02.000-05:00",
        "title": "The first release of Gleam, a statically typed language for the Erlang VM",
        "url": "https://lpil.uk/blog/hello-gleam/",
        "score": 21,
        "upvotes": 21,
        "downvotes": 0,
        "comment_count": 3,
        "description": "",
        "comments_url": "https://lobste.rs/s/i6ph0r/first_release_gleam_statically_typed",
        "submitter_user": {
          "username": "lpil",
          "created_at": "2019-04-02T03:50:42.000-05:00",
          "is_admin": false,
          "about": "",
          "is_moderator": false,
          "karma": 30,
          "avatar_url": "/avatars/lpil-100.png",
          "invited_by_user": "djm",
          "github_username": "lpil"
        },
        "tags": [
          "erlang",
          "ml",
          "plt"
        ]
      }
    ]`;

    const get = () => Promise.resolve({ statusCode: 200, body: json });
    
    const ports = { get, log: settings.log, debug: settings.debug, trace: () => {} };
    
    const result = await hottest(ports, { count: 5 });

    expect(result.length).to.equal(1);

    const item = result[0];

    expect(item.id                  ).to.equal('https://lobste.rs/s/i6ph0r');
    expect(item.host                ).to.equal('lpil.uk');
    expect(item.title               ).to.equal('The first release of Gleam, a statically typed language for the Erlang VM');
    expect(item.date.toUTCString()  ).to.equal('Mon, 15 Apr 2019 21:35:02 GMT');
  });
});