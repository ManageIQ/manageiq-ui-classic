// This file is automatically compiled by Webpack, along with any other files
// present in this directory. You're encouraged to place your actual application logic in
// a relevant structure within app/javascript and only use these pack files to reference
// that code so it'll be compiled.
//
// To reference this file, add <%= javascript_pack_tag 'application' %> to the appropriate
// layout file, like app/views/layouts/application.html.erb
import { mount } from '../react/mounter';
import componentRegistry from '../react/componentRegistry';
import * as numeral from 'numeral';

// TODO: use ManageIQ object, once race conditions are fixed
window.MiqReact = Object.assign(window.MiqReact || {}, {
  mount: mount,
  componentRegistry: componentRegistry
});

window.numeral = numeral;
