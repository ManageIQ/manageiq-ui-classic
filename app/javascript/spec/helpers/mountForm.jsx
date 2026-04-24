import React from 'react';
import { Provider } from 'react-redux';
import { mount as enzymeMount, shallow as enzymeShallow } from 'enzyme';
import { render as rtlRender } from '@testing-library/react';

// Enzyme helpers (legacy - for backward compatibility)
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

// React Testing Library helper
export const renderWithRedux = (component) => {
  return rtlRender(
    <Provider store={ManageIQ.redux.store}>
      {component}
    </Provider>
  );
};

