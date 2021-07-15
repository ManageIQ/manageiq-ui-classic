import React from 'react';
import { isPlainObject, isArray } from 'lodash';

const level2class = {
  error: 'alert-danger',
  info: 'alert-info',
  success: 'alert-success',
  warning: 'alert-warning',
};

const level2icon = {
  error: 'pficon pficon-error-circle-o',
  info: 'pficon pficon-info',
  success: 'pficon pficon-ok',
  warning: 'pficon pficon-warning-triangle-o',
};

const sanitize = function(data) {
  if (isPlainObject(data) && (data.error || data.message)) {
    return (data.error || '').toString() + ' ' + (data.message || '').toString();
  }

  if (isPlainObject(data)) {
    return JSON.stringify(data);
  }

  if (isArray(data) && data.length === 1) {
    return sanitize(data[0]);
  }

  if (data.toString().substr(0, 8) === '[object ') {
    return 'Unknown error, please see the console for details';
  } // no i18n, devel mode only

  return data.toString();
};

export const ToastItem = ({ type, data, close }) => {
  const icon = level2icon[type];
  const alert = level2class[type];
  const message = sanitize(data);

  return (
    <div className="row">
      <div className={`toast-pf alert alert-dismissable col-xs-12 ${alert}`}>
        <button type="button" className="close" data-dismiss="alert" aria-hidden="true" onClick={close}>
          <span className="pficon pficon-close"></span>
        </button>
        <span className={icon}></span>
        {message}
      </div>
    </div>
  );
};
