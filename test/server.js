'use strict';

// allow self-signed HTTPS
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

const JsopFactory = require('../src/jsop');
const supertest = require('supertest');
const assert = require('assert');

describe('jsop.io (default)', () => {
  let jsop; // default config jsop
  let request; // supertest client

  // before:  start basic, default config jsop
  //          and attach a new supertest client
  before(() => {
    jsop = JsopFactory({});
    request = supertest(jsop.server);
  });

  describe('user login', () => {

    let reqCookies; // persist session cookies
    before(() => reqCookies = supertest.agent(jsop.server));

    it('does not have oauth github configured', () => {
      assert(Boolean(jsop.app.locals.cfg.oauth.githubID) == false);
      assert(Boolean(jsop.app.locals.cfg.oauth.githubSecret) == false);
    });

    it('returns 401 and empty json profile if unauthenticated', done => {
      reqCookies.head('/api/user')
        .expect(401,
          err => err ? done(err) :
          reqCookies.get('/api/user/profile')
            .expect('Content-Type', /json/)
            .expect('Content-Length', 2)
            .expect(401, {}, done)
        );
    });

    it('starts session cookie, when csrf is set', done => {
      let csrf; // csrf placeholder
      reqCookies.head('/api/user/csrf')
        .expect('set-cookie', /^jsop-session=.+/) // init cookie
        .expect('x-csrf', /.+/) // csrf in header
        .expect(res => csrf = res.headers['x-csrf']) // save value
        .expect(200,
          err => err ? done(err) :
          reqCookies.head('/api/user/csrf')
            .expect('x-csrf', /.+/) // new csrf in header
            .expect(res => { // confirm csrf is different
              assert.equal(res.headers['set-cookie'], undefined);
              assert.equal(res.headers['x-csrf'] == csrf, false);
            })
            .expect(200, done)
        );
    });

    it('defaults to octocat', done => {
      let csrf; // csrf placeholder
      reqCookies.head('/api/user/csrf')
        .expect(res => csrf = res.headers['x-csrf'])
        .expect(200,
          err => err ? done(err) :
          reqCookies.get('/api/user/oauth/github')
            .query({
              state: csrf,
              redirect: 'foo/bar'
            })
            .expect('location', '/foo/bar')
            .expect(302,
              err => err ? done(err) :
              reqCookies.head('/api/user')
                .expect('x-user', 'octocat')
                .expect(200,
                  err => err ? done(err) :
                  reqCookies.get('/api/user/profile')
                    .expect('Content-Type', /json/)
                    .expect('x-user', 'octocat')
                    .expect(res => assert.equal(res.body.login, 'octocat'))
                    .expect(200, done)
                )
            )
        );
    });

    it('cleanly logs out', done => {
      reqCookies.head('/api/user')
        .expect('x-user', 'octocat')
        .expect(200,
          err => err ? done(err) :
          reqCookies.get('/api/user/logout')
            .expect('Content-Length', '0')
            .expect(200,
              err => err ? done(err) :
              reqCookies.head('/api/user')
                .expect(401, done)
            )
        );
    });

    it('requires csrf, and ignores bad redirects', done => {
      let csrf; // csrf placeholder
      reqCookies.get('/api/user/oauth/github')
        .expect(400, // intentionally missing csrf
          err => err ? done(err) :
          reqCookies.head('/api/user/csrf')
            .expect(res => csrf = res.headers['x-csrf'])
            .expect(200,
              err => err ? done(err) :
              reqCookies.get('/api/user/oauth/github')
                .query({

                  // successful with valid csrf
                  state: csrf,

                  // bad redirect is ignored
                  redirect: 'http://evil-website.com/foo/bar'
                })
                .expect('location', '/') // defaults to "/" instead
                .expect(302, done)
            )
        );
    });
  });

  describe('benchmark tests', () => {

    it('returns 404 for missing benchmark', done => {
      request.get('/api/test/does-not-exist')
        .expect(404, done);
    });

    it('loads benchmarks from redis > s3 > local cache');

    it('allows anonymous benchmark tests');

    it('allows saving anon benchmark tests to user');

    it('allows updating benchmark tests');

    it('allows importing benchmark tests');

    it('captures test results');

    it('returns summarized test results');

    it('returns benchmark test statistics');

    describe('platform-specific runners', () => {

      it('browser-based platform allows embedding');

      it('non-browser platform returns standalone script');

    });
  });
});

describe('jsop.io (oauth-gh enabled)', () => {
  let jsop; // default config jsop
  let reqCookies; // persist session cookies

  // before:  start jsop with oauth-gh enabled,
  //          and attach a new supertest agent client
  before(() => {
    jsop = JsopFactory({
      oAuthGHID: 'ghclientid',
      oAuthGHScr: 'ghclientscr'
    });
    reqCookies = supertest.agent(jsop.server);
  });

  describe('user login', () => {

    it('has oauth github configured', () => {
      assert(Boolean(jsop.app.locals.cfg.oauth.githubID));
      assert(Boolean(jsop.app.locals.cfg.oauth.githubSecret));
    });

    it('oauth redirects to github', done => {
      let csrf; // csrf placeholder
      reqCookies.head('/api/user/csrf')
        .expect('set-cookie', /^jsop-session=.+/) // init cookie
        .expect('x-csrf', /.+/) // csrf in header
        .expect(res => csrf = res.header['x-csrf'])
        .expect(200,
          err => err ? done(err) :
          reqCookies.get('/api/user/oauth/github')
            .query({state: csrf, redirect: 'foo/bar'})
            .expect('location', /^https:\/\/github.com\/login\/oauth/)
            .expect(302, done)
        );
    });

    it('returns 400 if github fails to return code');

    it('returns 400 if github fails to return access_token');

    it('returns 400 if github fails to return user profile');

    it('redirects on successful oauth');

    xit('cleanly logs out', done => {
      reqCookies.head('/api/user')
        .expect('x-user', /.+/)
        .expect(200,
          err => err ? done(err) :
          reqCookies.get('/api/user/logout')
            .expect('Content-Length', '0')
            .expect(200,
              err => err ? done(err) :
              reqCookies.head('/api/user')
                .expect(401, done)
            )
        );
    });
  });
});
