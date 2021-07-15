import React from 'react';

import { ToastItem } from './toast-item.jsx';

export const ToastWrapper = ({ items, clear, remove, disable }) => {
  if (! items.length) {
    return (<></>);
  }

  const handler = (fn) => (ev) => {
    fn();
    ev.preventDefault();
    return false;
  };

  return (
    <div className="container miq-toast-wrapper">
      <div className="row">
        <div className="toast-pf alert col-xs-12" onClick={handler(clear)}>
          <span className="pficon pficon-close"></span>
          <a href="" onClick={handler(clear)}>
            Clear all
          </a>
          &nbsp;|&nbsp;
          <a href="" onClick={handler(disable)}>
            Disable notifications
          </a>
        </div>
      </div>

      {items.map((item) => (
        <ToastItem type={item.type} data={item.data} close={handler(() => remove(item))} key={item.key} />
      ))}
    </div>
  );
};
