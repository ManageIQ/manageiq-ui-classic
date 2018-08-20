require('whatwg-fetch');
window.angular = require('angular');
window.Rx = require('rxjs');
window.$ = require('jquery');
window._ = require('lodash');
window.__ = (x) => x;
window.n__ = (x) => x;
window.sprintf = require('sprintf-js').sprintf;
window.miqSparkleOn = () => {};
window.miqSparkleOff = () => {};
window.miqAjaxButton = () => {};
window.add_flash = () => {};

// mock async requests
require('whatwg-fetch');

require('../app/assets/javascripts/miq_global');
require('../app/assets/javascripts/miq_application');
require('../app/assets/javascripts/miq_api');
require('../app/assets/javascripts/miq_angular_application');

import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16'
Enzyme.configure({ adapter: new Adapter() })

import { API } from '../app/javascript/http_api';
window.vanillaJsAPI = API;

window.add_flash = (message, type) => {
    console.log(`message: ${message}. Type: ${type}`);
 };
window.miqFlashLater = () => { };

import { rxSubject, sendDataWithRx, listenToRx } from '../app/javascript/miq_observable';
ManageIQ.component = {};
ManageIQ.angular.rxSubject = rxSubject;

import { initializeStore } from '../app/javascript/miq-redux';
import { history } from '../app/javascript/miq-component/react-history.ts';
const store = initializeStore();

ManageIQ.redux = {
    store,
    addReducer: store.injectReducers,
    history,
  };

window.sendDataWithRx = sendDataWithRx;
window.listenToRx = listenToRx;

import getJSONFixture from '../app/javascript/spec/helpers/getJSONFixtures';
window.getJSONFixture = getJSONFixture;

// configure enzyme adapter
import Enzyme from 'enzyme';
import EnzymeAdapter from 'enzyme-adapter-react-16';
Enzyme.configure({ adapter: new EnzymeAdapter() });
