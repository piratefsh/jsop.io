import _ from 'lodash';

import React from 'react'
import BenchspecEditor from './BenchspecEditor'
import Benchspec from './Benchspec'

export default React.createClass({

  getInitialState(){
    return {
      benchspec: {
        title: "",
        description: "",
        benchmark: {
          cases: [],
          dependencies: []
        }
      }
    }
  },

  // Run benchspec
  run(ev){
    var runDOM = ev.currentTarget;
    if (runDOM.running) {
      runDOM.running = false;
      runDOM.innerText = 'Run Benchmark';
      window.benchsuite.abort();
    } else {
      runDOM.running = true;
      Benchspec(this.state.benchspec, function(results) {
        runDOM.running = false;
        runDOM.innerText = 'Run Benchmark';
        console.log('---- final results ----');
        console.log(JSON.stringify(results, null, 2));
      });
      runDOM.innerText = 'Abort Benchmark';
    }
  },
  
  componentDidLoad(){
      var BENCHSPEC = {id: '', title: '', description_md: '', benchmark: {
        dependencies: [],
        cases: [],
      }};


      // add clear listnser
      document.querySelector('#clear').addEventListener('click', function() {
        BENCHSPEC = {id: '', title: '', description_md: '', benchmark: {
          dependencies: [],
          cases: [],
        }};
        document.querySelector('[name="benchspecid"]').value = '';
        render();
      });

      // add save listnser
      document.querySelector('#save').addEventListener('click', function(ev) {
        var saveDOM = ev.currentTarget;

        if (saveDOM.saving) return; // do nothing

        saveDOM.saving = true;
        saveDOM.innerText = 'Saving...';
        fetch('/api/benchmark/' + (BENCHSPEC.id  || ''), {
            method: BENCHSPEC.id ? 'PUT' : 'POST',
            headers: (function() {
              var h = new Headers();
              h.append('Content-Type', 'application/json');
              return h;
            })(),
            body: JSON.stringify(BENCHSPEC)
          })
          .then(function(res) {
            saveDOM.saving = false;
            saveDOM.innerText = (res.status < 400) ? 'Saved!' : 'Failed to save!';
            return res.status < 400 && res.json();
          })
          .then(function(json) {
            if (json && typeof json.error == 'undefined') {
              BENCHSPEC = json;
              render();
              // document.querySelector('[name="benchspecid"]').value = json.id;
              // document.querySelector('#load').click();
            }
          })
          .catch(function(err) {
            console.log(err);
            saveDOM.saving = false;
            saveDOM.innerText = 'Failed to save!';
          });
      });

      // add update listners
      var listen = function() {
        _.invoke(document.querySelectorAll('[name="title"],[name="description_md"]'),
          'addEventListener', 'change', function(ev) {
            var attr = ev.currentTarget.name;
            var val = ev.currentTarget.value;
            BENCHSPEC[attr] = val;
            render();
          });
        _.invoke(document.querySelectorAll('[name="html_code"],[name="js_setup"],[name="js_teardown"]'),
          'addEventListener', 'change', function(ev) {
            var attr = ev.currentTarget.name;
            var val = ev.currentTarget.value;
            BENCHSPEC.benchmark[attr] = val;
            render();
          });
        document.querySelector('.add-dep').addEventListener('click', function() {
          var dep = {
            name: document.querySelector('[name="dep-name"]').value,
            version: document.querySelector('[name="dep-version"]').value,
            src: document.querySelector('[name="dep-src"]').value,
            var: document.querySelector('[name="dep-var"]').value
          };
          BENCHSPEC.benchmark.dependencies.push(dep);
          render();
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
          render();
        });
        _.invoke((document.querySelectorAll('.rmv-dep') || []),
          'addEventListener', 'click', function(ev) {
          var idx = ev.currentTarget.dataset.idx;
          var deps = BENCHSPEC.benchmark.dependencies;
          BENCHSPEC.benchmark.dependencies = _.without(deps, deps[idx]);
          render();
        });
        _.invoke((document.querySelectorAll('.rmv-case') || []),
          'addEventListener', 'click', function(ev) {
          var idx = ev.currentTarget.dataset.idx;
          var cases = BENCHSPEC.benchmark.cases;
          BENCHSPEC.benchmark.cases = _.without(cases, cases[idx]);
          render();
        });
      };

      ////dummy
      function render(){}

      // reset page on load
      document.querySelector('#clear').click();
  },

  render(){
    return (<BenchspecEditor benchspec={this.state.benchspec} onBenchspecRun={this.run}/>)
  }
})
