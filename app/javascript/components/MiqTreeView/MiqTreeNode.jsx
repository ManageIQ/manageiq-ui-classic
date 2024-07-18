/* eslint-disable import/no-cycle */
import React from 'react';
import PropTypes from 'prop-types';
import MiqTreeParentNode from './MiqTreeParentNode';
import MiqTreeChildNode from './MiqTreeChildNode';

/** A Recursive Functional component to render the Tree and its child nodes. */
const MiqTreeNode = ({
  node, selectedNode, selectKey, onSelect,
}) => {
  const isSelected = (selectedNode && selectedNode.key === node.key) || false;

  return (
    <div key={node.key}>
      <MiqTreeParentNode
        node={node}
        isSelected={isSelected}
        selectKey={selectKey}
        onSelect={(parentItem) => onSelect(parentItem)}
      />
      {
        node.state.expanded && node.nodes && node.nodes.length > 0 && (
          <MiqTreeChildNode
            node={node}
            onSelect={(childItem) => onSelect(childItem)}
            selectedNode={selectedNode}
            selectKey={selectKey}
          />
        )
      }
    </div>
  );
};

export default MiqTreeNode;

MiqTreeNode.propTypes = {
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

MiqTreeNode.defaultProps = {
  selectedNode: undefined,
};
