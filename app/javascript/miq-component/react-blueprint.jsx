import * as React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

export default (ReactElement, mapPropsToInteract) => {
  function render(props, container) {
    ReactDOM.render(
      <Provider store={ManageIQ.redux.store}>
        <ReactElement {...props} />
      </Provider>,
      container
    );
  }

  return {
    create(props, mountTo) {
      render(props, mountTo);
      return { interact: mapPropsToInteract(props), elementId: mountTo.id };
    },

    update(newProps, mountedTo) {
      render(newProps, mountedTo);
    },

    destroy(instance, unmountFrom) {
      ReactDOM.unmountComponentAtNode(unmountFrom);
    },

    component: ReactElement,
  };
}
