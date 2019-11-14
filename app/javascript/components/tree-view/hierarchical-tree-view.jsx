/* eslint camelcase: ["warn", {allow: ["bs_tree", "tree_name", "click_url", "check_url", "allow_reselect", "hierarchical_check"]}] */
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Tree, {
  Node,
  defaultStore,
} from '@manageiq/react-ui-components/dist/wooden-tree';
import reducers, { ACTIONS } from './reducers/index';
import { combineReducers } from '../../helpers/redux';

const flatten = data => Tree.convertHierarchicalTree(Tree.initHierarchicalTree(data));

const callBack = (nodeId, type, value, namespace) => ({
  nodeId, type, value, namespace,
});

/**
 * Helper: Sets checkable attribute depending on hideCheckox attribute.
 */
const convertCheckable = tree => tree.map((n) => {
  let node = { ...n };
  if (node.hideCheckbox) {
    node = { ...node, checkable: false };
  }

  if (node.key) {
    node = { ...node, attr: { key: node.key } };
    delete node.key;
  }

  if (node.nodes) {
    node = { ...node, nodes: convertCheckable(node.nodes) };
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

  const namespace = `tree_${tree_name}`;
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
    const tree = convertCheckable(JSON.parse(bs_tree));

    callBack(null, ACTIONS.EMPTY_TREE, null, namespace);
    callBack(null, ACTIONS.ADD_NODES, flatten(tree), namespace);
  }, [bs_tree]);

  const onDataChange = commands => commands.forEach(command => callBack(command.nodeId, command.type, command.value, namespace));

  return (
    <ReduxTree
      class="Tree"
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
      callbacks={{ onDataChange }}
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
