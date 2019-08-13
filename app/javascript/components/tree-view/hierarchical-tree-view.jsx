/* eslint camelcase: ["warn", {allow: ["bs_tree", "tree_name", "click_url", "check_url", "allow_reselect"]}] */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Tree, { ActionTypes } from '@manageiq/react-ui-components/dist/wooden-tree';

const convertData = data => Tree.convertHierarchicalTree(Tree.initHierarchicalTree(JSON.parse(data)));

const HierarchicalTreeView = (props) => {
  const {
    bs_tree, check_url, oncheck, checkboxes, allow_reselect,
  } = props;
  const [tree, setTree] = useState(convertData(bs_tree));

  const checked = (node, value) => {
    const newNode = { ...node, state: { ...node.state, checked: value } };
    if (oncheck) {
      ManageIQ.tree.checkUrl = check_url;
      window[oncheck](newNode);
    }
    return newNode;
  };

  const actionMapper = {
    [ActionTypes.EXPANDED]: Tree.nodeExpanded,
    [ActionTypes.CHECKED]: checked,
    [ActionTypes.DISABLED]: Tree.nodeDisabled,
    [ActionTypes.SELECTED]: Tree.nodeSelected,
    [ActionTypes.CHILD_NODES]: Tree.nodeChildren,
    [ActionTypes.LOADING]: Tree.nodeLoading,
  };

  const onDataChange = (commands) => {
    let NewTree = { ...tree };
    commands.forEach((command) => {
      NewTree = (command.type === ActionTypes.ADD_NODES)
        ? Tree.addNodes(NewTree, command.value)
        : Tree.nodeUpdater(NewTree, actionMapper[command.type](Tree.nodeSelector(NewTree, command.nodeId), command.value));
    });
    setTree(NewTree);
  };

  return (
    <Tree
      data={tree}
      expandIcon="fa fa-fw fa-angle-right"
      collapseIcon="fa fa-fw fa-angle-down"
      loadingIcon="fa fa-fw fa-spinner fa-pulse"
      checkedIcon="fa fa-fw fa-check-square-o"
      uncheckedIcon="fa fa-fw fa-square-o"
      partiallyCheckedIcon="fa fa-fw fa-check-square"
      checkable={checkboxes}
      showCheckbox={checkboxes}
      allowReselect={allow_reselect}
      callbacks={{ onDataChange }}
      {...props}
    />
  );
};

HierarchicalTreeView.propTypes = {
  bs_tree: PropTypes.string.isRequired,
  checkboxes: PropTypes.bool,
  allow_reselect: PropTypes.bool,
  oncheck: PropTypes.string,
  check_url: PropTypes.string,
};

HierarchicalTreeView.defaultProps = {
  checkboxes: false,
  allow_reselect: false,
  oncheck: undefined,
  check_url: '',
};

export default HierarchicalTreeView;
