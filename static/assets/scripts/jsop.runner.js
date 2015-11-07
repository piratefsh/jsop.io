// jscs:disable
var root = typeof global == "object" && global || this;

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
  for (var i = 0; i < deps.length; i++){
    if (modules[i]) root[deps[i].var] = modules[i];
  }

  // setup benchmark test
  var test = new Benchmark.Suite();
  test.cases = [];

  // add listeners
  test.on('add', function(event){
    var testcase = event.target;
    testcase.on('start', function(){
      console.log('starting: '+testcase.name);
    }).on('cycle', function(){
      // var size = this.stats.sample.length;
      if (this.aborted) {
      //   console.log(String(this));
      // } else {
        console.log(this);
        console.log(this.name + ' aborted!');
      }
    });
    test.cases.push(testcase);
  }).on('complete', function(){
    for (var i = 0; i < test.cases.length; i++){
      console.log(String(test.cases[i]));
    }
  });

  // add test setup/teardown from spec
  Benchmark.prototype.setup = spec.js_setup;
  Benchmark.prototype.teardown = spec.js_teardown;

  // add testcases from spec
  for (var i = 0; i < spec.cases.length; i++){
    test.add(spec.cases[i].label, spec.cases[i].js_code);
  }

  // note test platform
  console.log(Benchmark.platform);

  // run!
  test.run({
    'async': true,
    'queued': true
  });
});
