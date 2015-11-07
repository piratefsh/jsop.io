'use strict';

var _ = require('lodash');

exports.translate = function (load) {
  return 'module.exports = ' + _.template(load.source, {
    interpolate: /{{([\s\S]+?)}}/g,
    evaluate: /{#([\s\S]+?)}}/g,
    escape: /{{=([\s\S]+?)}}/g
  }).source + ';';
};
