'use strict';
const express = require('express');
const test = express();

// autoload benchmark test for ":id" param
test.param('id', (req, res, next, id) => {

  // jscs:disable
  req.test = {
    id: 'example-test',
    title: 'Example Test',
    author_id: 'harrytruong',
    author_name: 'Harry Truong',
    description_md: 'Confirms test runner is functional by benchmarking example test cases. **Markdown is enabled.**',
    description_html: '<p>Confirms test runner is functional by benchmarking example test cases. <strong>Markdown is enabled.</strong></p>',
    created_at: 0,
    updated_at: 0,

    imported_url: '',
    imported_at: 0,

    benchmark: {
      js_scripts: [{
        name: 'lodash',
        version: '3.10.1',
        src: 'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/3.10.1/lodash.min.js',
        var: '_'
      }],

      html_code: '',
      js_setup: '',
      js_teardown: '',

      cases: [{
        id: 'example-test-string-build',
        label: 'string build',
        author_id: 'harrytruong',
        author_name: 'Harry Truong',
        note_md: 'uses `+` operator',
        note_html: 'uses <code>&43;</code> operator',
        created_at: 0,

        js_code: 'var str = "hello" + " " + "world";',
        is_async: false,

        is_default: true,
        is_archived: false
      },{
        id: 'example-test-string-array-join',
        label: 'string array join',
        author_id: 'harrytruong',
        author_name: 'Harry Truong',
        note_md: 'uses `array.join()`',
        note_html: 'uses <code>array.join()</code>',
        created_at: 0,

        js_code: 'var str = ["hello", "world"].join(" ");',
        is_async: false,

        is_default: true,
        is_archived: false
      }]
    }
  };
  // jscs:enable

  next();
});

test.get('/:id', (req, res) => {
  res.json(req.test);
});

test.get('/a', (req, res) => {
  const redis = req.app.parent.locals.redis;
  redis.hset('foo','foobar');
  res.send('benchmark-a');
});

test.get('/b', (req, res) => {
  const redis = req.app.parent.locals.redis;
  res.send(redis.hget('foo'));
});

module.exports = test;
