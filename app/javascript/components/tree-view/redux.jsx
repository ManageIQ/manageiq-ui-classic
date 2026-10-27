/* eslint camelcase: ["warn", {allow: ["bs_tree", "tree_name", "click_url", "check_url", "allow_reselect", "hierarchical_check", "silent_activate", "select_node"]}] */
import { useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

import { useMiqSelector, useMiqDispatch } from '../../redux/miq-hooks';
import { http } from '../../http_api';
import { ACTIONS, createTreeReducer } from './reducers/index';
import {
  convert, activateNode, nodeSelector, getAncestors, getDescendants,
} from './helpers';
import BaseCheckboxTree, { treeIcons } from './base_checkbox_tree';
import { nodeCheckedWithDirty } from './reducers/helpers';

const icons = {
  uncheck: (
    <span>
      <span className="unchecked-icon">{treeIcons.uncheck}</span>
      <span className="partial-checked-icon">{treeIcons.halfCheck}</span>
    </span>
  ),
};

const nodeIcon = ({
  loading, image, icon, iconColor, iconBackground,
}) => {
  if (loading) {
    return <i className="icon fa fa-spinner fa-pulse" />;
  }
  if (loading === null) {
    return <i className="icon fa fa-exclamation-circle" />;
  }
  if (image) {
    return <img className="icon image" src={image} alt="" />;
  }
  if (icon) {
    return <i className={`icon ${icon}`} style={{ color: iconColor, backgroundColor: iconBackground }} />;
  }
  return null;
};

/** Converts the flat map stored in redux to the nested structure of `react-checkbox-tree`. */
const toCheckboxTreeNodes = (store, checkboxes) => {
  const convertNode = (nodeId) => {
    const node = store[nodeId];
    const { state } = node;
    const children = (node.nodes || []).filter((id) => store[id]).map(convertNode);
    const className = [
      node.classes,
      Object.hasOwnProperty.call(state, 'defaultChecked') && state.checked !== state.defaultChecked && 'changed-checkbox',
      state.selected && 'selected',
      state.checked === null && 'partial-checked',
    ].filter(Boolean).join(' ');

    return {
      value: nodeId,
      // eslint-disable-next-line react/no-danger
      label: <span data-id={nodeId} dangerouslySetInnerHTML={{ __html: node.text }} />,
      icon: nodeIcon(node),
      className,
      title: node.tooltip,
      showCheckbox: checkboxes && !node.hideCheckbox,
      disabled: node.checkable === false || !!state.disabled,
      // An empty array keeps the expand button of the not yet loaded (lazy) nodes.
      ...((children.length > 0 || node.lazyLoad) && { children }),
    };
  };

  return ((store[''] && store[''].nodes) || []).filter((id) => store[id]).map(convertNode);
};

/** Renders the tree stored in the redux store with `react-checkbox-tree`. */
const ReduxTree = ({ namespace, checkboxes, handlers }) => {
  const store = useMiqSelector((state) => state[namespace]);
  const nodes = useMemo(() => toCheckboxTreeNodes(store || {}, checkboxes), [store, checkboxes]);
  const checked = Object.keys(store || {}).filter((id) => id !== '' && store[id].state.checked === true);
  const expanded = Object.keys(store || {}).filter((id) => id !== '' && store[id].state.expanded);

  const onClick = ({ value }) => {
    const node = store[value];
    if (node.selectable !== false && !node.state.disabled) {
      handlers.select(value, !node.state.selected);
    } else {
      handlers.toggle(value);
    }
  };

  return (
    <div className="react-tree-view">
      <BaseCheckboxTree
        noCascade
        showNodeIcon
        nodes={nodes}
        checked={checked}
        expanded={expanded}
        icons={icons}
        onClick={onClick}
        onCheck={(_checked, { value, checked: isChecked }) => handlers.check(value, isChecked)}
        onExpand={(_expanded, { value }) => handlers.toggle(value)}
      />
    </div>
  );
};

ReduxTree.propTypes = {
  namespace: PropTypes.string.isRequired,
  checkboxes: PropTypes.bool.isRequired,
  handlers: PropTypes.shape({
    toggle: PropTypes.func.isRequired,
    select: PropTypes.func.isRequired,
    check: PropTypes.func.isRequired,
  }).isRequired,
};

/**
 * Value of a parent checkbox after one of its children changed to `value`:
 * partial unless all the other children have the same value.
 */
const parentCheckboxState = (state, childIds, changedId, value) => {
  if (value === null) {
    return null;
  }
  const mixed = childIds.some((id) => id !== changedId && state[id].state.checked !== value);
  return mixed ? null : value;
};

const TreeView = ({
  tree_name,
  bs_tree,
  check_url = '',
  click_url = '',
  oncheck = '',
  onclick = '',
  checkboxes = false,
  hierarchical_check = false,
  silent_activate = false,
  select_node = '',
}) => {
  const namespace = tree_name;
  const dispatch = useMiqDispatch();
  const store = useMiqSelector((state) => state[namespace]) || {};

  const addTreeReducer = () => ManageIQ.redux.addReducer({
    [namespace]: createTreeReducer(namespace, oncheck, onclick),
  });

  const getData = useCallback(() => {
    // FIXME: This check if the reducer exists is not ideal, but it is needed
    // when the tree is rerendered without page change (Edit Report Menu's).
    // When fixed the useEffect should remove the created reducer on unmount.
    if (!ManageIQ.redux.store.getState()[namespace]) {
      addTreeReducer();
    }
  }, []);

  /**
   * After the component mounts adds a tree specific reducer to the store
   */
  useEffect(() => {
    // Setting the URLs for the further actions:
    ManageIQ.tree.checkUrl = check_url;
    ManageIQ.tree.clickUrl = click_url;
    getData();
  }, []);

  /**
   * Populates the store from the prop by converting the supplied tree to
   * the correct format and then dispatching it to the store.
   */
  useEffect(() => {
    // FIXME - When the conversion wont be needed hopefuly in the future
    const tree = activateNode(convert(JSON.parse(bs_tree), (node) => node.state.checked,
      (node) => node.state.selected), silent_activate, select_node);

    dispatch({ type: ACTIONS.EMPTY_TREE, namespace });
    dispatch({ type: ACTIONS.ADD_NODES, value: tree, namespace });
  }, [bs_tree]);

  const onDataChange = (commands) => {
    ManageIQ.tree.checkUrl = check_url;
    ManageIQ.tree.clickUrl = click_url;
    const tree = activateNode(convert(JSON.parse(bs_tree), (node) => node.state.checked, (node) =>
      node.state.selected), silent_activate, select_node);

    commands.forEach((command) => {
      let node;
      if (command.type === 'state.checked') {
        node = nodeSelector(tree, command.nodeId);
        const selectedNode = nodeCheckedWithDirty(node, command.value);
        if (selectedNode.classes === 'dirty') {
          addTreeReducer();
          sendDataWithRx({ name: 'dirty' });
        } else {
          getData();
          sendDataWithRx({ name: 'notdirty' });
        }
      }

      dispatch({
        type: `@@tree/${command.type}`, nodeId: command.nodeId, value: command.value, namespace,
      });
    });
  };

  /**
   * Lazy load function with a wrapper.
   * The lazy load should return promise but we are preprocessing the data
   * before passing to the component. For the indentitation to work we need to update the nodeId as
   * well, not only the key in the array.
   *
   * FIXME: Remove wrapper after server returning flat trees.
   */
  const lazyLoad = (node) => new Promise((resolve, reject) => {
    http.post(`/${ManageIQ.controller}/tree_autoload`, {
      id: node.attr.key,
      tree: tree_name,
      mode: 'all',
    }).then((result) => {
      const data = convert(result);
      let subtree = {};
      Object.keys(data).forEach((key) => {
        if (key !== '') {
          // Creating the node id from the parent id.
          const nodeId = `${node.nodeId}.${key}`;
          // Updating the children ids, so it does not point to something else.
          const element = { ...data[key], nodeId, nodes: data[key].nodes.map((child) => `${node.nodeId}.${child}`) };
          subtree = { ...subtree, [nodeId]: element };
        }
      });
      resolve(subtree);
    }).catch((error) => reject(error));
  });

  const loadChildren = (node) => {
    const { nodeId } = node;
    onDataChange([{ nodeId, type: 'loading', value: true }]);
    lazyLoad(node).then((subtree) => {
      const prefix = `${nodeId}.`;
      const children = Object.keys(subtree).filter((key) => key.startsWith(prefix) && !key.slice(prefix.length).includes('.'));
      onDataChange([
        { nodeId, type: 'add.nodes', value: subtree },
        { nodeId, type: 'child_nodes', value: children },
        { nodeId, type: 'loading', value: false },
        { nodeId, type: 'state.expanded', value: true },
      ]);
    }).catch(() => onDataChange([{ nodeId, type: 'loading', value: null }]));
  };

  const handlers = {
    toggle: (nodeId) => {
      const node = store[nodeId];
      if (node.lazyLoad && (node.nodes || []).length < 1) {
        loadChildren(node);
      } else {
        onDataChange([{ nodeId, type: 'state.expanded', value: !node.state.expanded }]);
      }
    },

    select: (nodeId, value) => {
      const state = store;
      const commands = [];
      if (value) {
        const previous = Object.keys(state).find((id) => id !== nodeId && state[id].state && state[id].state.selected);
        if (previous !== undefined) {
          commands.push({ nodeId: previous, type: 'state.selected', value: false });
        }
      }
      commands.push({ nodeId, type: 'state.selected', value });
      onDataChange(commands);
    },

    check: (nodeId, value) => {
      const state = store;
      const commands = [
        { nodeId, type: 'state.checked_directly', value },
        { nodeId, type: 'state.checked', value },
      ];

      if (hierarchical_check) {
        let childId = nodeId;
        let childValue = value;
        getAncestors(nodeId).reverse().forEach((parentId) => {
          const parent = state[parentId];
          const newValue = parentCheckboxState(state, parent.nodes, childId, childValue);
          if (newValue !== parent.state.checked && parent.checkable !== false) {
            commands.push({ nodeId: parentId, type: 'state.checked', value: newValue });
          }
          childId = parentId;
          childValue = newValue;
        });

        getDescendants(state, nodeId).forEach((id) => {
          if (state[id].state.checked !== value && state[id].checkable !== false) {
            commands.push({ nodeId: id, type: 'state.checked', value });
          }
        });
      }

      onDataChange(commands);
    },
  };

  return <ReduxTree namespace={namespace} checkboxes={checkboxes} handlers={handlers} />;
};

TreeView.propTypes = {
  tree_name: PropTypes.string.isRequired,
  bs_tree: PropTypes.string.isRequired,
  checkboxes: PropTypes.bool,
  oncheck: PropTypes.string,
  onclick: PropTypes.string,
  check_url: PropTypes.string,
  click_url: PropTypes.string,
  hierarchical_check: PropTypes.bool,
  silent_activate: PropTypes.bool,
  select_node: PropTypes.string,
};

export default TreeView;
