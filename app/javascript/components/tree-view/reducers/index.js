import Tree, { ActionTypes } from '@manageiq/react-ui-components/dist/wooden-tree';
import {
  checkAll,
  select,
  scrollToNode,
  expand,
  expandAll,
} from './others';

const actionsPrefix = (prefix) => {
  const newObject = {};
  Object.entries(ActionTypes).forEach(([key, obj]) => {
    newObject[key] = prefix + obj;
  });
  return newObject;
};


export const ACTIONS = {
  ...actionsPrefix('@@tree/'),
  EMPTY_TREE: '@@tree/clearNodes',
  CHECK_ALL: '@@tree/checkAll',
  SELECT: '@@tree/selectNode',
  SELECT_SILENT: '@@tree/selectNodeSilent',
  SCROLL_TO_NODE: '@@tree/scrollToNode',
  EXPAND_ALL: '@@tree/expandAll',
  EXPAND: '@@tree/expandNode',
};

const reducers = (oncheck, onclick) => (state = {}, action) => {
  const node = action.nodeId !== undefined ? Tree.nodeSelector(state, action.nodeId) : undefined;

  switch (action.type) {
    case ACTIONS.CHECKED_DIRECTLY:
      window[oncheck](node.attr.key, action.value, state);
      return state;
    case ACTIONS.SELECTED:
      window[onclick](node.attr.key);
      return state;
    case ACTIONS.EMPTY_TREE: return {};
    case ACTIONS.CHECK_ALL: return checkAll(state, action.value);
    case ACTIONS.SELECT:
      window[onclick](action.key);
      return select(state, action);
    case ACTIONS.SELECT_SILENT: return select(state, action);
    case ACTIONS.SCROLL_TO_NODE: return scrollToNode(state, action);
    case ACTIONS.EXPAND: return expand(state, action);
    case ACTIONS.EXPAND_ALL: return expandAll(state, action);
    default: return state;
  }
};

export default reducers;
