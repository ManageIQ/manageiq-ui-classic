window.Rx = require('rxjs');
window.$ = require('jquery');
window.__ = (x) => x;
window.n__ = (x) => x;

require('whatwg-fetch');

require('../app/assets/javascripts/miq_global');

import { rxSubject, sendDataWithRx, listenToRx } from '../app/javascript/miq_observable';
ManageIQ.angular.rxSubject = rxSubject;
window.sendDataWithRx = sendDataWithRx;
window.listenToRx = listenToRx;

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
