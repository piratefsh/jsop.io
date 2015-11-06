//jscs:disable
//load('./r.js');
//require(['./platform.js'], function(platform){
//  java.lang.System.out.println(JSON.stringify(platform));
//});

load('./platform.js');
load('./benchmark.js');
function isHostType(object, property) {
  if (object == null) {
    return false;
  }
  var type = typeof object[property];
  return !rePrimitive.test(type) && (type != 'object' || !!object[property]);
}
var toString = Object.prototype.toString;
var isBrowser = isHostType(root, 'document') && isHostType(root, 'navigator');
var isJava = !isBrowser && /Java/.test(toString.call(root.java));
var root = typeof global == 'object' && global || this;
var console = root.console || (root.console = { 'log': root.print });

var specJSON = {
  "id": "example",
  "title": "Example",
  "author_id": "harrytruong",
  "author_name": "Harry Truong",
  "description_md": "Confirms test runner is functional by benchmarking example test cases. **Markdown is enabled.**",
  "description_html": "<p>Confirms test runner is functional by benchmarking example test cases. <strong>Markdown is enabled.</strong></p>",
  "created_at": 0,
  "updated_at": 0,

  "imported_url": "",
  "imported_at": 0,

  "benchmark": {
    "dependencies": [{
      "name": "lodash",
      "version": "3.10.0",
      "src": "https://cdnjs.cloudflare.com/ajax/libs/lodash.js/3.10.0/lodash.min.js",
      "var": "_3100"
    },{
      "name": "lodash",
      "version": "3.10.1",
      "src": "https://cdnjs.cloudflare.com/ajax/libs/lodash.js/3.10.1/lodash.min.js",
      "var": "_3101"
    }],

    "html_code": "",
    "js_setup": "\nwindow.foo = 42;\nvar x = [1, 5, 4, 2, 3];",
    "js_teardown": "\nwindow.foo = 24;",

    "cases": [{
      "id": "example-test-alpha",
      "label": "alpha",
      "author_id": "harrytruong",
      "author_name": "Harry Truong",
      "note_md": "",
      "note_html": "",
      "created_at": 0,

      "js_code": "x.sort(function(a, b) {\nreturn a - b;\n});",
      "is_async": false,

      "is_default": true,
      "is_archived": false
    },{
      "id": "example-test-beta",
      "label": "beta",
      "author_id": "harrytruong",
      "author_name": "Harry Truong",
      "note_md": "",
      "note_html": "",
      "created_at": 0,

      "js_code": "x.sort(function(a, b) {\nreturn a - b;\n});\nreturn;",
      "is_async": false,

      "is_default": true,
      "is_archived": false
    }]
  }
};
var spec = specJSON.benchmark;

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

java.lang.System.out.println(JSON.stringify(Benchmark.platform));
