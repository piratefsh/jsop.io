'use strict';

// allow self-signed HTTPS
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

const jsop = require('../src/jsop');
const supertest = require('supertest');
const assert = require('assert');

describe('jsop https server (default):', () => {
  let jsopDefault;
  let request;

  // before:  start basic, default config jsop
  //          and attach a new supertest client
  before(() => {
    jsopDefault = jsop({});
    request = supertest(jsopDefault.server);
  });

  describe('for unauthorized users', () => {

    it('returns 401 and empty json profile', done => {
      request.head('/api/user')
        .expect(401, () => {
          request.get('/api/user/profile')
            .expect('Content-Type', /json/)
            .expect('Content-Length', 2)
            .expect(401, {}, done);
        });
    });

    it('returns 400 on oauth without csrf', done => {
      request.get('/api/user/oauth/github')
        .expect(400, '', done);
    });

  });

  describe('for user login', () => {
    let requestC; // supertest client agent (persists cookies)

    // connect requestC client to jsop https server
    before(() => requestC = supertest.agent(jsopDefault.server));

    it('does not have oauth github configured', () => {
      assert(Boolean(jsopDefault.app.locals.cfg.oAuthGHID) == false);
      assert(Boolean(jsopDefault.app.locals.cfg.oAuthGHScr) == false);
    });

    describe('default octocat user', () => {

      it('automatically authenticates', done => {
        let csrf; // csrf placeholder

        requestC.head('/api/user/csrf')
          .expect('set-cookie', /^jsop-session=.+/) // init cookie
          .expect('x-csrf', /.+/) // csrf in header
          .expect(res => csrf = res.header['x-csrf'])
          .expect(200, () => {
            requestC.get('/api/user/oauth/github')
              .query({state: csrf, redirect: 'foo/bar'})
              .expect('location', '/foo/bar')
              .expect(302, () => {
                requestC.head('/api/user')
                  .expect('x-user', 'octocat')
                  .expect(200, done);
              });
          });
      });

      it('returns user profile', done => {
        requestC.get('/api/user/profile')
          .expect('Content-Type', /json/)
          .expect('x-user', 'octocat')
          .expect(res => assert.equal(res.body.login, 'octocat'))
          .expect(200, done);
      });

      it('cleanly logs out', done => {
        requestC.get('/api/user/logout')
          .expect('Content-Length', '0')
          .expect(200, () => {
            requestC.head('/api/user')
              .expect(401, done);
          });
      });
    });

    describe('security', () => {

      it('returns csrf in header', done => {
        requestC.head('/api/user/csrf')
          .expect('x-csrf', /.+/) // csrf in header
          .expect(200, done);
      });

      it('returns 400 when missing csrf', done => {
        requestC.get('/api/user/oauth/github')
          .expect(400, '', done);
      });

      it('ignores external redirects', done => {
        let csrf; // csrf placeholder

        requestC.head('/api/user/csrf')
          .expect(res => csrf = res.headers['x-csrf'])
          .expect(200, () => {
            requestC.get('/api/user/oauth/github/')
              .query({
                state: csrf,
                redirect: 'http://example.com/foo/bar'
              })
              .expect('location', '/')
              .expect(302, done);
          });
      });
    });
  });
});
