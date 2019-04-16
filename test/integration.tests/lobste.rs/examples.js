const expect    = require('chai').expect;
const settings  = require('../../acceptance.tests/support/settings');
const { get }   = require('../../../src/adapters/internet');
const { rs }    = require('../../../src/adapters/lobste');

const parse = xml => {
  const Parser  = require('rss-parser');
  const parser  = new Parser({ customFields: {} });
  return parser.parseString(xml);
}

describe('Querying lobste.rs for top stories', () => {
  it('for example', async () => {
    const ports = { get, log: settings.log, debug: settings.debug, trace: () => {} };
    
    const result = await rs(ports, { count: 5 });

    expect(result.length).to.be.greaterThan(0);

    result.map(it => it.title).slice(0, 25).forEach((it, i) => settings.log(`${i+1} ${it}`));
  });

  it('parses xml like this', async () => {
    const rss = () => parse(`<?xml version="1.0" encoding="UTF-8"?>
      <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
        <channel>
          <title>Lobsters</title>
          <description></description>
          <link>https://lobste.rs/</link>
          <atom:link href="https://lobste.rs/rss" rel="self" type="application/rss+xml" />
          <item>
            <title>The first release of Gleam, a statically typed language for the Erlang VM</title>
            <link>https://lpil.uk/blog/hello-gleam/</link>
            <guid isPermaLink="false">https://lobste.rs/s/i6ph0r</guid>
            <author>lpil@users.lobste.rs (lpil)</author>
            <pubDate>Mon, 15 Apr 2019 16:35:02 -0500</pubDate>
            <comments>https://lobste.rs/s/i6ph0r/first_release_gleam_statically_typed</comments>
            <description></description>
            <category>erlang</category>
            <category>ml</category>
            <category>plt</category>
          </item>
        </channel>
      </rss>
    `);

    const ports = { rss, log: settings.log, debug: settings.debug };
    
    const result = await rs(ports, { count: 5 });
    
    expect(result.length).to.equal(1);
    
    const item = result[0];

    expect(item.id                  ).to.equal('https://lobste.rs/s/i6ph0r');
    expect(item.host                ).to.equal('lpil.uk');
    expect(item.title               ).to.equal('The first release of Gleam, a statically typed language for the Erlang VM');
    expect(item.date.toUTCString()  ).to.equal('Mon, 15 Apr 2019 21:35:02 GMT');
  });
});