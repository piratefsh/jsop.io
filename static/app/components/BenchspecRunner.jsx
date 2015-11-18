import _ from 'lodash';

import React from 'react'
import BenchspecEditor from './BenchspecEditor'
import Benchspec from './Benchspec'

export default {

  // Run benchspec
  run(benchspec){
    return new Promise((resolve, reject) => {
      Benchspec(benchspec)
    });
  },
  
  componentDidLoad(){
      var BENCHSPEC = {id: '', title: '', description_md: '', benchmark: {
        dependencies: [],
        cases: [],
      }};

      // add update listners
      var listen = function() {
        _.invoke(document.querySelectorAll('[name="title"],[name="description_md"]'),
          'addEventListener', 'change', function(ev) {
            var attr = ev.currentTarget.name;
            var val = ev.currentTarget.value;
            BENCHSPEC[attr] = val;
          });
        _.invoke(document.querySelectorAll('[name="html_code"],[name="js_setup"],[name="js_teardown"]'),
          'addEventListener', 'change', function(ev) {
            var attr = ev.currentTarget.name;
            var val = ev.currentTarget.value;
            BENCHSPEC.benchmark[attr] = val;
          });
        document.querySelector('.add-dep').addEventListener('click', function() {
          var dep = {
            name: document.querySelector('[name="dep-name"]').value,
            version: document.querySelector('[name="dep-version"]').value,
            src: document.querySelector('[name="dep-src"]').value,
            var: document.querySelector('[name="dep-var"]').value
          };
          BENCHSPEC.benchmark.dependencies.push(dep);
        });
        document.querySelector('.add-case').addEventListener('click', function() {
          var testcase = {
            label: document.querySelector('[name="case-label"]').value,
            note_md: document.querySelector('[name="case-note_md"]').value,
            js_code: document.querySelector('[name="case-js_code"]').value,
            is_async: document.querySelector('[name="case-is_async"]').checked,
            is_default: document.querySelector('[name="case-is_default"]').checked,
            is_archived: document.querySelector('[name="case-is_archived"]').checked
          };
          BENCHSPEC.benchmark.cases.push(testcase);
        });
        _.invoke((document.querySelectorAll('.rmv-dep') || []),
          'addEventListener', 'click', function(ev) {
          var idx = ev.currentTarget.dataset.idx;
          var deps = BENCHSPEC.benchmark.dependencies;
          BENCHSPEC.benchmark.dependencies = _.without(deps, deps[idx]);
        });
        _.invoke((document.querySelectorAll('.rmv-case') || []),
          'addEventListener', 'click', function(ev) {
          var idx = ev.currentTarget.dataset.idx;
          var cases = BENCHSPEC.benchmark.cases;
          BENCHSPEC.benchmark.cases = _.without(cases, cases[idx]);
        });
      };
  },
}
