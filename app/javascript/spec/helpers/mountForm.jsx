import React from 'react';
import { Provider } from 'react-redux';
import { render as rtlRender } from '@testing-library/react';

// React Testing Library helper
export const renderWithRedux = (component) => {
  return rtlRender(
    <Provider store={ManageIQ.redux.store}>
      {component}
    </Provider>
  );
};

