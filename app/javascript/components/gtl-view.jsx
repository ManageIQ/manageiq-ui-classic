import React, { useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';

import assign from 'lodash/assign';

import { StaticGTLView } from '../components/gtl';

const generateParamsFromSettings = (settings) => {
  const params = {};
  if (settings) {
    assign(params, settings.current && { page: settings.current });
    assign(params, settings.perpage && { ppsetting: settings.perpage });
    assign(params, settings.sort_header_text && { sort_choice: settings.sort_header_text });
    assign(params, settings.sort_dir && { is_ascending: settings.sort_dir == "ASC"});
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

const TREES_WITHOUT_PARENT = ['pxe', 'ops'];
const TREE_TABS_WITHOUT_PARENT = ['action_tree', 'alert_tree', 'schedules_tree'];
const USE_TREE_ID = ['automation_manager'];

const isAllowedParent = activeTree =>
  TREES_WITHOUT_PARENT.indexOf(ManageIQ.controller) === -1
    && TREE_TABS_WITHOUT_PARENT.indexOf(activeTree) === -1;

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

const EXPAND_TREES = ['savedreports_treebox', 'widgets_treebox'];
const activateNodeSilently = (itemId, activeTree) => {
  // var treeId = angular.element('.collapse.in .treeview').attr('id'); // FIXME
  console.log("TREEEEE: ", activeTree, itemId);
  const treeId = activeTree;
  if (EXPAND_TREES.indexOf(treeId) !== -1) {
    miqTreeExpandRecursive(treeId, itemId);
  }
};

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
  isLoading: true,
  settings: {
    current: 1,
    is_ascending: true,
    perpage: 20,
    sort_col: 0,
    sort_dir: "ASC",
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
  parentId,
  isAscending,
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
    if (typeof item === 'undefined') {
      return;
    }
    dispatch({ type: 'itemSelected', item, isSelected });
  };

  const onSelectAll = (items, target) => {
    var isSelected = target.checked;
    if (typeof items === 'undefined') {
      return;
    }
    items.map(item => (
      dispatch({ type: 'itemSelected', item, isSelected })
    ));
    return false;
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

  const setSort = (settings, headerId, isAscending) => {
    return {
      ...settings,
      sort_dir: isAscending ? "DESC" : "ASC",
      is_ascending: !(!!isAscending),
      sort_col: headerId,
      sort_header_text: head.filter((column) => column.col_idx == headerId)[0].text,
    };
  }

  const onSort = ({ headerId, isAscending }) => {
    getData(
      dispatch,
      modelName,
      activeTree,
      parentId,
      isExplorer,
      setSort(settings, headerId, isAscending),
      records,
      additionalOptions,
    );
  };

  const inEditMode = () => additionalOptions.in_a_form;

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
          constructSuffixForTreeUrl(showUrl, activeTree, item), activeTree
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
          {__("No Records Found.")}
        </div>
      ) : (
        <StaticGTLView
          pagination={computePagination(settings)}
          rows={rows}
          head={head}
          inEditMode={inEditMode}
          settings={settings}
          total={settings.items}
          onPageSet={onPageSet}
          onPerPageSelect={onPerPageSelect}
          onItemSelect={onItemSelect}
          onItemClick={onItemClick}
          onSort={onSort}
          onSelectAll={onSelectAll}
        />
      )}
    </div>
  );
};

GtlView.propTypes = {
  additionalOptions: PropTypes.shape({}),
  modelName: PropTypes.string,
  activeTree: PropTypes.string,
  parentId: PropTypes.string,
  sortColIdx: PropTypes.number,
  sortDir: PropTypes.string,
  isExplorer: PropTypes.bool,
  records: PropTypes.arrayOf(PropTypes.any), // fixme
  hideSelect: PropTypes.bool,
  showUrl: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  pages: PropTypes.shape({}), // fixme
};

GtlView.defaultProps = {
  additionalOptions: {},
  modelName: null,
  activeTree: null,
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
