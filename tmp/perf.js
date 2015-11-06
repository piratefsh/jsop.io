;(function() {

  /** Used to access the Firebug Lite panel (set by `run`). */
  var fbPanel;

  /** Used as a safe reference for `undefined` in pre ES5 environments. */
  var undefined;

  /** Used as a reference to the global object. */
  var root = typeof global == 'object' && global || this;

  /** Method and object shortcuts. */
  var phantom = root.phantom,
      amd = root.define && define.amd,
      argv = root.process && process.argv,
      document = !phantom && root.document,
      noop = function() {},
      params = root.arguments,
      system = root.system;

  /** Add `console.log()` support for Rhino and RingoJS. */
  var console = root.console || (root.console = { 'log': root.print });

  /** The file path of the lodash file to test. */
  var filePath = (function() {
    var min = 0,
        result = [];

    if (phantom) {
      result = params = phantom.args;
    } else if (system) {
      min = 1;
      result = params = system.args;
    } else if (argv) {
      min = 2;
      result = params = argv;
    } else if (params) {
      result = params;
    }
    var last = result[result.length - 1];
    result = (result.length > min && !/perf(?:\.js)?$/.test(last)) ? last : './lodash.js';

    if (!amd) {
      try {
        result = require('fs').realpathSync(result);
      } catch(e) {}

      try {
        result = require.resolve(result);
      } catch(e) {}
    }
    return result;
  }());

  /** Used to match path separators. */
  var rePathSeparator = /[\/\\]/;

  /** Used to detect primitive types. */
  var rePrimitive = /^(?:boolean|number|string|undefined)$/;

  /** Used to match RegExp special characters. */
  var reSpecialChars = /[.*+?^=!:${}()|[\]\/\\]/g;

  /** The `ui` object. */
  var ui = root.ui || (root.ui = {
    'buildPath': basename(filePath, '.js'),
    'otherPath': 'underscore'
  });

  /** The lodash build basename. */
  var buildName = root.buildName = basename(ui.buildPath, '.js');

  /** The other library basename. */
  var otherName = root.otherName = (function() {
    var result = basename(ui.otherPath, '.js');
    return result + (result == buildName ? ' (2)' : '');
  }());

  /** Used to score performance. */
  var score = { 'a': [], 'b': [] };

  /** Used to queue benchmark suites. */
  var suites = [];

  /** Used to resolve a value's internal [[Class]]. */
  var toString = Object.prototype.toString;

  /** Detect if in a browser environment. */
  var isBrowser = isHostType(root, 'document') && isHostType(root, 'navigator');

  /** Detect if in a Java environment. */
  var isJava = !isBrowser && /Java/.test(toString.call(root.java));

  /** Use a single "load" function. */
  var load = (typeof require == 'function' && !amd)
    ? require
    : (isJava && root.load) || noop;

  /** Load lodash. */
  var lodash = root.lodash || (root.lodash = (
    lodash = load(filePath) || root._,
    lodash = lodash._ || lodash,
    (lodash.runInContext ? lodash.runInContext(root) : lodash),
    lodash.noConflict()
  ));

  /** Load Benchmark.js. */
  var Benchmark = root.Benchmark || (root.Benchmark = (
    Benchmark = load('./benchmark.js') || root.Benchmark,
    Benchmark = Benchmark.Benchmark || Benchmark,
    Benchmark.runInContext(lodash.extend({}, root, { '_': lodash }))
  ));

  /** Load Underscore. */
  var _ = root._ || (root._ = (
    _ = load('./underscore.js') || root._,
    _._ || _
  ));

  /*--------------------------------------------------------------------------*/

  /**
   * Gets the basename of the given `filePath`. If the file `extension` is passed,
   * it will be removed from the basename.
   *
   * @private
   * @param {string} path The file path to inspect.
   * @param {string} extension The extension to remove.
   * @returns {string} Returns the basename.
   */
  function basename(filePath, extension) {
    var result = (filePath || '').split(rePathSeparator).pop();
    return (arguments.length < 2)
      ? result
      : result.replace(RegExp(extension.replace(reSpecialChars, '\\$&') + '$'), '');
  }

  /**
   * Computes the geometric mean (log-average) of an array of values.
   * See http://en.wikipedia.org/wiki/Geometric_mean#Relationship_with_arithmetic_mean_of_logarithms.
   *
   * @private
   * @param {Array} array The array of values.
   * @returns {number} The geometric mean.
   */
  function getGeometricMean(array) {
    return Math.pow(Math.E, lodash.reduce(array, function(sum, x) {
      return sum + Math.log(x);
    }, 0) / array.length) || 0;
  }

  /**
   * Gets the Hz, i.e. operations per second, of `bench` adjusted for the
   * margin of error.
   *
   * @private
   * @param {Object} bench The benchmark object.
   * @returns {number} Returns the adjusted Hz.
   */
  function getHz(bench) {
    var result = 1 / (bench.stats.mean + bench.stats.moe);
    return isFinite(result) ? result : 0;
  }

  /**
   * Host objects can return type values that are different from their actual
   * data type. The objects we are concerned with usually return non-primitive
   * types of "object", "function", or "unknown".
   *
   * @private
   * @param {*} object The owner of the property.
   * @param {string} property The property to check.
   * @returns {boolean} Returns `true` if the property value is a non-primitive, else `false`.
   */
  function isHostType(object, property) {
    if (object == null) {
      return false;
    }
    var type = typeof object[property];
    return !rePrimitive.test(type) && (type != 'object' || !!object[property]);
  }

  /**
   * Logs text to the console.
   *
   * @private
   * @param {string} text The text to log.
   */
  function log(text) {
    console.log(text + '');
    if (fbPanel) {
      // Scroll the Firebug Lite panel down.
      fbPanel.scrollTop = fbPanel.scrollHeight;
    }
  }

  /**
   * Runs all benchmark suites.
   *
   * @private (@public in the browser)
   */
  function run() {
    fbPanel = (fbPanel = root.document && document.getElementById('FirebugUI')) &&
      (fbPanel = (fbPanel = fbPanel.contentWindow || fbPanel.contentDocument).document || fbPanel) &&
      fbPanel.getElementById('fbPanel1');

    log('\nSit back and relax, this may take a while.');
    suites[0].run({ 'async': !isJava });
  }

  /*--------------------------------------------------------------------------*/

  lodash.extend(Benchmark.Suite.options, {
    'onStart': function() {
      log('\n' + this.name + ':');
    },
    'onCycle': function(event) {
      log(event.target);
    },
    'onComplete': function() {
      for (var index = 0, length = this.length; index < length; index++) {
        var bench = this[index];
        if (bench.error) {
          var errored = true;
        }
      }
      if (errored) {
        log('There was a problem, skipping...');
      }
      else {
        var formatNumber = Benchmark.formatNumber,
            fastest = this.filter('fastest'),
            fastestHz = getHz(fastest[0]),
            slowest = this.filter('slowest'),
            slowestHz = getHz(slowest[0]),
            aHz = getHz(this[0]),
            bHz = getHz(this[1]);

        if (fastest.length > 1) {
          log('It\'s too close to call.');
          aHz = bHz = slowestHz;
        }
        else {
          var percent = ((fastestHz / slowestHz) - 1) * 100;

          log(
            fastest[0].name + ' is ' +
            formatNumber(percent < 1 ? percent.toFixed(2) : Math.round(percent)) +
            '% faster.'
          );
        }
        // Add score adjusted for margin of error.
        score.a.push(aHz);
        score.b.push(bHz);
      }
      // Remove current suite from queue.
      suites.shift();

      if (suites.length) {
        // Run next suite.
        suites[0].run({ 'async': !isJava });
      }
      else {
        var aMeanHz = getGeometricMean(score.a),
            bMeanHz = getGeometricMean(score.b),
            fastestMeanHz = Math.max(aMeanHz, bMeanHz),
            slowestMeanHz = Math.min(aMeanHz, bMeanHz),
            xFaster = fastestMeanHz / slowestMeanHz,
            percentFaster = formatNumber(Math.round((xFaster - 1) * 100)),
            message = 'is ' + percentFaster + '% ' + (xFaster == 1 ? '' : '(' + formatNumber(xFaster.toFixed(2)) + 'x) ') + 'faster than';

        // Report results.
        if (aMeanHz >= bMeanHz) {
          log('\n' + buildName + ' ' + message + ' ' + otherName + '.');
        } else {
          log('\n' + otherName + ' ' + message + ' ' + buildName + '.');
        }
      }
    }
  });

  /*--------------------------------------------------------------------------*/

  lodash.extend(Benchmark.options, {
    'async': true,
    'setup': '\
      var _ = global._,\
          lodash = global.lodash,\
          belt = this.name == buildName ? lodash : _;\
      \
      var date = new Date,\
          limit = 50,\
          regexp = /x/,\
          object = {},\
          objects = Array(limit),\
          numbers = Array(limit),\
          fourNumbers = [5, 25, 10, 30],\
          nestedNumbers = [1, [2], [3, [[4]]]],\
          nestedObjects = [{}, [{}], [{}, [[{}]]]],\
          twoNumbers = [12, 23];\
      \
      for (var index = 0; index < limit; index++) {\
        numbers[index] = index;\
        object["key" + index] = index;\
        objects[index] = { "num": index };\
      }\
      var strNumbers = numbers + "";\
      \
      if (typeof assign != "undefined") {\
        var _assign = _.assign || _.extend,\
            lodashAssign = lodash.assign;\
      }\
      if (typeof bind != "undefined") {\
        var thisArg = { "name": "fred" };\
        \
        var func = function(greeting, punctuation) {\
          return (greeting || "hi") + " " + this.name + (punctuation || ".");\
        };\
        \
        var _boundNormal = _.bind(func, thisArg),\
            _boundMultiple = _boundNormal,\
            _boundPartial = _.bind(func, thisArg, "hi");\
        \
        var lodashBoundNormal = lodash.bind(func, thisArg),\
            lodashBoundMultiple = lodashBoundNormal,\
            lodashBoundPartial = lodash.bind(func, thisArg, "hi");\
        \
        for (index = 0; index < 10; index++) {\
          _boundMultiple = _.bind(_boundMultiple, { "name": "fred" + index });\
          lodashBoundMultiple = lodash.bind(lodashBoundMultiple, { "name": "fred" + index });\
        }\
      }\
      if (typeof bindAll != "undefined") {\
        var bindAllCount = -1,\
            bindAllObjects = Array(this.count);\
        \
        var funcNames = belt.reject(belt.functions(belt).slice(0, 40), function(funcName) {\
          return /^_/.test(funcName);\
        });\
        \
        // Potentially expensive.\n\
        for (index = 0; index < this.count; index++) {\
          bindAllObjects[index] = belt.reduce(funcNames, function(object, funcName) {\
            object[funcName] = belt[funcName];\
            return object;\
          }, {});\
        }\
      }\
      if (typeof chaining != "undefined") {\
        var even = function(v) { return v % 2 == 0; },\
            square = function(v) { return v * v; };\
        \
        var largeArray = belt.range(10000),\
            _chaining = _.chain ? _(largeArray).chain() : _(largeArray),\
            lodashChaining = lodash(largeArray);\
      }\
      if (typeof compact != "undefined") {\
        var uncompacted = numbers.slice();\
        uncompacted[2] = false;\
        uncompacted[6] = null;\
        uncompacted[18] = "";\
      }\
      if (typeof compose != "undefined") {\
        var compAddOne = function(n) { return n + 1; },\
            compAddTwo = function(n) { return n + 2; },\
            compAddThree = function(n) { return n + 3; };\
        \
        var _composed = _.compose(compAddThree, compAddTwo, compAddOne),\
            lodashComposed = lodash.compose(compAddThree, compAddTwo, compAddOne);\
      }\
      if (typeof countBy != "undefined" || typeof omit != "undefined") {\
        var wordToNumber = {\
          "one": 1,\
          "two": 2,\
          "three": 3,\
          "four": 4,\
          "five": 5,\
          "six": 6,\
          "seven": 7,\
          "eight": 8,\
          "nine": 9,\
          "ten": 10,\
          "eleven": 11,\
          "twelve": 12,\
          "thirteen": 13,\
          "fourteen": 14,\
          "fifteen": 15,\
          "sixteen": 16,\
          "seventeen": 17,\
          "eighteen": 18,\
          "nineteen": 19,\
          "twenty": 20,\
          "twenty-one": 21,\
          "twenty-two": 22,\
          "twenty-three": 23,\
          "twenty-four": 24,\
          "twenty-five": 25,\
          "twenty-six": 26,\
          "twenty-seven": 27,\
          "twenty-eight": 28,\
          "twenty-nine": 29,\
          "thirty": 30,\
          "thirty-one": 31,\
          "thirty-two": 32,\
          "thirty-three": 33,\
          "thirty-four": 34,\
          "thirty-five": 35,\
          "thirty-six": 36,\
          "thirty-seven": 37,\
          "thirty-eight": 38,\
          "thirty-nine": 39,\
          "forty": 40\
        };\
        \
        var words = belt.keys(wordToNumber).slice(0, limit);\
      }\
      if (typeof flatten != "undefined") {\
        var _flattenDeep = _.flatten([[1]])[0] !== 1,\
            lodashFlattenDeep = lodash.flatten([[1]])[0] !== 1;\
      }\
      if (typeof isEqual != "undefined") {\
        var objectOfPrimitives = {\
          "boolean": true,\
          "number": 1,\
          "string": "a"\
        };\
        \
        var objectOfObjects = {\
          "boolean": new Boolean(true),\
          "number": new Number(1),\
          "string": new String("a")\
        };\
        \
        var objectOfObjects2 = {\
          "boolean": new Boolean(true),\
          "number": new Number(1),\
          "string": new String("A")\
        };\
        \
        var object2 = {},\
            object3 = {},\
            objects2 = Array(limit),\
            objects3 = Array(limit),\
            numbers2 = Array(limit),\
            numbers3 = Array(limit),\
            nestedNumbers2 = [1, [2], [3, [[4]]]],\
            nestedNumbers3 = [1, [2], [3, [[6]]]];\
        \
        for (index = 0; index < limit; index++) {\
          object2["key" + index] = index;\
          object3["key" + index] = index;\
          objects2[index] = { "num": index };\
          objects3[index] = { "num": index };\
          numbers2[index] = index;\
          numbers3[index] = index;\
        }\
        object3["key" + (limit - 1)] = -1;\
        objects3[limit - 1].num = -1;\
        numbers3[limit - 1] = -1;\
      }\
      if (typeof matches != "undefined") {\
        var source = { "num": 9 };\
        \
        var _findWhere = _.findWhere || _.find,\
            _matcher = (_.matches || _.createCallback || _.noop)(source);\
        \
        var lodashFindWhere = lodash.findWhere || lodash.find,\
            lodashMatcher = (lodash.matches || lodash.createCallback || lodash.noop)(source);\
      }\
      if (typeof multiArrays != "undefined") {\
        var twentyValues = belt.shuffle(belt.range(20)),\
            fortyValues = belt.shuffle(belt.range(40)),\
            hundredSortedValues = belt.range(100),\
            hundredValues = belt.shuffle(hundredSortedValues),\
            hundredValues2 = belt.shuffle(hundredValues),\
            hundredTwentyValues = belt.shuffle(belt.range(120)),\
            hundredTwentyValues2 = belt.shuffle(hundredTwentyValues),\
            twoHundredValues = belt.shuffle(belt.range(200)),\
            twoHundredValues2 = belt.shuffle(twoHundredValues);\
      }\
      if (typeof partial != "undefined") {\
        var func = function(greeting, punctuation) {\
          return greeting + " fred" + (punctuation || ".");\
        };\
        \
        var _partial = _.partial(func, "hi"),\
            lodashPartial = lodash.partial(func, "hi");\
      }\
      if (typeof template != "undefined") {\
        var tplData = {\
          "header1": "Header1",\
          "header2": "Header2",\
          "header3": "Header3",\
          "header4": "Header4",\
          "header5": "Header5",\
          "header6": "Header6",\
          "list": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]\
        };\
        \
        var tpl =\
          "<div>" +\
          "<h1 class=\'header1\'><%= header1 %></h1>" +\
          "<h2 class=\'header2\'><%= header2 %></h2>" +\
          "<h3 class=\'header3\'><%= header3 %></h3>" +\
          "<h4 class=\'header4\'><%= header4 %></h4>" +\
          "<h5 class=\'header5\'><%= header5 %></h5>" +\
          "<h6 class=\'header6\'><%= header6 %></h6>" +\
          "<ul class=\'list\'>" +\
          "<% for (var index = 0, length = list.length; index < length; index++) { %>" +\
          "<li class=\'item\'><%= list[index] %></li>" +\
          "<% } %>" +\
          "</ul>" +\
          "</div>";\
        \
        var tplVerbose =\
          "<div>" +\
          "<h1 class=\'header1\'><%= data.header1 %></h1>" +\
          "<h2 class=\'header2\'><%= data.header2 %></h2>" +\
          "<h3 class=\'header3\'><%= data.header3 %></h3>" +\
          "<h4 class=\'header4\'><%= data.header4 %></h4>" +\
          "<h5 class=\'header5\'><%= data.header5 %></h5>" +\
          "<h6 class=\'header6\'><%= data.header6 %></h6>" +\
          "<ul class=\'list\'>" +\
          "<% for (var index = 0, length = data.list.length; index < length; index++) { %>" +\
          "<li class=\'item\'><%= data.list[index] %></li>" +\
          "<% } %>" +\
          "</ul>" +\
          "</div>";\
        \
        var settingsObject = { "variable": "data" };\
        \
        var _tpl = _.template(tpl),\
            _tplVerbose = _.template(tplVerbose, null, settingsObject);\
        \
        var lodashTpl = lodash.template(tpl),\
            lodashTplVerbose = lodash.template(tplVerbose, null, settingsObject);\
      }\
      if (typeof wrap != "undefined") {\
        var add = function(a, b) {\
          return a + b;\
        };\
        \
        var average = function(func, a, b) {\
          return (func(a, b) / 2).toFixed(2);\
        };\
        \
        var _wrapped = _.wrap(add, average);\
            lodashWrapped = lodash.wrap(add, average);\
      }\
      if (typeof zip != "undefined") {\
        var unzipped = [["a", "b", "c"], [1, 2, 3], [true, false, true]];\
      }'
  });

  /*--------------------------------------------------------------------------*/

  suites.push(
    Benchmark.Suite('`_(...).map(...).filter(...).take(...).value()`')
      .add(buildName, {
        'fn': 'lodashChaining.map(square).filter(even).take(100).value()',
        'teardown': 'function chaining(){}'
      })
      .add(otherName, {
        'fn': '_chaining.map(square).filter(even).take(100).value()',
        'teardown': 'function chaining(){}'
      })
  );

  /*--------------------------------------------------------------------------*/

  suites.push(
    Benchmark.Suite('`_.assign`')
      .add(buildName, {
        'fn': 'lodashAssign({}, object)',
        'teardown': 'function assign(){}'
      })
      .add(otherName, {
        'fn': '_assign({}, object)',
        'teardown': 'function assign(){}'
      })
  );

  suites.push(
    Benchmark.Suite('`_.assign` with multiple sources')
      .add(buildName, {
        'fn': 'lodashAssign({}, object, object)',
        'teardown': 'function assign(){}'
      })
      .add(otherName, {
        'fn': '_assign({}, object, object)',
        'teardown': 'function assign(){}'
      })
  );

  suites.push(
    Benchmark.Suite('`_.zip`')
      .add(buildName, {
        'fn': 'lodash.zip.apply(lodash, unzipped)',
        'teardown': 'function zip(){}'
      })
      .add(otherName, {
        'fn': '_.zip.apply(_, unzipped)',
        'teardown': 'function zip(){}'
      })
  );

  /*--------------------------------------------------------------------------*/

  if (Benchmark.platform + '') {
    log(Benchmark.platform);
  }
  // Expose `run` to be called later when executing in a browser.
  if (document) {
    root.run = run;
  } else {
    run();
  }
}.call(this));
