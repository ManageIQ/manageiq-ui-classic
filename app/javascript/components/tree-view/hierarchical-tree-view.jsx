/* eslint camelcase: ["warn", {allow: ["bs_tree", "tree_name", "click_url", "check_url", "allow_reselect", "hierarchical_check"]}] */
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Tree, {
  Node,
  defaultStore,
} from '@manageiq/react-ui-components/dist/wooden-tree';
import { http } from '../../http_api';
import { combineReducers } from '../../helpers/redux';
import reducers, { ACTIONS } from './reducers/index';
import './style.scss';

const flatten = data => Tree.convertHierarchicalTree(Tree.initHierarchicalTree(data));

const callBack = (nodeId, type, value, namespace) => ({
  nodeId, type, value, namespace,
});

/**
 * Helper
 * Changes class to className.
 * Sets undefined checkbox to null.
 * Moves the key to attr.key.
 */
const convert = tree => tree.map((n) => {
  let node = { ...n };
  if (node.class) {
    node = { ...node, classes: node.class };
    delete node.class;
  }

  // The server cannot send null, just undefined, this is why it is tested as a string.
  if (node.state.checked === 'undefined') {
    node = { ...node, state: { ...node.state, checked: null } };
  } else if (node.state.checked === null) {
    node = { ...node, state: { ...node.state, checked: false } };
  }

  if (node.key) {
    node = { ...node, attr: { key: node.key } };
    delete node.key;
  }

  if (node.nodes) {
    node = { ...node, nodes: convert(node.nodes) };
  }

  return node;
});

const HierarchicalTreeView = (props) => {
  const {
    tree_name,
    bs_tree,
    check_url,
    click_url,
    oncheck,
    onclick,
    checkboxes,
    allow_reselect,
    hierarchical_check,
    callBack,
  } = props;

  const namespace = tree_name;
  const ConnectedNode = connect((store, ownProps) => ({ ...store[namespace][ownProps.nodeId] }))(Node);
  const ReduxTree = connect(store => ({ data: { ...store[namespace] } }))(Tree);


  /**
   * After the component mounts adds a tree specific reducer to the store
   */
  useEffect(() => {
    // Setting the URLs for the further actions:
    ManageIQ.tree.checkUrl = check_url;
    ManageIQ.tree.clickUrl = click_url;

    ManageIQ.redux.addReducer({
      [namespace]: combineReducers([
        defaultStore,
        reducers(oncheck, onclick),
      ], namespace),
    });
  }, []);

  /**
   * Populates the store from the prop by converting the supplied tree to
   * the correct format and then dispatching it to the store.
   */
  useEffect(() => {
    // FIXME - When the conversion wont be needed hopefuly in the future
    const tree = convert(JSON.parse(bs_tree));

    callBack(null, ACTIONS.EMPTY_TREE, null, namespace);
    callBack(null, ACTIONS.ADD_NODES, flatten(tree), namespace);
  }, [bs_tree]);

  const onDataChange = commands => commands.forEach(command => callBack(command.nodeId, `@@tree/${command.type}`, command.value, namespace));

  /**
   * Lazy load function with a wrapper.
   * The lazy load should return promise but we are preprocessing the data
   * before passing to the component. For the indentitation to work we need to update the nodeId as
   * well, not only the key in the array.
   *
   * FIXME: Remove wrapper after server returning flat trees.
   */
  const lazyLoad = node => new Promise((resolve, reject) => {
    http.post(`/${ManageIQ.controller}/tree_autoload`, {
      id: node.attr.key,
      tree: tree_name,
      mode: 'all',
    }).then((result) => {
      const data = flatten(convert(result));
      let subtree = {};
      Object.keys(data).forEach((key) => {
        if (key !== '') {
          // Creating the node id from the parent id.
          const nodeId = `${node.nodeId}.${key}`;
          // Updating the children ids, so it does not point to something else.
          const element = { ...data[key], nodeId, nodes: data[key].nodes.map(child => `${node.nodeId}.${child}`) };
          subtree = { ...subtree, [nodeId]: element };
        }
      });
      resolve(subtree);
    }).catch(error => reject(error));
  });

  return (
    <ReduxTree
      nodeIcon=""
      expandIcon="fa fa-fw fa-angle-right"
      collapseIcon="fa fa-fw fa-angle-down"
      loadingIcon="fa fa-fw fa-spinner fa-pulse"
      checkedIcon="fa fa-fw fa-check-square-o"
      uncheckedIcon="fa fa-fw fa-square-o"
      selectedIcon=""
      partiallyCheckedIcon="fa fa-fw fa-check-square"
      connectedNode={ConnectedNode}
      checkable={checkboxes}
      showCheckbox={checkboxes}
      allowReselect={allow_reselect}
      callbacks={{ onDataChange, lazyLoad }}
      hierarchicalCheck={hierarchical_check}
      {...props}
    />
  );
};

HierarchicalTreeView.propTypes = {
  tree_name: PropTypes.string.isRequired,
  bs_tree: PropTypes.string.isRequired,
  checkboxes: PropTypes.bool,
  allow_reselect: PropTypes.bool,
  oncheck: PropTypes.string,
  onclick: PropTypes.string,
  check_url: PropTypes.string,
  click_url: PropTypes.string,
  callBack: PropTypes.func.isRequired,
  hierarchical_check: PropTypes.bool,
};

HierarchicalTreeView.defaultProps = {
  checkboxes: false,
  allow_reselect: false,
  oncheck: undefined,
  onclick: undefined,
  check_url: '',
  click_url: '',
  hierarchical_check: false,
};

const HierarchicalTreeViewConn = connect(null, { callBack })(HierarchicalTreeView);

export default HierarchicalTreeViewConn;
