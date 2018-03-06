// This file is automatically compiled by Webpack, along with any other files
// present in this directory. You're encouraged to place your actual application logic in
// a relevant structure within app/javascript and only use these pack files to reference
// that code so it'll be compiled.
//
// To reference this file, add <%= javascript_pack_tag 'application' %> to the appropriate
// layout file, like app/views/layouts/application.html.erb

import 'proxy-polyfill';
import miqRedux from 'miq-redux';
import miqComponent from 'miq-component';
import miqComponentReact from 'miq-component-react';

const app = ManageIQ.angular.app;

// TODO(vs) link to article at http://talk.manageiq.org/c/developers
miqRedux(app);

// TODO(vs) link to article at http://talk.manageiq.org/c/developers
miqComponent();
miqComponentReact();
