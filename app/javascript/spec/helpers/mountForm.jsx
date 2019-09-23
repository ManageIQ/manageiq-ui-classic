import React from 'react';
import { Provider } from 'react-redux';
import { mount as enzymeMount, shallow as enzymeShallow } from 'enzyme';

export const mount = children => enzymeMount(
  <Provider store={ManageIQ.redux.store}>
    { children }
  </Provider>,
);

export const shallow = children => enzymeShallow(
  <Provider store={ManageIQ.redux.store}>
    { children }
  </Provider>,
);
