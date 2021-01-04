import { Tree } from 'react-wooden-tree';
import { nodeCheckedWithDirty } from './helpers';

export const nodeFromKey = (state, key) => Tree.nodeSelector(state, Tree.nodeSearch(state, null, 'key', key)[0]);

export const checkAll = (state, value) => {
  const newState = { ...state };

  Object.entries(newState).forEach(([key, obj]) => {
    if (key) {
      newState[key] = nodeCheckedWithDirty(obj, value);
    }
  });

  return newState;
};

export const expandParents = (state, nodeId) => {
  let newState = { ...state };
  Tree.getAncestors(nodeId).forEach((parentId) => {
    newState = Tree.nodeUpdater(newState, Tree.nodeExpanded(Tree.nodeSelector(newState, parentId), true));
  });

  return newState;
};

export const select = (state, action) => {
  const node = nodeFromKey(state, action.key);
  return Tree.nodeUpdater(expandParents(state, node.nodeId), Tree.nodeSelected(node, true));
};

export const expand = (state, action) => Tree.nodeUpdater(state, Tree.nodeExpanded(nodeFromKey(state, action.key), true));

export const scrollToNode = (state, action) => {
  const node = nodeFromKey(state, action.key);

  document.querySelector(`li[data-id='${node.nodeId}']`).scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });

  return state;
};

export const expandAll = (state, action) => {
  const newState = {};

  Object.entries(state).forEach(([key, obj]) => {
    newState[key] = Tree.nodeExpanded(obj, action.value);
  });

  return newState;
};
