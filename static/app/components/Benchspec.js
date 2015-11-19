import Platform from 'platform'
import Benchmark from 'benchmark/benchmark.js'

// Set up Benchspec

export default function(BENCHSPEC, CALLBACK) {
  var root = typeof global == 'object' && global || this;

  // expect benchmark test to be set
  // as globally declared variable:
  // var BENCHMARK_JSON = 'https://jsop.io/api/test/example';

  var spec = BENCHSPEC.benchmark;
  var deps = spec.dependencies;

  // import benchmark dependencies
  var imports = [];
  for (var i = 0; i < deps.length; i++) {
    imports.push(System.import(deps[i].src));
  }

  // once all imports are loaded,
  // setup and run benchmark test.
  Promise.all(imports).then(function(modules) {

    // make module deps globally available
    for (var i = 0; i < deps.length; i++) {
      if (modules[i]) root[deps[i].var] = modules[i];
    }

    // setup benchmark test
    var benchsuite = window.benchsuite = new Benchmark.Suite();

    // add test setup/teardown from spec
    Benchmark.prototype.setup = spec.js_setup;
    Benchmark.prototype.teardown = spec.js_teardown;

    // collect added testcases
    var testcases = [];
    benchsuite.on('add', function(ev) { testcases.push(ev.target); });

    // add testcases from spec
    for (var i = 0; i < spec.cases.length; i++) {
      benchsuite.add(

        // test case name
        spec.cases[i].label,

        // test case js code
        spec.cases[i].js_code,

        { // test case options and listners
          defer: spec.cases[i].is_async,

          onStart: function() {
            console.log('-----------------------------------');
            console.log('Starting testcase: "' + this.name + '"');
          },
          onError: function() {
            if (this.error) console.log('Testcase error: "' + this.error + '"');
          },
          onComplete: function() {
            if (this.aborted) console.log('Testcase aborted.');
            else console.log('Testcase finished: ' + String(this));
          }
        }
      );
    }

    // note test platform
    console.log('-----------------------------------');
    console.log('Your platform is:');
    console.log(Platform);

    // run!
    console.log('-----------------------------------');
    console.log('Starting benchmark tests!');

    // collect test reults
    benchsuite.on('complete', function() {

      // compile complete resultspec
      var result = {
        id: BENCHSPEC.id,
        platform: Benchmark.platform,
        cases: []
      };

      for (var i = 0; i < spec.cases.length; i++) {
        var tc = testcases[i];

        result.cases.push({
          id: spec.cases[i].id,
          count: tc.count,
          cycles: tc.cycles,
          aborted: tc.aborted,
          error: tc.error,
          hz: tc.hz,
          stats: tc.stats,
          times: tc.times
        });
      }

      //// set up way to return promise to runner
      CALLBACK(result);
    });

    benchsuite.length ? benchsuite.run({
      'async': true,
      'queued': true
    }) : benchsuite.emit('complete');

  });
};
