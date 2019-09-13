import React, { useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';

import { Toolbar } from '@manageiq/react-ui-components/dist/toolbar';

import DashboardToolbar from './dashboard_toolbar';
import TopologyToolbar from './topology_toolbar';

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

// Toolbar button onClick handler for all toolbar buttons.
const onClick = (button) => {
  console.log('Toolbar onClick handler. Button: ', button);
  if (button.url && (button.url.indexOf('/') === 0)) {
    const delimiter = (button.url === '/') ? '' : '/';
    const tail = (ManageIQ.record.recordId) ? delimiter + ManageIQ.record.recordId : '';

    window.location.replace(['/', ManageIQ.controller, button.url, tail, button.url_parms].join(''));

    return;
  }

  let buttonUrl;

  // // If it's a dropdown, collapse the parent container
  // var parent = button.parents('div.btn-group.dropdown.open');
  // parent.removeClass('open');
  // parent.children('button.dropdown-toggle').attr('aria-expanded', 'false');

  // if (button.hasClass('disabled') || button.parent().hasClass('disabled')) {
  //   return;
  // }

  // // FIXME: watafa?
  // https://github.com/ManageIQ/manageiq-ui-classic/commit/a9215473980f50fed1159ef94c14cd0ec5685624
  // if (button.parents('#dashboard_dropdown').length > 0) {
  //   return;
  // }

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
        buttonUrl += button.url_parms;
      }

      // popup windows are only supported for urls starting with '/' (non-ajax)
      if (button.popup) {
        console.log('open URL: ', buttonUrl);
        window.open(buttonUrl);
      } else {
        console.log('DoNav URL: ', buttonUrl);
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
  } else if (button.function) {
    // Client-side buttons use 'function' and 'function-data'.
    // eval - returns a function returning the right function.
    /* eslint no-new-func: "off" */
    const fn = new Function(`return ${button.function}`);
    fn().call(button, button['function-data']);
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
  const paramstring = getParams(button.url_parms, !!button.send_checked);

  // TODO:
  // Checking for perf_reload button to not turn off spinning Q (will be done after charts are drawn).
  // Checking for Report download button to allow controller method to turn off spinner
  // Need to design this feature into the toolbar button support at a later time.
  const keepSpinner = _.includes([
    'perf_reload',
    'vm_perf_reload',
    'download_choice__render_report_csv',
    'download_choice__render_report_pdf',
    'download_choice__render_report_txt',
    'custom_button_vmdb_choice__ab_button_simulate',
    'catalogitem_button_vmdb_choice__ab_button_simulate',
  ], button.name) || button.name.match(/_console$/);

  const options = {
    beforeSend: true,
    complete: !keepSpinner,
    data: paramstring,
  };

  console.log('miqJqueryRequest URL: ', buttonUrl);
  miqJqueryRequest(buttonUrl, options);

  function getParams(urlParms, sendChecked) {
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
  }
};

// const isButton = item => item.type === 'button';
// const isButtonTwoState = item => item.type === 'buttonTwoState' && item.id.indexOf('view') === -1;
//
//   /**
//    * Public method for changing view over data.
//    * @param {Object} item clicked view object
//    * @param {Object} $event angular synthetic mouse event
//    * @returns {undefined}
//    */

// /**
// * Private method for subscribing to rxSubject.
// * For success functuon @see ToolbarController#onRowSelect()
// * @returns {undefined}
// */
// const subscribeToSubject = () => {
//   listenToRx(
//     event => {
//       if (event.eventType === 'updateToolbarCount') {
//         // TODO
//         // this.MiQToolbarSettingsService.setCount(event.countSelected);
//       } else if (event.rowSelect) {
//         onRowSelect(event.rowSelect);
//       } else if (event.redrawToolbar) {
//         // TODO
//         // this.onUpdateToolbar(event.redrawToolbar);
//       } else if (event.update) {
//         // TODO
//         // this.onUpdateItem(event);
//       } else if (typeof event.setCount !== 'undefined') {
//         onSetCount(event.setCount);
//       }
//
//       // // sync changes
//       // if (!this.$scope.$$phase) {
//       //   this.$scope.$digest();
//       // }
//     },
//     err => { console.error('Angular RxJs Error: ', err); },
//     () => { console.debug('Angular RxJs subject completed, no more events to catch.'); }
//   );
// }
//
// /**
// * Private method for setting rootPoint of MiQEndpointsService.
// * @param {Object} MiQEndpointsService service responsible for endpoits.
// * @returns {undefined}
// */
// const initEndpoints = MiQEndpointsService => {
//   var urlPrefix = '/' + location.pathname.split('/')[1];
//   // TODO
//   // MiQEndpointsService.rootPoint = urlPrefix;
// }
//
// /**
// * Constructor of angular's miqToolbarController.
// * @param {Object} MiQToolbarSettingsService toolbarSettings service from ui-components.
// * @param {Object} MiQEndpointsService endpoits service from ui-components.
// * @param {Object} $scope service for managing $scope (for apply and digest reasons).
// * @param {Object} $location service for managing browser's location.
// * this contructor will assign all params to `this`, it will init endpoits, set if toolbar is used on list page.
// * @returns {undefined}
// */
// // var ToolbarController = function(MiQToolbarSettingsService, MiQEndpointsService, $scope, $location) {
// //   this.MiQToolbarSettingsService = MiQToolbarSettingsService;
// //   this.MiQEndpointsService = MiQEndpointsService;
// //   this.$scope = $scope;
// //   this.$location = $location;
// //   initEndpoints(this.MiQEndpointsService);
// //   this.isList = location.pathname.includes('show_list');
// // };
//
// /**
// * Public method which is executed after row in gtl is selected.
// * @param {Object} data selected row
// * @returns {undefined}
// */
// const onRowSelect = data => {
//   // TODO
//   // this.MiQToolbarSettingsService.checkboxClicked(data.checked);
//   console.log('onRowSelect', data);
// };
//
// /**
// * Public method for setting up url of data views, based on last path param (e.g. /show_list).
// * @returns {undefined}
// */
// const defaultViewUrl = () => {
//   this.dataViews.forEach(function(item) {
//     if (item.url === '') {
//       var lastSlash = location.pathname.lastIndexOf('/');
//       item.url = (lastSlash !== -1) ? location.pathname.substring(lastSlash) : '';
//     }
//   });
// };
//
// // /**
// // * Method which will retrieves toolbar settings from server.
// // * @see MiQToolbarSettingsService#getSettings for more info.
// // * Settings is called with this.isList and $location search object with value of `type`.
// // * No need to worry about multiple search params and no complicated function for parsing is needed.
// // * @param {function} getData callbalc for retireving toolbar data
// // * @returns {undefined}
// // */
// // ToolbarController.prototype.fetchData = function(getData) {
// //   return this.MiQToolbarSettingsService
// //     .getSettings(getData)
// //     .then(function(toolbarItems) {
// //       this.toolbarItems = toolbarItems.items;
// //       this.dataViews = toolbarItems.dataViews;
// //     }.bind(this));
// // };
//
// const onSetCount = count => {
//   // TODO
//   console.log('onSetCount', count);
//   // this.MiQToolbarSettingsService.setCount(count);
//   // if (!this.$scope.$$phase) {
//   //   this.$scope.$digest();
//   // }
// };
//
// // TODO
// // ToolbarController.prototype.setClickHandler = function() {
// //   _.chain(this.toolbarItems)
// //     .flatten()
// //     .map(function(item) {
// //       return (item && item.hasOwnProperty('items')) ? item.items : item;
// //     })
// //     .flatten()
// //     .filter(function(item) {
// //       return item.type &&
// //         (isButton(item) || isButtonTwoState(item));
// //     })
// //     .each(function(item) {
// //       item.eventFunction = function($event) {
// //         // clicking on disabled or hidden things shouldn't do anything
// //         if (item.hidden === true || item.enabled === false) {
// //           return;
// //         }
// //
// //         sendDataWithRx({toolbarEvent: 'itemClicked'});
// //         Promise.resolve(miqToolbarOnClick.bind($event.delegateTarget)($event)).then(function(data) {
// //           sendDataWithRx({type: 'TOOLBAR_CLICK_FINISH', payload: data});
// //         });
// //       };
// //     })
// //     .value();
// // };
//
// const initObject = toolbarString => {
//   subscribeToSubject();
//   updateToolbar(JSON.parse(toolbarString));
// };
//
// // ToolbarController.prototype.onUpdateToolbar = function(toolbarObject) {
// //   this.updateToolbar(toolbarObject);
// // };
//
// // const onUpdateItem = updateData => {
// //   var toolbarItem = _.find(_.flatten(this.toolbarItems), {id: updateData.update});
// //   if (toolbarItem && toolbarItem.hasOwnProperty(updateData.type)) {
// //     toolbarItem[updateData.type] = updateData.value;
// //   }
// // };
//
// const updateToolbar = toolbarObject => {
//     // TODO: re-render toolbar
//   var toolbarItems = generateToolbarObject(toolbarObject);
//   // this.toolbarItems = toolbarItems.items;
//   // this.dataViews = toolbarItems.dataViews;
//   defaultViewUrl();
//   setClickHandler();
//   showOrHide();
// };
//
// const anyToolbarVisible = () => {
//   if (!this.toolbarItems || !this.toolbarItems.length) {
//     return false;
//   }
//
//   var nonEmpty = this.toolbarItems.filter(function(ary) {
//     if (!ary || !ary.length) {
//       return false;
//     }
//
//     return _.some(ary, function(item) {
//       return !item.hidden;
//     });
//   });
//
//   return !!nonEmpty.length;
// };
//
// const showOrHide = () => {
//   if (this.anyToolbarVisible()) {
//     $('#toolbar').show();
//   } else {
//     $('#toolbar').hide();
//   }
// };
//
// //  ToolbarController.$inject = ['MiQToolbarSettingsService', 'MiQEndpointsService', '$scope', '$location'];
// //   miqHttpInject(angular.module('ManageIQ.toolbar'))
// //     .controller('miqToolbarController', ToolbarController);
// // })();
// /* MiQToolbarSettingsService -- utility functions in ../ui-components/src/toolbar/services/toolbarSettingsService.ts */
// /* MiQEndpointsService -- in ui-components/src/common/services/enpointsService.spec.ts: ??? */

const onRowSelect = (isChecked, dispatch) => {
  console.log('onRowSelect', isChecked);
  dispatch({ type: isChecked ? 'INCREMENT' : 'DECREMENT' });
};

const subscribeToSubject = dispatch => (
  listenToRx(
    (event) => {
      if (event.eventType === 'updateToolbarCount') {
        dispatch({ type: 'SET', count: event.countSelected });
      } else if (event.rowSelect) {
        onRowSelect(event.rowSelect.checked, dispatch);
      } else if (event.redrawToolbar) {
        dispatch({ type: 'TOOLBARS', toolbars: event.redrawToolbar });
      } else if (event.update) {
        // TODO: puvodne pravdepodobne pro QE
        // this.onUpdateItem(event);
        console.log('Toolbar onUpdateItem called.', event);
      } else if (typeof event.setCount !== 'undefined') {
        dispatch({ type: 'SET', count: event.setCount });
      }
    },
    err => console.error('Toolbar RxJs Error: ', err),
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

const filterViews = toolbarItems => toolbarItems
  .flat()
  .filter(i => i && i.id && i.id.indexOf('view_') === 0);

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
        count: state.count - 1,
      };
    case 'SET':
      return {
        ...state,
        count: action.count,
      };
    case 'TOOLBARS':
      return {
        ...state,
        toolbars: action.toolbars,
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
const MiqToolbar = (props) => {
  const { toolbars } = props;

  if (!toolbars || (toolbars.length === 0)) {
    return null;
  }

  if (toolbars[0][0].name === 'custom') {
    const toolbarType = toolbars[0][0].args.partial;
    const toolbarProps = toolbars[0][0].args.props;
    switch (toolbarType) {
      case 'dashboard/dropdownbar':
        console.log('toolbarProps: ', toolbarProps);
        return <DashboardToolbar {...toolbarProps} />;
      case 'shared/topology_header_toolbar':
        return <TopologyToolbar />;
      default:
        return null;
    }
  }

  return <MiqGenericToolbar {...props} />;
};

/* Generic toolbar class for toolbars optionally connected to GTL grids
 * reacting to changes in number of selected items. */
const MiqGenericToolbar = (props) => {
  const { toolbars } = props;
  const [state, dispatch] = useReducer(toolbarReducer, initState);

  useEffect(() => {
    // Initiall toolbars are given in props.
    // Later can be changed by an RxJs event.
    dispatch({ type: 'TOOLBARS', toolbars });

    const subscription = subscribeToSubject(dispatch);
    return () => subscription.unsubscribe();
  }, []);

  const groups = separateItems(state.toolbars.filter(item => !!item));
  const views = filterViews(groups);
  console.log('groups: ', groups);
  console.log('views:', views);

  return <Toolbar count={state.count} groups={groups} views={views} onClick={onClick} />;
};

MiqGenericToolbar.propTypes = {
  toolbars: PropTypes.arrayOf(PropTypes.any).isRequired,
};

MiqToolbar.propTypes = {
  toolbars: PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default MiqToolbar;
