window.Rx = require('rxjs');
window.$ = require('jquery');
window.__ = (x) => x;
window.n__ = (x) => x;

require('whatwg-fetch');

require('../app/assets/javascripts/miq_global');

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

// configure enzyme adapter
import Enzyme from 'enzyme';
import EnzymeAdapter from 'enzyme-adapter-react-16';
Enzyme.configure({ adapter: new EnzymeAdapter() });
