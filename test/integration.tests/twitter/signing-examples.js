const expect            = require('chai').expect;
const { getAuthHeader } = require('../../../src/adapters/twitter-auth');

// [i] https://developer.twitter.com/en/docs/basics/authentication/overview/application-only
describe('Obtaining a bearer token', () => {
  it('combines credentials with a `:` and base64 encodes it', () => {
    const key     = 'xvz1evFS4wEEPTGEFPHBog';
    const secret  = 'L8qq9PZyRg6ieKGEKhZolGC0vJWLw8iEJ88DRdyOg';

    expect(getAuthHeader(key, secret)).to.equal('eHZ6MWV2RlM0d0VFUFRHRUZQSEJvZzpMOHFxOVBaeVJnNmllS0dFS2hab2xHQzB2SldMdzhpRUo4OERSZHlPZw==')
  });
});