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

    it('returns benchspec json', done => {
      request.head('/api/benchmark/does-not-exist')
        .expect(404,
          err => err ? done(err) :
          request.get('/api/benchmark/example')
            .expect('Content-Type', /json/)
            .expect(res => {
              assert.equal(res.body.id, 'example');
              assert.equal(typeof res.body.title, 'string');

              var benchmark = res.body.benchmark;
              assert.equal(typeof benchmark, 'object');
              assert(benchmark.dependencies instanceof Array);
              assert.equal(typeof benchmark.js_setup, 'string');
              assert.equal(typeof benchmark.js_teardown, 'string');
              assert(benchmark.cases instanceof Array);
              assert(benchmark.cases.length > 0);

              for (var i = 0; i < benchmark.cases.length; i++){
                var testcase = benchmark.cases[i];
                assert.equal(typeof testcase, 'object');
                assert.equal(typeof testcase.label, 'string');
                assert.equal(typeof testcase.id, 'string');
                assert(testcase.id.indexOf(res.body.id) === 0);
                assert.equal(typeof testcase.js_code, 'string');
                assert.equal(typeof testcase.is_async, 'boolean');
                assert.equal(typeof testcase.is_default, 'boolean');
                assert.equal(typeof testcase.is_archived, 'boolean');
              }
            })
            .expect(200, done)
        );
    });

    it('loads benchmarks from redis > s3 > local cache');

    it('allows create anonymous benchmark tests');

    it('allows transfer anon benchmark tests to user');

    it('allows updating benchmark tests');

    it('allows importing benchmark tests');

    it('captures test results');

    it('returns test results (summary/raw)', done => {
      request.head('/api/benchmark/does-not-exist/results')
        .expect(404,
          err => err ? done(err) :
          request.get('/api/benchmark/example/results')
            .expect('Content-Type', /json/)
            .expect(res => {
              assert.equal(res.body.id, 'example');

              var summary = res.body.summary;
              assert.equal(typeof summary, 'object');
              assert.equal(typeof summary.count, 'number');
              assert(summary.cases instanceof Array);

              for (var i = 0; i < summary.cases.length; i++){
                var testcase = summary.cases[i];
                assert.equal(typeof testcase, 'object');
                assert.equal(typeof testcase.id, 'string');
                assert(testcase.id.indexOf(res.body.id) === 0);
                assert.equal(typeof testcase.aborted, 'number');
                assert.equal(typeof testcase.hz, 'number');
                assert.equal(typeof testcase.rme, 'number');
              }

              var platforms = res.body.platforms;
              assert(platforms instanceof Array);
              for (var i = 0; i < platforms.length; i++){
                var platform = platforms[i];
                assert.equal(typeof platform, 'object');
                assert.equal(typeof platform.name, 'string');
                assert.equal(typeof platform.summary, 'object');
                assert.equal(typeof platform.summary.count, 'number');
                assert(platform.summary.cases instanceof Array);

                for (var j = 0; j < platform.summary.cases.length; j++){
                  var testcase = platform.summary.cases[i];
                  assert.equal(typeof testcase, 'object');
                  assert.equal(typeof testcase.id, 'string');
                  assert(testcase.id.indexOf(res.body.id) === 0);
                  assert.equal(typeof testcase.aborted, 'number');
                  assert.equal(typeof testcase.hz, 'number');
                  assert.equal(typeof testcase.rme, 'number');
                }
              }
            })
            .expect(200,
              err => err ? done(err) :
              request.get('/api/benchmark/example/results/raw')
                .expect('Content-Type', /json/)
                .expect(res => {
                  assert.equal(res.body.id, 'example');
                  assert(res.body.results instanceof Array);

                  for (var i = 0; i < res.body.results.length; i++){
                    var result = res.body.results[i];
                    assert.equal(typeof result, 'object');
                    assert.equal(typeof result.platform, 'object');
                    assert.equal(typeof result.platform.name, 'string');
                    assert.equal(typeof result.platform.version, 'string');
                    assert(result.cases instanceof Array);
                    assert(result.cases.length > 0);

                    for (var j = 0; j < result.cases.length; j++){
                      var testcase = result.cases[i];
                      assert.equal(typeof testcase, 'object');
                      assert.equal(typeof testcase.id, 'string');
                      assert(testcase.id.indexOf(res.body.id) === 0);
                      assert.equal(typeof testcase.count, 'number');
                      assert.equal(typeof testcase.cycles, 'number');
                      assert.equal(typeof testcase.aborted, 'boolean');
                      assert.equal(typeof testcase.error, 'object');
                      assert.equal(typeof testcase.hz, 'number');

                      assert.equal(typeof testcase.stats, 'object');
                      assert.equal(typeof testcase.stats.moe, 'number');
                      assert.equal(typeof testcase.stats.rme, 'number');
                      assert.equal(typeof testcase.stats.sem, 'number');
                      assert.equal(typeof testcase.stats.deviation, 'number');
                      assert(testcase.stats.sample instanceof Array);
                      assert(testcase.stats.sample.length > 0);
                      assert.equal(typeof testcase.stats.sample[0], 'number');
                      assert.equal(typeof testcase.stats.variance, 'number');

                      assert.equal(typeof testcase.times, 'object');
                      assert.equal(typeof testcase.times.cycle, 'number');
                      assert.equal(typeof testcase.times.elapsed, 'number');
                      assert.equal(typeof testcase.times.timeStamp, 'number');
                    }
                  }
                })
                .expect(200, done)
            )
        );
    });

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
