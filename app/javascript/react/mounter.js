/**
 * Remove this and replace all ocurances with cuurent mounting mechanism
 */
import React from 'react';
import ReactDOM from 'react-dom';
import componentRegistry from './componentRegistry';

export function mount(component, selector, data = {}) {
  const reactNode = document.querySelector(selector);

  if (reactNode) {
    ReactDOM.unmountComponentAtNode(reactNode);
    ReactDOM.render(componentRegistry.markup(component, data), reactNode);
  } else {
    // eslint-disable-next-line no-console
    console.log(
      `Cannot find \'${selector}\' element for mounting the \'${component}\'`
    );
  }
}
