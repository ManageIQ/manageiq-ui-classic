window.angular = require('angular');
window.Rx = require('rxjs');
window.$ = require('jquery');
window._ = require('lodash');
window.__ = (x) => x;
window.n__ = (x) => x;

require('../app/assets/javascripts/miq_global');
require('../app/assets/javascripts/miq_application');
require('../app/assets/javascripts/miq_api');
require('../app/assets/javascripts/miq_angular_application');

let sprintf = require('../vendor/assets/bower/bower_components/sprintf/src/sprintf.js');
window.sprintf = sprintf.sprintf;
