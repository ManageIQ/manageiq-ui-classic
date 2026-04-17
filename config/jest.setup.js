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

/* ============== RTL test setup ============== */

require('@testing-library/jest-dom');

// TODO: These mocks(getSelection, MutationObserver & createRange) can likely be removed
// after upgrading Jest to the latest version & adding jest-environment-jsdom if needed

// Mock getSelection for @testing-library/user-event, user-event looks for 
// element.ownerDocument.getSelection, so we need to mock it on document
document.getSelection = () => ({
  removeAllRanges: () => {},
  addRange: () => {},
  rangeCount: 0,
});

// Mock MutationObserver for @testing-library/dom waitFor
global.MutationObserver = class {
  constructor(callback) {
    this.callback = callback;
  }
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
};

// Mock createRange for @testing-library/user-event selectOptions
// Looks like the current jsdom has incomplete Range API implementation
document.createRange = () => {
  const range = {
    setStart: () => {},
    setEnd: () => {},
    commonAncestorContainer: {
      nodeName: 'BODY',
      ownerDocument: document,
    },
    cloneRange: () => range,
    selectNodeContents: () => {},
    getBoundingClientRect: () => ({
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0,
    }),
    getClientRects: () => ({
      length: 0,
      item: () => null,
    }),
  };
  return range;
};

// Mock SVG methods
window.SVGElement.prototype.getComputedTextLength = jest.fn(() => 100);

/* ============================================ */

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

// Loading the API and http globals to the test context
import { API, http } from '../app/javascript/http_api';

window.API = API;
window.http = http;
