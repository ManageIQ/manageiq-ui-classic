// all the globals should end up here
// this is the first pack loaded after runtime&shims&vendor
// and the only pack loaded before the asset pipeline

window.$ = window.jQuery = require('jquery');

window._ = require('lodash');
window.numeral = require('numeral');
window.sprintf = require('sprintf-js').sprintf;
