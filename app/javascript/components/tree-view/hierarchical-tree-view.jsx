/* eslint camelcase: ["warn", {allow: ["bs_tree", "tree_name", "click_url", "check_url", "allow_reselect", "hierarchical_check"]}] */
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Tree, {
  Node,
  defaultStore,
  callBack,
  ActionTypes,
} from '@manageiq/react-ui-components/dist/wooden-tree';

const flatten = data => Tree.convertHierarchicalTree(Tree.initHierarchicalTree(data));

const HierarchicalTreeView = (props) => {
  const {
    tree_name,
    bs_tree,
    check_url,
    oncheck,
    checkboxes,
    allow_reselect,
    hierarchical_check,
    callBack,
  } = props;

  const storeName = `tree_${tree_name}`;
  const ConnectedNode = connect((store, ownProps) => ({ ...store[storeName][ownProps.nodeId] }))(Node);
  const ReduxTree = connect(store => ({ data: { ...store[storeName] } }))(Tree);

  /**
   * After the component mounts adds a tree specific reducer to the store
   */
  useEffect(() => {
    ManageIQ.redux.addReducer({ [storeName]: defaultStore });
  }, []);

  /**
   * Populates the store from the prop by converting the supplied tree to
   * the correct format and then dispatching it to the store.
   */
  useEffect(() => {
    const tree = JSON.parse(bs_tree);

    callBack('', ActionTypes.ADD_NODES, flatten(tree));
  }, [bs_tree]);

  const onDataChange = (commands) => {
    commands.forEach((command) => {
      callBack(command.nodeId, command.type, command.value);

      // On checkbox change call the supplied function with the node, if there is one.
      if (command.type === ActionTypes.CHECKED && oncheck) {
        const node = Tree.nodeSelector(ManageIQ.redux.store.getState()[storeName], command.nodeId);
        ManageIQ.tree.checkUrl = check_url;
        window[oncheck]({ ...node, state: { ...node.state, checked: command.value } });
      }
    });
  };

  return (
    <ReduxTree
      class="Tree"
      nodeIcon=""
      expandIcon="fa fa-fw fa-angle-right"
      collapseIcon="fa fa-fw fa-angle-down"
      loadingIcon="fa fa-fw fa-spinner fa-pulse"
      checkedIcon="fa fa-fw fa-check-square-o"
      uncheckedIcon="fa fa-fw fa-square-o"
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
  check_url: PropTypes.string,
  callBack: PropTypes.func.isRequired,
  hierarchical_check: PropTypes.bool,
};

HierarchicalTreeView.defaultProps = {
  checkboxes: false,
  allow_reselect: false,
  oncheck: undefined,
  check_url: '',
  hierarchical_check: true,
};

const HierarchicalTreeViewConn = connect(null, { callBack })(HierarchicalTreeView);

export default HierarchicalTreeViewConn;
