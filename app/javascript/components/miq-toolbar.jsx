/* eslint-disable no-console */
import React, { useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';

import { Toolbar } from './toolbar';

import DashboardToolbar from './dashboard_toolbar';
import { convertMultParamsToRailsMultParams } from '../toolbar-actions/util'

/* global miqJqueryRequest, miqSerializeForm */
/* eslint no-restricted-globals: ["off", "miqJqueryRequest", "miqSerializeForm"] */

/* eslint no-alert: "off" */
const miqSupportCasePrompt = (tbUrl) => {
  const supportCase = prompt(__('Enter Support Case:'), '');
  if (supportCase === null) {
    return false;
  }

  if (supportCase.trim() === '') {
    alert(__('Support Case must be provided to collect logs'));
    return false;
  }

  return `${tbUrl}&support_case=${encodeURIComponent(supportCase)}`;
};

const getParams = (urlParms, sendChecked) => {
  const params = [];

  if (urlParms && (urlParms[0] === '?')) {
    params.push(urlParms.slice(1));
  }

  // FIXME - don't depend on length
  // (but then params[:miq_grid_checks] || params[:id] does the wrong thing)
  if (sendChecked && ManageIQ.gridChecks.length) {
    params.push(`miq_grid_checks=${ManageIQ.gridChecks.join(',')}`);
  }

  if (urlParms && urlParms.match('_div$')) {
    params.push(miqSerializeForm(urlParms));
  }

  return _.filter(params).join('&') || undefined;
};

// Toolbar button onClick handler for all toolbar buttons.

const onClick = (button) => {
  let buttonUrl;

  if (button.confirm && !window.confirm(button.confirm)) {
    // No handling unless confirmed.
    return;
  }

  if (button.url) { // A few buttons have an url.
    if (button.url.indexOf('/') === 0) {
      // If url starts with '/' it is non-ajax
      buttonUrl = ['/', ManageIQ.controller, button.url].join('');

      if (ManageIQ.record.recordId !== null) {
        // Remove last '/' if exist. Add recordId.
        buttonUrl = [buttonUrl.replace(/\/$/, ''), ManageIQ.record.recordId].join('/');
      }

      if (button.url_parms) {
        buttonUrl += ['?', getParams(button.url_parms, !!button.send_checked)].join('');
      }

      // popup windows are only supported for urls starting with '/' (non-ajax)
      if (button.popup) {
        window.open(buttonUrl);
      } else {
        // eslint-disable-next-line no-undef
        DoNav(encodeURI(buttonUrl));
      }
      return;
    }

    // An ajax url was defined (url w/o '/')
    buttonUrl = `/${ManageIQ.controller}/${button.url}`;
    if (button.url.indexOf('x_history') !== 0) {
      // If not an explorer history button
      if (ManageIQ.record.recordId !== null) {
        buttonUrl += `/${ManageIQ.record.recordId}`;
      }
    }
  } else if (button.data && button.data.function) {
    // Client-side buttons use 'function' and 'function-data'.
    // eval - returns a function returning the right function.
    /* eslint no-new-func: "off" */
    const fn = new Function(`return ${button.data.function}`);
    fn().call(button, button.data['function-data']);
    return;
  } else { // Most of (classic) buttons.
    // If no url was specified, run standard button ajax transaction.
    // Use x_button method for explorer ajax.
    // Add recordId if defined.
    // Pass button id as 'pressed'.

    buttonUrl = [
      `/${ManageIQ.controller}/${button.explorer ? 'x_button' : 'button'}`,
      ManageIQ.record.recordId !== null ? `/${ManageIQ.record.recordId}` : '',
      `?pressed=${button.id.split('__').pop()}`].join('');
  }

  if (button.prompt) {
    buttonUrl = miqSupportCasePrompt(buttonUrl);
    if (!buttonUrl) {
      return;
    }
  }

  // put url_parms into params var, if defined
  let paramstring = getParams(button.url_parms, !!button.send_checked);
  paramstring = convertMultParamsToRailsMultParams(paramstring);

  const options = {
    beforeSend: true,
    complete: !button.keepSpinner,
    data: paramstring,
  };

  miqJqueryRequest(buttonUrl, options);
};

const onViewClick = (button) => {
  if (button.url && (button.url.indexOf('/') === 0)) {
    const delimiter = (button.url === '/') ? '' : '/';
    const tail = (ManageIQ.record.recordId) ? delimiter + ManageIQ.record.recordId : '';

    window.location.replace(['/', ManageIQ.controller, button.url, tail, button.url_parms].join(''));
  } else {
    onClick(button);
  }
};

const onRowSelect = (isChecked, dispatch) => {
  dispatch({ type: isChecked ? 'INCREMENT' : 'DECREMENT' });
};

const subscribeToSubject = (dispatch) => (
  listenToRx(
    (event) => {
      if (event.eventType === 'updateToolbarCount') {
        dispatch({ type: 'SET', count: event.countSelected });
      } else if (event.rowSelect) {
        onRowSelect(event.rowSelect.checked, dispatch);
      } else if (event.redrawToolbar) {
        dispatch({ type: 'TOOLBARS', toolbars: event.redrawToolbar });
      } else if (event.batchUpdate) {
        dispatch({ type: 'CHANGES', changes: event.batchUpdate });
      } else if (event.update) {
        // TODO: originally probably for QE
        // this.onUpdateItem(event);
        console.log('Toolbar onUpdateItem called.', event);
      } else if (typeof event.setCount !== 'undefined') {
        dispatch({ type: 'SET', count: event.setCount });
      }
    },
    (err) => console.error('Toolbar RxJs Error: ', err),
    () => console.debug('Toolbar RxJs subject completed, no more events to catch.'),
  )
);

const separateItems = (toolbarItems) => {
  const separatedArray = [];
  toolbarItems.forEach((items) => {
    let arrayIndex = separatedArray.push([]);
    items.forEach((item) => {
      if (item.type !== 'separator') {
        separatedArray[arrayIndex - 1].push(item);
      } else {
        arrayIndex = separatedArray.push([]);
      }
    });
  });
  return separatedArray;
};

const filterViews = (toolbarItems) => toolbarItems
  .flat()
  .filter((i) => i && i.id && i.id.indexOf('view_') === 0);

const filterNonViews = (toolbars) => toolbars
  .map((toolbar) =>
    toolbar.filter((i) => i && i.id && i.id.indexOf('view_') !== 0));

const sanitizeToolbars = (arr) => (arr ? arr.filter(Boolean) : []);

const applyButtonChanges = (toolbars, changes) =>
  toolbars.map((toolbar) =>
    toolbar.map((item) => (item.id in changes ? {
      ...item,
      ...changes[item.id],
    } : item)));

const toolbarReducer = (state, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return {
        ...state,
        count: state.count + 1,
      };
    case 'DECREMENT':
      return {
        ...state,
        count: state.count > 0 ? state.count - 1 : 0,
      };
    case 'SET':
      return {
        ...state,
        count: action.count,
      };
    case 'TOOLBARS':
      return {
        ...state,
        count: 0,
        toolbars: sanitizeToolbars(action.toolbars),
      };
    case 'CHANGES':
      return {
        ...state,
        toolbars: applyButtonChanges(state.toolbars, action.changes),
      };
    default:
      return state;
  }
};

