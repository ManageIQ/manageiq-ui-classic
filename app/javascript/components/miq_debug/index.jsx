import React from 'react';
import ReactDOM from 'react-dom';

import { ToastWrapper } from './toast-wrapper.jsx';

const state = {
  items: [],
  keyCounter: 0,

  add: (item) => {
    state.items = [...state.items, item];
    state.render();
  },
  clear: () => {
    state.items = [];
    state.render();
  },
  disable: () => {
    sessionStorage.setItem('disableDebugToasts', true);
    state.clear();
  },
  remove: (item) => {
    state.items = state.items.filter((i) => i !== item);
    state.render();
  },

  render: () => null,
};

// render once, and set state.render
export const renderToastWrapper = (element) => {
  const render = ({ items, clear, remove, disable }) => {
    ReactDOM.render(<ToastWrapper items={items} clear={clear} remove={remove} disable={disable} />, element);
  };
  state.render = () => render(state);

  state.render();
};

const debug_toast = function(type, data) {
  // Don't display debug toasts if the user doesn't want it
  if (sessionStorage.getItem('disableDebugToasts')) {
    return false;
  }

  if (type === 'warn') {
    type = 'warning';
  }

  // to make sure user can see the whole error even if we show incomplete toast
  console.debug('debug_toast', type, data);

  state.add({
    data,
    type,
    key: state.keyCounter++,
  });
};

export const setupErrorHandlers = () => {
  const orig = {
    error: window.console.error,
    warn: window.console.warn,
  };

  Object.keys(orig).forEach(function(key) {
    window.console[key] = function() {
      orig[key].apply(window.console, arguments);
      debug_toast(key, Array.from(arguments));
    };
  });

  window.onerror = function(msg, url, lineNo, columnNo, error) {
    debug_toast('error', {
      message: msg,
      url: url,
      lineNo: lineNo,
      columnNo: columnNo,
      error: error,
    });
  };

  window.addEventListener('error', function(ev) {
    debug_toast('error', ev);
  }, true);
};
