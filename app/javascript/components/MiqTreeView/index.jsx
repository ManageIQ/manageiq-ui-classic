import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Loading } from 'carbon-components-react';
import MiqTreeNode from './MiqTreeNode';
import { TREE_CONFIG, selectableItem, findNodeByKey } from './helper';
import './style.scss';

const MiqTree = ({ type, onNodeSelect }) => {
  const treeType = TREE_CONFIG[type];

  const [data, setData] = useState({
    list: undefined,
    isLoading: true,
    selectedNode: undefined,
  });

  /** Function to update the data. */
  const updateData = (others) => {
    setData({
      ...data,
      ...others,
    });
  };

  /** A request is made to fetch the initial data during component load. */
  useEffect(() => {
    http.get(treeType.url)
      .then((response) => updateData({ list: response, isLoading: false }));
  }, []);

  useEffect(() => {
    onNodeSelect(data.selectedNode);
  }, [data.selectedNode]);

  /** Function to select a node from tree. This triggers the useEffect. */
  const selectNode = (node) => {
    const selectedNode = (data.selectedNode && data.selectedNode.key === node.key) ? undefined : node;
    updateData({ selectedNode });
  };

  /** Function to handle show the children of a node
   * if child nodes are available, just expand the tree.
   * else, request an API to fetch the child nodes and update the results.
   */
  const expandTree = (item, node) => {
    if (item.nodes && item.nodes.length > 0) {
      item.state.expanded = true;
      updateData({ list: [...data.list] });
    } else {
      http.get(`${treeType.url}?id=${node.key}`)
        .then((response) => {
          item.nodes = response;
          item.state.expanded = true;
          updateData({ list: [...data.list] });
        });
    }
  };

  /** Function to collapse the tree to hide the children */
  const collapseTree = (item) => {
    item.state.expanded = false;
    updateData({ list: [...data.list] });
  };

  /** Function to expand/collapse the tree. */
  const toggleTree = (node) => {
    const item = findNodeByKey(data.list, node.key);
    if (item) {
      if (node.state.expanded) {
        collapseTree(item);
      } else {
        expandTree(item, node);
      }
    }
  };

  /** Function to handle the click events of tree node. */
  const loadSelectedNode = (node) => (selectableItem(node, treeType.selectKey)
    ? selectNode(node)
    : toggleTree(node));

  /** Function to render the tree contents. */
  const renderTree = (list) => (list && list.map((child) => (
    <MiqTreeNode
      key={child.key}
      node={child}
      selectedNode={data.selectedNode}
      selectKey={treeType.selectKey}
      onSelect={(node) => loadSelectedNode(node)}
    />
  )));

  /** Function to render the modal contents. */
  const renderTreeContent = () => ((data.list && data.list.length > 0) ? renderTree(data.list) : undefined);

  return (
    <div>
      {
        data.isLoading
          ? <Loading active small withOverlay={false} className="loading" />
          : renderTreeContent()
      }
    </div>
  );
};

export default MiqTree;

MiqTree.propTypes = {
  type: PropTypes.string.isRequired,
  onNodeSelect: PropTypes.func.isRequired,
};
