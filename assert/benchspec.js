'use strict';
var validator = require('validator');
var _ = require('lodash');

/**
 * Helper to validate benchspec object.
 *
 * If validation fails, returns an error object with
 * human-friendly error messages.
 *
 * @param {Object}  obj   Target javascript object to validate.
 * @param {string}  type  (optional) Expected object type.
 *                        i.e., 'benchspec' (default), 'benchmark',
 *                        'benchdep', or 'benchcase'.
 * @param {string}  prop  (optional) Target property to validate.
 *                        If not set, will validate entire object.
 */
module.exports = function(obj, type, prop) {
  var constraints = rules[type || 'benchspec'];

  if (!constraints) {
    throw new Error('Invalid benchspec type validation.');
  }

  return prop ?
    constraints[prop](obj[prop]) :
    constraints(obj);
};

// Helper: composes validation rules
var ruleset = function(rules) {
  return _.extend(function(val) {
    var errors = _.reduce(rules, function(err, rule, prop) {
      var e = rule(val[prop]);
      if (e) { err[prop] = e; }
      return err;
    }, {});
    return _.isEmpty(errors) ? undefined : errors;
  }, rules);
};

// Helper: returns error messages on invalid
var expect = function(val, fn, msg) {
  var valid = arguments.length == 3 ?
    validator[fn].call(validator, val) :
    validator[fn].apply(validator, [val].concat(_.slice(arguments, 3)));
  return valid === false ? msg : undefined;
};

/**
 * Validation Rules.
 */
var rules = {
  benchspec: ruleset({
    title: function(val) {
      return expect(val, 'isLength', 'Cannot be blank.', 1) ||
      expect(val, 'isLength', '64 character limit.', 1, 64) ||
      expect(val, 'matches', 'Alphanumeric characters only.', /[a-z\d ]/i);
    },
    description_md: function(val) {
      return expect(val, 'isLength', '2048 character limit.', 0, 2048);
    },
    benchmark: function(val) {
      return rules.benchmark(val);
    }
  }),
  benchmark: ruleset({
    dependencies: function(val) {
      var errors = _.filter(_.map(val, rules.benchdep));
      return errors.length ? errors : undefined;
    },
    html_code: function(val) {
      return expect(val, 'isLength', '10240 character limit.', 0, 10240);
    },
    js_setup: function(val) {
      return expect(val, 'isLength', '10240 character limit.', 0, 10240);
    },
    js_teardown: function(val) {
      return expect(val, 'isLength', '10240 character limit.', 0, 10240);
    },
    cases: function(val) {
      if (val instanceof Array == false) {
        return 'Must be an array.';
      } else if (val.length == 0) {
        return 'Must have at least one test case.';
      }

      var errors = _.filter(_.map(val, rules.benchcase));
      return errors.length ? errors : undefined;
    },
  }),
  benchdep: ruleset({
    name: function(val) {
      return expect(val, 'isLength', 'Cannot be blank.', 1) ||
      expect(val, 'isLength', '64 character limit.', 1, 64);
    },
    version: function(val) {
      return expect(val, 'isLength', '32 character limit.', 0, 32);
    },
    src: function(val) {
      return expect(val, 'isLength', 'Cannot be blank.', 1) ||
      expect(val, 'isLength', '256 character limit.', 1, 256) ||
      expect(val, 'isURL', 'Invalid URL.');
    },
    var: function(val) {
      return expect(val, 'isLength', '32 character limit.', 0, 32);
    }
  }),
  benchcase: ruleset({
    label: function(val) {
      return expect(val, 'matches', 'Alphanumeric characters only.', /[a-z\d ]/i) ||
      expect(val, 'isLength', 'Cannot be blank.', 1) ||
      expect(val, 'isLength', '64 character limit.', 1, 64);
    },
    note_md: function(val) {
      return expect(val, 'isLength', '2048 character limit.', 0, 2048);
    },
    js_code: function(val) {
      return expect(val, 'isLength', '10240 character limit.', 0, 10240);
    },
    is_async: function(val) {
      return expect(val, 'isBoolean', 'Boolean value only.');
    },
    is_default: function(val) {
      return expect(val, 'isBoolean', 'Boolean value only.');
    },
    is_archived: function(val) {
      return expect(val, 'isBoolean', 'Boolean value only.');
    }
  })
};
