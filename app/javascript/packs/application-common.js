// This file is automatically compiled by Webpack, along with any other files
// present in this directory. You're encouraged to place your actual application logic in
// a relevant structure within app/javascript and only use these pack files to reference
// that code so it'll be compiled.
//
// To reference this file, add <%= javascript_pack_tag 'application' %> to the appropriate
// layout file, like app/views/layouts/application.html.erb

import 'proxy-polyfill';

import { mount } from '../react/mounter';
import componentRegistry from '../react/componentRegistry';

import * as newRegistry from '../miq-component/registry';
import reactBlueprint from '../miq-component/react-blueprint';
import * as helpers from '../miq-component/helpers';

import { rxSubject, sendDataWithRx, listenToRx } from '../miq_observable';

ManageIQ.react = {
  mount,
  componentRegistry,
};

ManageIQ.component = {
  ...newRegistry,
  reactBlueprint,
  ...helpers,
};

ManageIQ.angular.rxSubject = rxSubject;
window.sendDataWithRx = sendDataWithRx;
window.listenToRx = listenToRx;
