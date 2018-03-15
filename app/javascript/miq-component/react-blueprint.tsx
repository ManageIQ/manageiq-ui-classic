import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import {
  ComponentProps,
  BasicComponentInstance,
  ManagedComponentInstance,
  ComponentBlueprint
} from '../miq-component/component-typings'

// TODO(vs) importing from @types/react and @types/react-dom causes TypeScript
// compiler to generate tons of errors, updating TypeScript related dependencies
// should fix the problem

export default (
  reactElementCreator: (props: ComponentProps) => any /* ReactElement */,
  mapPropsToInteract: (props: ComponentProps) => any = () => undefined
): ComponentBlueprint => {
  function render(props: ComponentProps, container: HTMLElement) {
    ReactDOM.render(
      <Provider store={ManageIQ.redux.store}>
        {reactElementCreator(props)}
      </Provider>,
      container
    );
  }

  return {
    create(props, mountTo) {
      render(props, mountTo);
      return { interact: mapPropsToInteract(props) };
    },

    update(newProps, mountedTo) {
      render(newProps, mountedTo);
    },

    destroy(instance, unmountFrom) {
      ReactDOM.unmountComponentAtNode(unmountFrom);
    }
  };
}
