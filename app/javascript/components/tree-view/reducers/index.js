import Tree, { ActionTypes } from '@manageiq/react-ui-components/dist/wooden-tree';

export const ACTIONS = { ...ActionTypes, EMPTY_TREE: 'WOODEN_TREE_EMPTY' };

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
    default: return state;
  }
};

export default reducers;
