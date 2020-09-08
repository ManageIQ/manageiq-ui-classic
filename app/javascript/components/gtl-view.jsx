import React, { useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { http } from '../http_api';

import assign from 'lodash/assign';

import { StaticGTLView } from '../components/gtl';
import { NoRecordsFound } from './gtl/utils';
import { FlashMessage } from '../components/flash-message/flash-message';

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
  http.post( // FIXME: window
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
  !TREES_WITHOUT_PARENT.includes(ManageIQ.controller)
    && !TREE_TABS_WITHOUT_PARENT.includes(activeTree);

const constructSuffixForTreeUrl = (showUrl, activeTree, item) => {
  let itemId = _.isString(showUrl) && showUrl.indexOf('xx-') !== -1 ? `_-${item.id}` : `-${item.id}`;
  if (item.parent_id && item.parent_id[item.parent_id.length - 1] !== '-') {
    itemId = `${item.parent_id}_${item.tree_id}`;
  } else if (isAllowedParent(activeTree)) {
    itemId = (USE_TREE_ID.includes(ManageIQ.controller)) ? '' : '_';
    itemId += item.tree_id;
  }
  return itemId;
};

const isCurrentControllerOrPolicies = (url) => {
  const splitUrl = url.split('/');
  return splitUrl && (splitUrl[1] === ManageIQ.controller || splitUrl[2] === 'policies');
};

const EXPAND_TREES = ['treeview-savedreports_tree', 'treeview-widgets_tree'];
const activateNodeSilently = (itemId) => {
  const treeId = angular.element('.collapse.in .treeview').attr('id');
  if (!EXPAND_TREES.includes(treeId)) {
    miqTreeExpandRecursive(treeId, itemId);
  }
};

const setRowActive = (rows, item) => {
  const newRows = rows.map(row => ({
    ...row,
    selected: (row.id === item.id),
  }));

  window.sendDataWithRx({ rowSelect: item });
  ManageIQ.gridChecks = [item.id];

  return newRows;
};


const broadcastSelectedItem = (item) => {
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

const unSelectAll = (items) => {
  ManageIQ.gridChecks = [];
  const isSelected = false;

  if (typeof items === 'undefined') {
    return;
  }
  items.map(item => (
    dispatch({ type: 'itemSelected', item, isSelected })
  ));
  return false;
};

const gtlReducer = (state, action) => {
  switch (action.type) {
    case 'dataLoaded':
      ManageIQ.gridChecks = [];
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
        rows: setRowActive(state.rows, action.item),
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
    case 'unSelectAll':
      return {
        ...state,
        rows: unSelectAll(state.rows),
      };
    default:
      return state;
  }
};

/* eslint no-unused-vars: 'off' */
/* eslint no-undef: 'off' */
const subscribeToSubject = dispatch =>
  listenToRx(
    (event) => {
      if (event.toolbarEvent && (event.toolbarEvent === 'itemClicked')) {
        // TODO
         this.setExtraClasses();
      }

      if (event.type === 'gtlSetOneRowActive') {
        dispatch({ type: 'setActiveRow', item: event.item });
      }

      if (event.type === 'gtlUnselectAll') {
        dispatch({ type: 'unSelectAll' });
      }
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
  flashMessages,
  additionalOptions,
  modelName,
  activeTree,
  parentId,
  isAscending,
  sortColIdx,
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
  const noCheckboxes = () => additionalOptions.no_checkboxes;

  const onItemClick = (item, event) => {
    // no need to set targetUrl if custom_action is set i.e. for pre prov screen
    let targetUrl = (additionalOptions && additionalOptions.custom_action) ? undefined : showUrl;
    // Empty showUrl disables onRowClick action. Nothing to do.
    if (!showUrl) {
      return false;
    }

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
    if (isExplorer && targetUrl && isCurrentControllerOrPolicies(targetUrl)) {
      miqSparkleOn();
      let itemId = item.id;
      if (_.isString(targetUrl) && targetUrl.indexOf('?id=') !== -1) {
        itemId = constructSuffixForTreeUrl(showUrl, activeTree, item);
        activateNodeSilently(itemId);
      }

      // Seems to be related to Foreman configured systems unassigned config. profiles.
      // Where we need to navigate to a different URL.
      if (item.id.indexOf('unassigned') !== -1) {
        targetUrl = `/${ManageIQ.controller}/tree_select/?id=`;
      }
      miqAjax(targetUrl + itemId);
      return true;
    }

    // non-explorer case + nested case
    // targetUrl === 'true' disables clicks for tasks w/o parent_path and parent_id
    if (typeof targetUrl !== 'undefined' && targetUrl !== 'true') {
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

  return (
    <div id="miq-gtl-view">
      { (flashMessages) && flashMessages.map((message, index) =>
          <div id={`flash-msg-div-${index}`} key={index}>
            <FlashMessage
              flashMessage={message}
            />
          </div>
        )
      }
      { (rows.length === 0) ? (
        <NoRecordsFound/>
      ) : (
        <StaticGTLView
          pagination={computePagination(settings)}
          rows={rows}
          head={head}
          inEditMode={inEditMode}
          noCheckboxes={noCheckboxes}
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
  flashMessages: PropTypes.array,
  additionalOptions: PropTypes.shape({}),
  modelName: PropTypes.string,
  activeTree: PropTypes.string,
  parentId: PropTypes.string,
  sortColIdx: PropTypes.number,
  isExplorer: PropTypes.bool,
  records: PropTypes.arrayOf(PropTypes.any), // fixme
  hideSelect: PropTypes.bool,
  showUrl: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  pages: PropTypes.shape({}), // fixme
};

GtlView.defaultProps = {
  flashMessages: null,
  additionalOptions: {},
  modelName: null,
  activeTree: null,
  parentId: null,
  sortColIdx: null,
  isExplorer: false,
  records: null,
  hideSelect: false,
  showUrl: null,
  pages: null,
};

export default GtlView;
