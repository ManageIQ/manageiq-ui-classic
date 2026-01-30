const babelConfig = require('../.babelrc.js');
require('@babel/register').default(babelConfig);

require("core-js/stable");
require("regenerator-runtime/runtime");

window.Rx = require('rxjs');
window.$ = require('jquery');
window.__ = (x) => x;
window.n__ = (x) => x;
window._ = require('lodash');
window.sprintf = require('sprintf-js').sprintf;

require('whatwg-fetch');

require('../app/javascript/oldjs/miq_global.js');

import { rxSubject, sendDataWithRx, listenToRx } from '../app/javascript/miq_observable';
ManageIQ.angular.rxSubject = rxSubject;
window.sendDataWithRx = sendDataWithRx;
window.listenToRx = listenToRx;

// mock miq_application helpers
window.add_flash = (x) => true;

// configure enzyme adapter
import Enzyme from 'enzyme';
import EnzymeAdapter from 'enzyme-adapter-react-16';
Enzyme.configure({ adapter: new EnzymeAdapter() });


// mock document.body.createTextRange for code mirror
document.body.createTextRange = () => ({
  setEnd: () => {},
  setStart: () => {},
  getBoundingClientRect: () => {
    return {right: 0};
  },
  getClientRects: () => {
    return {
      length: 0,
      left: 0,
      right: 0,
    };
  }});

// configure Redux store

import initializeStore from '../app/javascript/miq-redux/store';

ManageIQ.redux.store = initializeStore();
ManageIQ.redux.store.injectReducers();

Object.defineProperty(Array.prototype, 'flat', {
    value: function(depth = 1) {
      return this.reduce(function (flat, toFlatten) {
        return flat.concat((Array.isArray(toFlatten) && (depth>1)) ? toFlatten.flat(depth-1) : toFlatten);
      }, []);
    }
});

/**
 * mock redirect-back to avoid console errors about: error: not implemented: navigation (except hash changes)
 * unfortunately this cannot be mocked in some helper file it will only work in global setup
 */
jest.mock('../app/javascript/helpers/miq-redirect-back', () => jest.fn());

// Mock ResizeObserver for Carbon v11 components
Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
});

// Mock matchMedia for Carbon v11 components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Loading the API global to the test context
import { API } from '../app/javascript/http_api';
window.API = API;
