window.angular = require('angular');
window.Rx = require('rxjs');
window.$ = require('jquery');
window._ = require('lodash');
window.__ = (x) => x;
window.n__ = (x) => x;
window.sprintf = require('sprintf-js').sprintf;

require('../app/assets/javascripts/miq_global');
require('../app/assets/javascripts/miq_application');
require('../app/assets/javascripts/miq_api');
require('../app/assets/javascripts/miq_angular_application');

import { API } from '../app/javascript/http_api';
window.vanillaJsAPI = API;

import { rxSubject, sendDataWithRx, listenToRx } from '../app/javascript/miq_observable';
ManageIQ.angular.rxSubject = rxSubject;
window.sendDataWithRx = sendDataWithRx;
window.listenToRx = listenToRx;
