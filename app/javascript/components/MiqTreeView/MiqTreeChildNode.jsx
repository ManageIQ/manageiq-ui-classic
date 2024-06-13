/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable import/no-cycle */
import React from 'react';
import PropTypes from 'prop-types';
import MiqTreeNode from './MiqTreeNode';

/** A component to render the parent node of the tree. */
const MiqTreeChildNode = ({
  node, onSelect, selectedNode, selectKey,
}) => (
  <div className="tree-row child-tree intend-right" key={node.key}>
    {
      node.nodes.map((item) => (
        <MiqTreeNode
          key={item.key}
          node={item}
          selectedNode={selectedNode}
          selectKey={selectKey}
          onSelect={(childItem) => onSelect(childItem)}
        />
      ))
    }
  </div>
);

export default MiqTreeChildNode;

MiqTreeChildNode.propTypes = {
  node: PropTypes.shape({
    key: PropTypes.string,
    nodes: PropTypes.arrayOf(PropTypes.any),
    state: PropTypes.shape({
      expanded: PropTypes.bool,
    }),
  }).isRequired,
  selectKey: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
  selectedNode: PropTypes.shape({
    key: PropTypes.string,
  }),
};

MiqTreeChildNode.defaultProps = {
  selectedNode: undefined,
};
