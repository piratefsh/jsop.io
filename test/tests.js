'use strict';

const jsop = require('../server');
const supertest = require('supertest');

describe('jsop https server', () => {

  // connect supertest client to jsop https server
  let request; before(() => request = supertest(jsop.server));
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0; // allow self-signed HTTPS

  describe('api/user', () => {

    describe('unauthorized users', () => {

      it('should 401 status code', done => {
        request.head('/api/user')
          .expect(401, done); // Unauthorized
      });

      it('should 401 and empty json in profile', done => {
        request.get('/api/user/profile')
          .expect('Content-Type', /json/)
          .expect('Content-Length', 2)
          .expect(401, {}, done);
      });

      it('should 400 on oauth without csrf', done => {
        request.get('/api/user/oauth-gh')
          .expect('Content-Type', /json/)
          .expect('Content-Length', 2)
          .expect(400, {}, done);
      });

    });

    describe('user login', () => {

      it('should set cookie (csrf)', done => {
        request.head('/api/user/csrf')
          .expect('set-cookie', /^jsop-session=.+/) // start cookie session
          .expect('x-csrf', /.+/) // csrf value in header
          .expect(200, done);
      });

    });
  });
});
