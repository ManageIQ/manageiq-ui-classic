global.window = global;
window.moment = require('moment');
require('moment-strftime');
require('moment-timezone');
require('moment-duration-format')(window.moment);
window.numeral = require('numeral');
require('../../../assets/javascripts/miq_formatters.js');

