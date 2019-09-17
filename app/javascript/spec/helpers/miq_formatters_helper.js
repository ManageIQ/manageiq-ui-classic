global.window = global;
window._ = require('lodash');
window.sprintf = require('sprintf-js').sprintf;

window.moment = require('moment');
require('moment-strftime');
require('moment-timezone');

window.numeral = require('numeral');
require('../../../assets/javascripts/miq_formatters.js');
