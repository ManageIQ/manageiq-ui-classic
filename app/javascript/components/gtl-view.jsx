import React, { useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';

import assign from 'lodash/assign';
import find from 'lodash/find';

import { StaticGTLView } from '@manageiq/react-ui-components/dist/gtl';

import '@manageiq/react-ui-components/dist/toolbar.css';
import '@manageiq/react-ui-components/dist/gtl.css';

// ui-component / src/gtl/services/dataTableService.ts

const generateParamsFromSettings = (settings) => {
  const params = {};
  if (settings) {
    assign(params, settings.current && { page: settings.current });
    assign(params, settings.perpage && { ppsetting: settings.perpage });
    assign(params, settings.sortBy && settings.sortBy.sortObject && {
      sort_choice: settings.sortBy.sortObject.text,
    });
    assign(params, settings.sortBy && {
      is_ascending: !!settings.sortBy.isAscending,
    });
  }
  return params;
};

const generateConfig = (
  modelName, // ?: string,  # string with name of model (either association or current model).
  activeTree, // ?: string, # string with active tree.
  parentId, // ?: string,   # ID of parent item.
  isExplorer, // ?: string,
  settings, // ?: any,
  records, // ?: any,
  additionalOptions, // ?: any) {
) => {
  const config = {};

  // name of currently selected model.
  assign(config, modelName && { model_name: modelName, model: modelName });
  // create active tree object, activeTree --  name of currently selected tree.
  assign(config, activeTree && { active_tree: activeTree });
  // parentId of currently selected models ID.
  assign(config, parentId && parentId !== null && { parent_id: parentId, model_id: parentId });
  assign(config, isExplorer && isExplorer !== null && { explorer: isExplorer });
  assign(config, generateParamsFromSettings(settings));
  // array of record IDs
  assign(
    config,
    records && records !== null && {
      'records[]': records,
      records,
    },
  );
  assign(
    config,
    additionalOptions && additionalOptions !== null && { additional_options: additionalOptions },
  );

  return config;
};

const getData = (
  dispatch,
  modelName, // ?: string,
  activeTree, // ?: string,
  parentId, // ?: string,
  isExplorer, // ?: string,
  settings, // ?: any,
  records, // ?: any,
  additionalOptions, // ?: any): ng.IPromise<IRowsColsResponse> {
) =>
  window.http.post( // FIXME: window
    './report_data',
    generateConfig(
      modelName,
      activeTree,
      parentId,
      isExplorer,
      settings,
      records,
      additionalOptions,
    ),
  ).then((responseData) => {
    dispatch({
      type: 'dataLoaded',
      head: responseData.data.head,
      rows: responseData.data.rows,
      settings: responseData.settings,
      messages: responseData.messages,
    });
  });

// app/assets/javascripts/controllers/report_data_controller.js

const TREES_WITHOUT_PARENT = ['pxe', 'ops'];
const TREE_TABS_WITHOUT_PARENT = ['action_tree', 'alert_tree', 'schedules_tree'];
const USE_TREE_ID = ['automation_manager'];

const isAllowedParent = activeTree =>
  TREES_WITHOUT_PARENT.indexOf(ManageIQ.controller) === -1
    && TREE_TABS_WITHOUT_PARENT.indexOf(activeTree) === -1;

//   function tileViewSelector() {
//     return document.querySelector('miq-tile-view');
//   }
//
//   function tableViewSelector() {
//     return document.querySelector('miq-data-table');
//   }
//
const constructSuffixForTreeUrl = (showUrl, activeTree, item) => {
  let itemId = _.isString(showUrl) && showUrl.indexOf('xx-') !== -1 ? `_-${item.id}` : `-${item.id}`;
  if (item.parent_id && item.parent_id[item.parent_id.length - 1] !== '-') {
    itemId = `${item.parent_id}_${item.tree_id}`;
  } else if (isAllowedParent(activeTree)) {
    itemId = (USE_TREE_ID.indexOf(ManageIQ.controller) === -1) ? '_' : '';
    itemId += item.tree_id;
  }
  return itemId;
};

const isCurrentControllerOrPolicies = (url) => {
  const splitUrl = url.split('/');
  return splitUrl && (splitUrl[1] === ManageIQ.controller || splitUrl[2] === 'policies');
};

//   /**
//   * Method for init paging component for GTL.
//   * Default paging has 5, 10, 20, 50, 100, 1000
//   * @returns {Object} pagination object.
//   */
//   function defaultPaging() {
//     return {
//       labelItems: __('Items'),
//       enabled: true,
//       text: 10,
//       value: 10,
//       hidden: false,
//       items: [
//         {id: 'per_page_5', text: 5, value: 5, hidden: false, enabled: true},
//         {id: 'per_page_10', text: 10, value: 10, hidden: false, enabled: true},
//         {id: 'per_page_20', text: 20, value: 20, hidden: false, enabled: true},
//         {id: 'per_page_50', text: 50, value: 50, hidden: false, enabled: true},
//         {id: 'per_page_100', text: 100, value: 100, hidden: false, enabled: true},
//         {id: 'per_page_200', text: 200, value: 200, hidden: false, enabled: true},
//         {id: 'per_page_500', text: 500, value: 500, hidden: false, enabled: true},
//         {id: 'per_page_1000', text: 1000, value: 1000, hidden: false, enabled: true},
//       ],
//     };
//   }
//
//     if (ManageIQ.qe && ManageIQ.qe.gtl && ManageIQ.qe.gtl.actionsToFunction) {
//       vm.apiFunctions = ManageIQ.qe.gtl.actionsToFunction.bind(vm)();
//     }
//     subscribeToSubject.bind(vm)();
//     vm.perPage = defaultPaging();
//   };
//
//   ReportDataController.prototype.setSort = function(headerId, isAscending) {
//     if (this.gtlData.cols[headerId]) {
//       this.settings.sortBy = {
//         sortObject: this.gtlData.cols[headerId],
//         isAscending: isAscending,
//       };
//     }
//   };
//
//   ReportDataController.prototype.onUnsubscribe = function() {
//     this.subscription.unsubscribe();
//   };
//
//   /**
//   * Method for handeling sort function. This will be called when sort of items will be needed. This method will set
//   * sort object to settings and calls method for filtering and sorting.
//   * @param {Number} headerId ID of column which is sorted by.
//   * @param {Boolean} isAscending true | false.
//   * @returns {undefined}
//   */
//   ReportDataController.prototype.onSort = function(headerId, isAscending) {
//     this.setSort(headerId, isAscending);
//     this.initController(this.initObject);
//   };
//
//   ReportDataController.prototype.setPaging = function(start, perPage) {
//     this.perPage.value = perPage;
//     this.perPage.text = perPage + ' ' + this.perPage.labelItems;
//     this.settings.perpage = perPage;
//     this.settings.startIndex = start;
//     this.settings.current = ( start / perPage) + 1;
//   };
//
//   /**
//   * Method for loading more items, either by selecting next page, or by choosing different number of items per page.
//   * It will calculate start index of page and will call method for filtering and sorting items.
//   * @param {Number} start index of item, which will be taken as start item.
//   * @param {Number} perPage Number of items per page.
//   * @returns {undefined}
//   */
//   ReportDataController.prototype.gtlSetOneRowActive = function(item, _event) {
//     this.gtlData.rows.forEach(function(row) {
//       row.selected = false;
//     });
//
//     var selectedItem = _.find(this.gtlData.rows, {long_id: item.long_id});
//     selectedItem.selected = true;
//
//     this.$window.sendDataWithRx({rowSelect: selectedItem});
//
//     ManageIQ.gridChecks = [];
//     ManageIQ.gridChecks.push(item.long_id);
//   };
//
//   /**
//   * Method which will be fired when item was selected (either trough select box or by clicking on tile).
//   * @param {Object} item which item was selected.
//   * @param {Boolean} isSelected true | false.
//   * @returns {undefined}
//   */
//
//   ReportDataController.prototype.setLoading = function(state) {
//     this.$window.ManageIQ.gtl.loading = state;
//     this.settings.isLoading = state;
//     state ? miqSparkleOn() : miqSparkleOff();
//   };
//
//   /**
//   * Method for initializing controller. Good for bootstraping controller after loading items. This method will call
//   * getData for fetching data for current state. After these data were fetched, sorting items and filtering them takes
//   * place.
//   * @param {Object} initObject this object will hold all information about current state.
//   * ```
//   *   initObject: {
//   *     modelName: string,
//   *     gtlType: string,
//   *     activeTree: string,
//   *     parentId: string,
//   *     isExplorer: Boolean
//   *   }
//   * ```
//   * @returns {Object} promise of fetched data.
//   */
//   ReportDataController.prototype.initController = function(initObject) {
//     this.setLoading(true);
//     initObject.modelName = decodeURIComponent(initObject.modelName);
//     this.initObjects(initObject);
//     this.setExtraClasses(initObject.gtlType);
//     return this.getData(initObject.modelName,
//       initObject.activeTree,
//       initObject.parentId,
//       initObject.isExplorer,
//       this.settings,
//       initObject.records,
//       initObject.additionalOptions)
//       .then(function(data) {
//         this.settings.hideSelect = initObject.hideSelect;
//         var start = (this.settings.current - 1) * this.settings.perpage;
//         this.setPaging(start, this.settings.perpage);
//         var sortId = _.findIndex(this.gtlData.cols, {col_idx: parseInt(this.settings.sort_col, 10)});
//         if (sortId !== -1) {
//           this.setSort(sortId, this.settings.sort_dir === 'ASC');
//         }
//         this.setDefaults();
//         this.movePagination();
//
//         // pagination doesn't update on no records (components/data-table/data-table.html:4:99), hide it instead
//         if (!this.gtlData.rows.length) {
//           this.setExtraClasses();
//         }
//
//         this.$timeout(function() {
//           this.setLoading(false);
//           this.$window.ManageIQ.gtl.isFirst = this.settings.current === 1;
//           this.$window.ManageIQ.gtl.isLast = this.settings.current === this.settings.total;
//         }.bind(this));
//
//         return data;
//       }.bind(this));
//   };
//
//   /**
//   * Public method for setting default values of settings object.
//   * Fileds which are set:
//   *       selectAllTitle - String  => title for select all
//   *       sortedByTitle  - String  => title for sort by
//   *       isLoading      - Boolean => if loading has finished.
//   * @returns {undefined}
//   */
//   ReportDataController.prototype.setDefaults = function() {
//     this.settings.selectAllTitle = __('Select All');
//     this.settings.sortedByTitle = __('Sorted By');
//     this.settings.dropdownClass = ['dropup'];
//     this.settings.translateTotalOf = function(start, end, total) {
//       if (typeof start !== 'undefined' && typeof end !== 'undefined' && typeof total !== 'undefined') {
//         return sprintf(__('%d - %d of %d'), start + 1, end + 1, total);
//       }
//       return start + ' - ' + end + ' of ' + total;
//     };
//     this.settings.translateTotalof = this.settings.translateTotalOf;
//   };

// const setExtraClasses = (viewType) => {
//   var mainContent = this.$document.querySelector('#main-content'); // FIXME
//   var pagination = this.$document.querySelector('#paging_div .miq-pagination'); // FIXME
//   
//   if (!mainContent) {
//     return;
//   }
// 
//   angular.element(mainContent).removeClass('miq-list-content');
//   angular.element(pagination).css('display', 'none');
// 
//   if (viewType === 'grid' || viewType === 'tile') {
//     angular.element(pagination).css('display', 'block');
//   } else if (viewType === 'list') {
//     angular.element(mainContent).addClass('miq-list-content');
//     angular.element(pagination).css('display', 'block');
//   }
// };

// window.miqGtlSetExtraClasses = function() {
//   // need this to work even if there is no GTL instance running
//   return ReportDataController.prototype.setExtraClasses.call({
//     $document: document,
//   });
// };


const EXPAND_TREES = ['savedreports_treebox', 'widgets_treebox'];
const activateNodeSilently = (itemId) => {
  // var treeId = angular.element('.collapse.in .treeview').attr('id'); // FIXME
  if (EXPAND_TREES.indexOf(treeId) !== -1) {
    miqTreeExpandRecursive(treeId, itemId);
  }
};

//
//   ReportDataController.prototype.movePagination = function() {
//     this.$timeout(function() {
//       var sortItems = this.$document.getElementsByTagName('miq-sort-items');
//       if (sortItems) {
//         angular.element(sortItems).addClass(this.settings.dropdownClass[0]);
//       }
//       $('table td.narrow').addClass('table-view-pf-select').removeClass('narrow');
//       var pagination = this.$document.getElementsByClassName('miq-pagination');
//       var pagingDiv = this.$document.querySelector('#paging_div');
//       // If more than one angular pagination is present remove some left overs.
//       if (pagination.length !== 1) {
//         $(pagination).each(function(index, item) {
//           // keep the first one
//           index !== 0 && item.remove();
//         });
//       }
//       if (pagination && pagination.length > 0 && pagingDiv && $(pagingDiv).find(pagination).length !== 1) {
//         var oldPagination = pagingDiv.querySelector('div');
//         oldPagination ? oldPagination.remove() : null;
//
//         var cols = 12;
//         if ($('#form_buttons_div').css('display') !== 'none') {
//           if ($('#form_buttons_div').children().length !== 0) {
//             cols = 10;
//           } else {
//             $('#form_buttons_div').css('display', 'none');
//           }
//         }
//
//         var col = $('<div class="col-md-' + cols + '"></div>');
//         $(pagingDiv).append(col);
//         col[0].appendChild(pagination[0]);
//       }
//
//       if (this.initObject.pages) {
//         $(pagingDiv).show();
//       }
//
//       // calculates the height of main content from toolbar and footer, needed
//       // to make sure the paginator is not off the screen
//       miqInitMainContent();
//     }.bind(this));
//   };
//
//   /**
//   * Method for fetching data from server. gtlData, settings and pePage is selected after fetching data.
//   * @param {String} modelName name of current model.
//   * @param {Number} activeTree ID of active tree node.
//   * @param {Number} parentId parent Id, if some nested items are displayed.
//   * @param {Boolean} isExplorer true | false if we are in explorer part of application.
//   * @param {Object} settings settings object.
//   * @param {Array} records array of reccords.
//   * @param {Object} additionalOptions specific options for current view.
//   * @returns {Object} promise of retriveRowsAndColumnsFromUrl of MiQDataTableService.
//   */
//   ReportDataController.prototype.getData = function(modelName,
//     activeTree,
//     parentId,
//     isExplorer,
//     settings,
//     records,
//     additionalOptions) {
//     var basicSettings = {
//       current: 1,
//       perpage: 20,
//       sort_col: 0,
//       sort_dir: 'DESC',
//     };
//     return this.MiQDataTableService
//       .retrieveRowsAndColumnsFromUrl(modelName, activeTree, parentId, isExplorer, settings, records, additionalOptions)
//       .then(function(gtlData) {
//         this.settings = gtlData.settings || basicSettings;
//         if (this.settings.sort_col === -1) {
//           this.settings.sort_col = 0;
//         }
//
//         // Camelize the quadicon data received from the server
//         _.each(gtlData.rows, function(row) {
//           row.quad = camelizeQuadicon(row.quad);
//         });
//
//         this.gtlData = gtlData;
//         this.perPage.text = this.settings.perpage;
//         this.perPage.value = this.settings.perpage;
//         this.initObject = this.initObject || {};
//         this.initObject.showUrl = this.settings.url || this.initObject.showUrl;
//         if (this.initObject.showUrl) {
//           var splitUrl = this.initObject.showUrl.split('/');
//           if (splitUrl && splitUrl[1] === 'vm') {
//             splitUrl[1] = splitUrl[2] === 'policies' ? 'vm_infra' : 'vm_cloud';
//             this.initObject.showUrl = splitUrl.join('/');
//           }
//         }
//         // Apply gettext __() on column headers
//         for (var i = 0;  i < gtlData.cols.length; i++) {
//           var column = gtlData.cols[i];
//           if (column.hasOwnProperty('text')) {
//             column.header_text = __(column.text);
//           }
//         }
//         return gtlData;
//       }.bind(this));
//   };

const setRowActive = (rows, item) => {
  const newRows = rows.map(row => ({
    ...row,
    selected: (row.id === item.id),
  }));

  window.sendDataWithRx({ rowSelect: selectedItem });
  ManageIQ.gridChecks = [item.id];

  return newRows;
};


const broadcastSelectedItem = (item) => {
  console.log('broadcastSelectedItem:', item);

  sendDataWithRx({ rowSelect: item });

  if (!window.ManageIQ) {
    return;
  }

  const { ManageIQ } = window;
  if (item.checked) {
    ManageIQ.gridChecks.push(item.id);
  } else {
    const index = ManageIQ.gridChecks.indexOf(item.id);
    if (index !== -1) {
      ManageIQ.gridChecks.splice(index, 1);
    }
  }
};

const reduceSelectedItem = (state, item, isSelected) => {
  const selectedItem = {
    ...item,
    selected: isSelected,
    checked: isSelected,
  };
  broadcastSelectedItem(selectedItem);
  return {
    ...state,
    rows: state.rows.map(i => (i.id !== selectedItem.id ? i : selectedItem)),
  };
};

const gtlReducer = (state, action) => {
  switch (action.type) {
    case 'dataLoaded':
      console.log('gtlReducer', action);
      return {
        ...state,
        isLoading: false,
        head: action.head,
        rows: action.rows,
        settings: action.settings,
        messages: action.messages,
      };
    case 'setActiveRow':
      // action.item ... the row to become active
      return {
        ...state,
        rows: setRowActive(state.rows, actions.item),
      };
    case 'setScope':
      // action.namedScope ... new named scrop name
      return {
        ...state,
        namedScope: action.namedScope,
      };
    case 'itemSelected':
      // action.item       ... selected item object
      // action.isSelected ... selection status
      return reduceSelectedItem(state, action.item, action.isSelected);
    default:
      return state;
  }
};

const RX_IDENTITY = 'reportDataController';

//   ReportDataController.prototype.setScope = function(scope) {
//     this.initObject.additionalOptions.named_scope = [];
//     this.refreshData({additionalOptions: {named_scope: scope}});
//   };
//

/* eslint no-unused-vars: 'off' */
/* eslint no-undef: 'off' */
const subscribeToSubject = dispatch =>
  listenToRx(
    (event) => {
      // if (event.initController && event.initController.name === RX_IDENTITY) {
      //   // uz se nevola
      //   // this.initController(event.initController.data);
      // } else if (event.unsubscribe && event.unsubscribe === RX_IDENTITY) {
      //   // nemelo by byt potreba, unsubscribe udelame my
      //   // this.onUnsubscribe();
      // } else if (event.refreshData && event.refreshData.name === RX_IDENTITY) {
      //   // nemelo by byt potreba, nikde se nevola
      //   // this.refreshData(event.data);
      // } else if (event.toolbarEvent && (event.toolbarEvent === 'itemClicked')) {
      //   // TODO
      //   // this.setExtraClasses();
      // } else if (event.type === 'TOOLBAR_CLICK_FINISH' && (tileViewSelector() || tableViewSelector())) {
      //   // uz se nepouziva
      //   // this.setExtraClasses(this.initObject.gtlType);
      // }

      if (event.setScope && event.setScope.name === RX_IDENTITY) {
        dispatch({ type: 'setScope', namedScope: event.data });
      } else if (event.type === 'gtlSetOneRowActive') {
        dispatch({ type: 'setActiveRow', item: event.item });
      }

      // TODO: QE support: reimplement
      // if (event.controller === RX_IDENTITY && this.apiFunctions && this.apiFunctions[event.action]) {
      //   const actionCallback = this.apiFunctions[event.action];
      //   const resultData = actionCallback.apply(this, event.data);
      //   if (event.eventCallback) {
      //     event.eventCallback(resultData);
      //   }
      // }
    },
    err => console.error('GTL RxJs Error: ', err),
    () => console.debug('GTL RxJs subject completed, no more events to catch.'),
  );

const initialState = {
  cols: [],
  rows: [],
  gtlType: 'grid',
  isLoading: true,
  settings: {
    current: 1,
    perpage: 20,
    sort_col: 0,
    sort_dir: 'DESC',
  },
//     this.initObject = initObject;
//     if (this.initObject.showUrl === '') {
//       this.initObject.showUrl = '/' + ManageIQ.controller;
//       if (this.initObject.isExplorer) {
//         this.initObject.showUrl += '/x_show/';
//       } else {
//         this.initObject.showUrl += '/show/';
//       }
//     } else if (this.initObject.showUrl === 'false') {
//       this.initObject.showUrl = false;
//     }
//     this.gtlType = initObject.gtlType || DEFAULT_VIEW;
//     this.setLoading(true);
//     ManageIQ.gridChecks = [];
//     this.$window.sendDataWithRx({setCount: 0});
};

const setPaging = (settings, start, perPage) => {
  // this.perPage.value = perPage;
  // this.perPage.text = perPage + ' ' + this.perPage.labelItems;
  return {
    ...settings,
    perpage: perPage,
    startIndex: start,
    current: (start / perPage) + 1,
  };
};

const computePagination = settings => ({
  page: settings.current,
  perPage: settings.perpage,
  perPageOptions: [10, 20, 50, 100, 200], // FIXME
});

const GtlView = ({
  additionalOptions,
  modelName,
  activeTree,
  gtlType,
  parentId,
  sortColIdx,
  sortDir,
  isExplorer,
  records,
  hideSelect,
  showUrl,
  pages,
}) => {
  // const { settings, data } = props;
  const initState = {
    ...initialState,
    gtlType,
    // namedScope is taken from props to state and then used from state
    namedScope: additionalOptions.named_scope,
  };

  const [state, dispatch] = useReducer(gtlReducer, initState);

  useEffect(() => {
    getData(
      dispatch,
      modelName,
      activeTree,
      parentId,
      isExplorer,
      {}, // settings, // FIXME
      records,
      {
        ...additionalOptions,
        named_scope: state.namedScope,
      },
    );

    const subscription = subscribeToSubject(dispatch);
    return () => subscription.unsubscribe();
  }, [state.namedScope]); // fire request if namedScope is changed in state

  const {
    isLoading, head, rows,
    settings, // page settings
  } = state;

  const onItemSelect = (item, isSelected) => {
    console.log('onItemSelect', item, isSelected);
    if (typeof item === 'undefined') {
      return;
    }
    dispatch({ type: 'itemSelected', item, isSelected });
  };

  // const sortBy = {
  //   sortObject: this.gtlData.cols[headerId],
  //   isAscending: isAscending,
  // };

  //     return this.MiQDataTableService
  //       .retrieveRowsAndColumnsFromUrl(modelName, activeTree, parentId, isExplorer, settings, records, additionalOptions)
  //       .then(function(gtlData) {
  //         this.settings = gtlData.settings || basicSettings;
  //         if (this.settings.sort_col === -1) {
  //           this.settings.sort_col = 0;
  //         }
  //
  //         // Camelize the quadicon data received from the server
  //         _.each(gtlData.rows, function(row) {
  //           row.quad = camelizeQuadicon(row.quad);
  //         });
  //
  //         this.gtlData = gtlData;
  //         this.perPage.text = this.settings.perpage;
  //         this.perPage.value = this.settings.perpage;
  //         this.initObject = this.initObject || {};
  //
  //         this.initObject.showUrl = this.settings.url || this.initObject.showUrl;
  //
  //
  //         // do we need this?
  //         // if under vm/policies go to vm_infra/policies
  //         // if under vm/<something> go to vm_cloud/<something>
  //         if (this.initObject.showUrl) {
  //           var splitUrl = this.initObject.showUrl.split('/');
  //           if (splitUrl && splitUrl[1] === 'vm') {
  //             splitUrl[1] = splitUrl[2] === 'policies' ? 'vm_infra' : 'vm_cloud';
  //             this.initObject.showUrl = splitUrl.join('/');
  //           }
  //         }
  //         // Apply gettext __() on column headers
  //         for (var i = 0;  i < gtlData.cols.length; i++) {
  //           var column = gtlData.cols[i];
  //           if (column.hasOwnProperty('text')) {
  //             column.header_text = __(column.text);
  //           }
  //         }
  //         return gtlData;
  //       }.bind(this));
  //   };

  if (isLoading) {
    return <div className="spinner spinner-lg" />;
  }

  const onPageSet = page => getData(
    dispatch,
    modelName,
    activeTree,
    parentId,
    isExplorer,
    setPaging(settings, page * (settings.perpage - 1), settings.perpage),
    records,
    additionalOptions,
  );

  const onPerPageSelect = perPage => getData(
    dispatch,
    modelName,
    activeTree,
    parentId,
    isExplorer,
    setPaging(settings, 0, perPage),
    records,
    additionalOptions,
  );

  const onSort = ({ headerId, isAscending }) => {
    console.log('onSort', headerId, isAscending);
    if (head[headerId]) {
      getData(
        dispatch,
        modelName,
        activeTree,
        parentId,
        isExplorer,
        {
          ...settings,
          sortBy: {
            sortObject: head[headerId],
            isAscending,
          },
        },
        records,
        additionalOptions,
      );
    }
  };

  const onItemClick = (item, event) => {
    let targetUrl = showUrl;

    console.log('onRowClick:', item, event);
    // event.stopPropagation();
    // event.preventDefault();

    // Empty showUrl disables onRowClick action. Nothing to do.
    if (!showUrl) {
      return false;
    }

    // // Clicks table cell outside the checkbox.  // FIXME: test/verify
    // if ($(event.target).is('.is-checkbox-cell')) {
    //   return false;
    // }

    // If custom_action is specified, send and RxJS message with actionType set
    // to custom_action value.
    if (additionalOptions && additionalOptions.custom_action) {
      sendDataWithRx({
        type: 'GTL_CLICKED',
        actionType: additionalOptions.custom_action.type,
        payload: {
          item,
          action: additionalOptions.custom_action,
        },
      });
    }

    // Handling of click-through on request/tasks/jobs (navigate to VM/Host/etc...)
    // URL is calculated based on item, not showUrl.
    if (item.parent_path && item.parent_id) {
      miqSparkleOn();
      window.DoNav(`${item.parent_path}/${item.parent_id}`);
      return true;
    }

    // explorer case + current controller (non nested) + policies
    if (isExplorer && isCurrentControllerOrPolicies(targetUrl)) {
      miqSparkleOn();
      if (_.isString(targetUrl) && targetUrl.indexOf('?id=') !== -1) {
        activateNodeSilently(
          constructSuffixForTreeUrl(showUrl, activeTree, item),
        );
      }

      // Seems to be related to Foreman configured systems unassigned config. profiles.
      // Where we need to navigate to a different URL.
      if (item.id.indexOf('unassigned') !== -1) {
        targetUrl = `/${ManageIQ.controller}/tree_select/?id=`;
      }

      // the setExtraClasses is probably dead now
      // post(targetUrl + itemId).always(() => this.setExtraClasses());
      miqAjax(targetUrl + item.id);
      return true;
    }

    // non-explorer case + nested case
    // targetUrl === 'true' disables clicks for tasks w/o parent_path and parent_id
    if (targetUrl !== 'true') {
      miqSparkleOn();
      const lastChar = targetUrl[targetUrl.length - 1];
      if (lastChar !== '/' && lastChar !== '=') {
        targetUrl += '/';
      }
      window.DoNav(targetUrl + item.id);
      return true;
    }

    return false;
  };

  /* FIXME: removig flash div */
  /* FIXME: missing no-record formatting/partial */
  return (
    <div id="miq-gtl-view">
      { (rows.length === 0) ? (
        <div className="no-record">
          No Records Found.
        </div>
      ) : (
        <StaticGTLView
          pagination={computePagination(settings)}
          gtlType={state.gtlType}
          rows={rows}
          head={head}
          onPageSet={onPageSet}
          onPerPageSelect={onPerPageSelect}
          onItemSelect={onItemSelect}
          onItemClick={onItemClick}
          onSort={onSort}
        />
      )}
    </div>
  );
};

GtlView.propTypes = {
  // settings: PropTypes.any,
  // data: PropTypes.any,
  additionalOptions: PropTypes.shape({}),
  modelName: PropTypes.string,
  activeTree: PropTypes.string,
  gtlType: PropTypes.string,
  parentId: PropTypes.string,
  sortColIdx: PropTypes.number,
  sortDir: PropTypes.string,
  isExplorer: PropTypes.bool,
  records: PropTypes.arrayOf(PropTypes.any), // fixme
  hideSelect: PropTypes.bool,
  showUrl: PropTypes.string,
  pages: PropTypes.shape({}), // fixme
};

GtlView.defaultProps = {
  additionalOptions: {},
  modelName: null,
  activeTree: null,
  gtlType: 'grid',
  parentId: null,
  sortColIdx: null,
  sortDir: null,
  isExplorer: false,
  records: null,
  hideSelect: false,
  showUrl: null,
  pages: null,
};

export default GtlView;