const initState = {
  count: 0,
  toolbars: [],
};

/* Wrapper class for generic toolbars and special toolbars. */
const MiqToolbar = ({ kebabLimit, toolbars: initToolbars }) => {
  const [state, dispatch] = useReducer(toolbarReducer, { ...initState, toolbars: sanitizeToolbars(initToolbars) });

  useEffect(() => {
    // Initiall toolbars are given in props.
    // Later can be changed by an RxJs event.
    // eslint-disable-next-line no-use-before-define
    dispatch({ type: 'TOOLBARS', toolbars });

    const subscription = subscribeToSubject(dispatch);
    return () => subscription.unsubscribe();
  }, []);

  const { count, toolbars } = state;

  const renderGenericToolbar = () => {
    const all = separateItems(toolbars.filter((item) => !!item));
    const views = filterViews(all);
    const groups = filterNonViews(all);

    return (
      <Toolbar
        kebabLimit={kebabLimit}
        count={count}
        groups={groups}
        views={views}
        onClick={onClick}
        onViewClick={onViewClick}
      />
    );
  };

  if (toolbars.length === 0) {
    return null;
  }

  const { custom, name, props } = toolbars[0][0];
  if (custom) {
    switch (name) {
      case 'dashboard':
        return <DashboardToolbar {...props} />;
      default:
        return null;
    }
  }

  return renderGenericToolbar();
};

MiqToolbar.propTypes = {
  toolbars: PropTypes.arrayOf(PropTypes.any).isRequired,
  kebabLimit: PropTypes.number.isRequired,
};

export default MiqToolbar;
