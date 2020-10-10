import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Tree, ActionTypes } from 'react-wooden-tree';

import { convert } from './helpers';

const TreeViewBase = ({
  actionMapper: overrideActionMapper,
  loadData,
  lazyLoadData,
  isMulti,
  check,
  select,
  ...props
}) => {
  const [nodes, setNodes] = useState([]);

  const actionMapper = {
    [ActionTypes.CHECKED]: Tree.nodeChecked,
    [ActionTypes.CHECKED_DIRECTLY]: Tree.nodeChecked,
    [ActionTypes.DISABLED]: Tree.nodeDisabled,
    [ActionTypes.EXPANDED]: Tree.nodeExpanded,
    [ActionTypes.LOADING]: Tree.nodeLoading,
    [ActionTypes.SELECTED]: Tree.nodeSelected,
    [ActionTypes.CHILD_NODES]: (node, value) => {
      // There's a bug in the react-wooden-tree, the passed value here contains all the child
      // nodes and that would force the tree to mount nested children to the parent node twice.
      // For now we're filtering out the child nodes manually by counting the number of dots in
      // their identifier.
      const min = value.reduce((min, key) => {
        const nl = key.split('.').length;
        return nl > min ? min : nl;
      }, undefined);

      return Tree.nodeChildren(node, value.filter(key => key.split('.').length === min));
    },
    ...overrideActionMapper,
  };

  useEffect(() => {
    loadData().then((values) => {
      setNodes(convert(values, { check, select }));
    });
  }, [loadData]);

  const lazyLoad = node => lazyLoadData(node).then((result) => {
    const data = convert(result, { check, select });

    return Object.keys(data).reduce((subtree, key) => {
      if (key !== '') {
        // Creating the node id from the parent id.
        const nodeId = `${node.nodeId}.${key}`;
        // Updating the children ids, so it does not point to something else.
        const element = { ...data[key], nodeId, nodes: data[key].nodes.map(child => `${node.nodeId}.${child}`) };
        return { ...subtree, [nodeId]: element };
      }

      return subtree;
    }, {});
  });

  const onDataChange = commands => setNodes(commands.reduce(
    (nodes, { type, value, nodeId }) => (
      type === ActionTypes.ADD_NODES
        ? Tree.addNodes(nodes, value)
        : Tree.nodeUpdater(nodes, actionMapper[type](Tree.nodeSelector(nodes, nodeId), value))
    ), nodes,
  ));

  return (
    <Tree
      nodeIcon=""
      expandIcon="fa fa-fw fa-angle-right"
      collapseIcon="fa fa-fw fa-angle-down"
      loadingIcon="fa fa-fw fa-spinner fa-pulse"
      checkedIcon="fa fa-fw fa-check-square-o"
      uncheckedIcon="fa fa-fw fa-square-o"
      selectedIcon=""
      partiallyCheckedIcon="fa fa-fw fa-check-square"
      preventDeselect
      data={nodes}
      showCheckbox={isMulti}
      callbacks={{ onDataChange, lazyLoad }}
      {...props}
    />
  );
};

TreeViewBase.propTypes = {
  actionMapper: PropTypes.any,
  loadData: PropTypes.func.isRequired,
  lazyLoadData: PropTypes.func,
  isMulti: PropTypes.bool,
  check: PropTypes.func,
  select: PropTypes.func,
};

TreeViewBase.defaultProps = {
  actionMapper: {},
  lazyLoadData: () => undefined,
  isMulti: false,
  check: undefined,
  select: undefined,
};

export default TreeViewBase;
