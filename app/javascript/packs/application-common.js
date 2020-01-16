// This file is automatically compiled by Webpack, along with any other files
// present in this directory. You're encouraged to place your actual application logic in
// a relevant structure within app/javascript and only use these pack files to reference
// that code so it'll be compiled.
//
// To reference this file, add <%= javascript_pack_tag 'application' %> to the appropriate
// layout file, like app/views/layouts/application.html.erb

import 'proxy-polyfill';
import { Spinner } from 'spin.js';
import 'spin.js/spin.css';
import { API, http } from '../http_api';

import * as newRegistry from '../miq-component/registry';
import reactBlueprint from '../miq-component/react-blueprint';
import * as helpers from '../miq-component/helpers';

import { rxSubject, sendDataWithRx, listenToRx } from '../miq_observable';

import { initializeStore } from '../miq-redux';
import { history } from '../miq-component/react-history.js';
import createReduxRoutingActions from '../miq-redux/redux-router-actions';
import { formButtonsActionTypes, createFormButtonsActions } from '../forms/form-buttons-reducer';
import { miqOptimizationInit } from '../optimization/listen.js';
import { notificationsInit } from './notification-drawer-common';

import '../../stylesheet/application-webpack.scss';

ManageIQ.component = {
  ...newRegistry,
  reactBlueprint,
  ...helpers,
};

const store = initializeStore();

ManageIQ.redux = {
  store,
  addReducer: store.injectReducers,
  history,
  ...createReduxRoutingActions(store),
  formButtonsActions: createFormButtonsActions(store),
  formButtonsActionTypes: { ...formButtonsActionTypes },
};

ManageIQ.angular.rxSubject = rxSubject;
window.sendDataWithRx = sendDataWithRx;
window.listenToRx = listenToRx;

// compatibility: vanillaJsAPI should be considered deprecated
// the new convention is: API is for vanilla/react, $API is for angular
window.API = API;
window.vanillaJsAPI = API;
window.http = http;

// for Automate > Simulate
require('xml_display/XMLDisplay.js');
require('xml_display/XMLDisplay.css');

// miqSpinner, miqSearchSpinner
window.Spinner = Spinner;

// Overview > Optimization
miqOptimizationInit();

import * as move from '../helpers/move.js';
ManageIQ.move = move;

notificationsInit(true);
