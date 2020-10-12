import { Tree } from 'react-wooden-tree';
import { ACTIONS } from './index';
import { nodeCheckedWithDirty } from './helpers';

const actionMapper = {
  [ACTIONS.EXPANDED]: (state, value, node) => Tree.nodeUpdater(state, Tree.nodeExpanded(node, value)),
  [ACTIONS.DISABLED]: (state, value, node) => Tree.nodeUpdater(state, Tree.nodeDisabled(node, value)),
  [ACTIONS.SELECTED]: (state, value, node) => Tree.nodeUpdater(state, Tree.nodeSelected(node, value)),
  [ACTIONS.CHILD_NODES]: (state, value, node) => Tree.nodeUpdater(state, Tree.nodeChildren(node, value)),
  [ACTIONS.LOADING]: (state, value, node) => Tree.nodeUpdater(state, Tree.nodeLoading(node, value)),
  [ACTIONS.CHECKED]: (state, value, node) => Tree.nodeUpdater(state, nodeCheckedWithDirty(node, value)),
  [ACTIONS.ADD_NODES]: (state, value) => Tree.addNodes(state, value),
};

export default (state = {}, action) => {
  let node;
  if (action.nodeId) {
    node = Tree.nodeSelector(state, action.nodeId);
  }

  return Object.hasOwnProperty.call(actionMapper, action.type)
    ? actionMapper[action.type](state, action.value, node)
    : state;
};
