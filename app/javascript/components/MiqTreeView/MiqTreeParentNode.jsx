/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { CaretRight16, CaretDown16, CheckmarkFilled16 } from '@carbon/icons-react';
import { selectableItem } from './helper';

/** A component to render the parent node of the tree. */
const MiqTreeParentNode = ({
  node, selectKey, isSelected, onSelect,
}) => {
  /** Function to render the down and right caret. */
  const renderCaret = (item) => {
    if (!item) {
      return undefined;
    }
    if (selectableItem(item, selectKey) || !item.lazyLoad) {
      return undefined;
    }
    return item.state.expanded ? <CaretDown16 className="tree-caret" /> : <CaretRight16 className="tree-caret" />;
  };

  return (
    <div className={classNames('tree-row parent-tree', isSelected && 'selected-node')} onClick={() => onSelect(node)}>
      {renderCaret(node)}
      <div className="tree-icon"><i className={node.icon} /></div>
      <div className="tree-text">{node.text}</div>
      {isSelected && <CheckmarkFilled16 className="selected-node-check" />}
    </div>
  );
};

export default MiqTreeParentNode;

MiqTreeParentNode.propTypes = {
  node: PropTypes.shape({
    icon: PropTypes.string,
    text: PropTypes.string,
    key: PropTypes.string,
    nodes: PropTypes.arrayOf(PropTypes.any),
    state: PropTypes.shape({
      expanded: PropTypes.bool,
    }),
  }).isRequired,
  selectKey: PropTypes.string.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
};
