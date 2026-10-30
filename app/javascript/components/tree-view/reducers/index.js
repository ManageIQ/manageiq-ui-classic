import { createReducer, current, original } from '@reduxjs/toolkit';
import { nodeSearch, getAncestors } from '../helpers';
import { nodeCheckedWithDirty } from './helpers';

export const ACTIONS = {
  EXPANDED: '@@tree/state.expanded',
  CHECKED: '@@tree/state.checked',
  CHECKED_DIRECTLY: '@@tree/state.checked_directly',
  DISABLED: '@@tree/state.disabled',
  SELECTED: '@@tree/state.selected',
  CHILD_NODES: '@@tree/child_nodes',
  ADD_NODES: '@@tree/add.nodes',
  LOADING: '@@tree/loading',
  EMPTY_TREE: '@@tree/clearNodes',
  CHECK_ALL: '@@tree/checkAll',
  SELECT: '@@tree/selectNode',
  SELECT_SILENT: '@@tree/selectNodeSilent',
  SCROLL_TO_NODE: '@@tree/scrollToNode',
  EXPAND_ALL: '@@tree/expandAll',
  EXPAND: '@@tree/expandNode',
};

const WHITELIST = [
  'miqOnCheckGenealogy',
  'miqOnCheckGeneric',
  'miqOnCheckSections',
  'miqOnCheckTenantTree',
  'miqOnClickAutomate',
  'miqOnClickAutomateCatalog',
  'miqOnClickDiagnostics',
  'miqOnClickGeneric',
  'miqOnClickHostNet',
  'miqOnClickMenuRoles',
  'miqOnClickSnapshots',
];

const callIfAllowed = (functName, ...args) => {
  if (WHITELIST.includes(functName)) {
    window[functName](...args);
  }
};

/** Returns the node's nodeId for the node whose attr.key matches `key`. */
const nodeIdFromKey = (draft, key) => nodeSearch(original(draft), null, 'key', key)[0];

/** Marks the node selected and expands all its ancestors. */
const selectNode = (draft, key) => {
  const nodeId = nodeIdFromKey(draft, key);
  getAncestors(nodeId).forEach((parentId) => {
    if (draft[parentId]) {
      draft[parentId].state.expanded = true;
    }
  });
  draft[nodeId].state.selected = true;
};

/**
 * Creates the reducer for one tree namespace.
 *
 * The reducer ignores actions dispatched for other namespaces. `oncheck` and `onclick` are the names of the
 * (whitelisted) global functions called when a node is checked directly / selected.
 */
const createTreeReducer = (namespace, oncheck, onclick) => {
  const treeReducer = createReducer({}, (builder) => {
    builder
      .addCase(ACTIONS.EXPANDED, (draft, { nodeId, value }) => {
        if (nodeId && draft[nodeId]) {
          draft[nodeId].state.expanded = value;
        }
      })
      .addCase(ACTIONS.DISABLED, (draft, { nodeId, value }) => {
        if (nodeId && draft[nodeId]) {
          draft[nodeId].state.disabled = value;
        }
      })
      .addCase(ACTIONS.SELECTED, (draft, { nodeId, value }) => {
        if (nodeId && draft[nodeId]) {
          draft[nodeId].state.selected = value;
          callIfAllowed(onclick, draft[nodeId].attr.key);
        }
      })
      .addCase(ACTIONS.CHILD_NODES, (draft, { nodeId, value }) => {
        if (nodeId && draft[nodeId]) {
          draft[nodeId].nodes = value;
        }
      })
      .addCase(ACTIONS.LOADING, (draft, { nodeId, value }) => {
        if (nodeId && draft[nodeId]) {
          draft[nodeId].loading = value;
        }
      })
      .addCase(ACTIONS.CHECKED, (draft, { nodeId, value }) => {
        if (nodeId && draft[nodeId]) {
          draft[nodeId] = nodeCheckedWithDirty(current(draft[nodeId]), value);
        }
      })
      .addCase(ACTIONS.CHECKED_DIRECTLY, (draft, { nodeId, value }) => {
        if (nodeId && draft[nodeId]) {
          callIfAllowed(oncheck, draft[nodeId].attr.key, value, original(draft));
        }
      })
      .addCase(ACTIONS.ADD_NODES, (draft, { value }) => {
        Object.assign(draft, value);
      })
      .addCase(ACTIONS.EMPTY_TREE, () => ({}))
      .addCase(ACTIONS.CHECK_ALL, (draft, { value }) => {
        Object.keys(draft).forEach((id) => {
          if (id) {
            draft[id] = nodeCheckedWithDirty(current(draft[id]), value);
          }
        });
      })
      .addCase(ACTIONS.SELECT, (draft, { key }) => {
        callIfAllowed(onclick, key);
        selectNode(draft, key);
      })
      .addCase(ACTIONS.SELECT_SILENT, (draft, { key }) => {
        selectNode(draft, key);
      })
      .addCase(ACTIONS.EXPAND, (draft, { key }) => {
        draft[nodeIdFromKey(draft, key)].state.expanded = true;
      })
      .addCase(ACTIONS.EXPAND_ALL, (draft, { value }) => {
        Object.keys(draft).forEach((id) => {
          if (draft[id].state) {
            draft[id].state.expanded = value;
          }
        });
      })
      .addCase(ACTIONS.SCROLL_TO_NODE, (draft, { key }) => {
        const nodeId = nodeIdFromKey(draft, key);
        document.querySelector(`[data-id='${nodeId}']`)?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      });
  });

  return (state = {}, action) => (action.namespace === namespace ? treeReducer(state, action) : state);
};

export default createTreeReducer;
export { createTreeReducer };
