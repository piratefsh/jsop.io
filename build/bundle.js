const fs = require('fs');
const request = require('superagent');
const bundle = require('./bundle.json');
const _ = require('lodash');
const uglify = require('uglify-js');

// output targets
const dir = require('path').dirname(require.main.filename) + '/';
const name = 'jsop.bundle.js';
const minName = 'jsop.bundle.min.js';
const minMapName = minName + '.map';

/**
 * Download dependencies (lodash, platform.js, benchmark.js).
 * Note: Use the "lodash-compat" build!
 */
const deps = {lodash: '', platform: '', benchmark: ''};
_.each(deps, (v, k) => {
  console.log('Fetching "' + k + '"...');
  request.get(bundle[k]).end((err, res) => {
    if (err) {
      console.log(
        '  Failed to download "' + k + '" from \n' +
        '  ' + bundle[k] + '\n  Error: "' + err.message + '"');
      process.exit(0);
    }
    deps[k] = res.text;
    runBuild(deps);
  });
});

/**
 * Proceed with build process,
 * after all dependencies are fetched.
 */
const runBuild = _.after(_.keys(deps).length, deps => {
  console.log('Building runner...');

  /**
   * Delete any existing runners.
   */
  try {
    fs.unlinkSync(dir + name);
    fs.unlinkSync(dir + minName);
    fs.unlinkSync(dir + minMapName);
  } catch (e) {}

  /**
   * Write runner header section.
   */
  fs.appendFileSync(dir + name,
    '// jscs:disable\n' +
    'var root = typeof global == "object" && global || this;\n' +
    'var console = root.console || (root.console = { log: root.print });\n' +
    '(function() {\n\n' +
    '  // disable amd/cjs module loading\n' +
    '  var exports = define = false;\n\n\n',
  'utf8');

  /**
   * Write dependency sections.
   */
  fs.appendFileSync(dir + name, deps.lodash, 'utf8');
  fs.appendFileSync(dir + name, deps.platform, 'utf8');
  fs.appendFileSync(dir + name, deps.benchmark, 'utf8');

  /**
   * Write runner footer section.
   */
  fs.appendFileSync(dir + name,
    '\n\n\n  this._.noConflict();\n' +
    '  delete this.platform;\n' +
    '}.call(root));',
  'utf8');

  /**
   * Uglify runnerFile for smaller file size.
   */
  const min = uglify.minify(name, {
    outSourceMap: minMapName
  });
  fs.writeFileSync(dir + minName, min.code, 'utf8');
  fs.writeFileSync(dir + minMapName, min.map, 'utf8');

  console.log('Build complete!');
});
