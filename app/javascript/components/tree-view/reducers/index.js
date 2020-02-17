import Tree, { ActionTypes } from '@manageiq/react-ui-components/dist/wooden-tree';
import { checkAll } from './others';


export const ACTIONS = {
  ...ActionTypes,
  EMPTY_TREE: 'tree.empty',
  CHECK_ALL: 'tree.checkAll',
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
    default: return state;
  }
};

export default reducers;
