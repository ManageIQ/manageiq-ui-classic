import React from 'react';
import PropTypes from 'prop-types';
import { StructuredListCell } from 'carbon-components-react';
import MiqStructuredListConditionalTag from '../value-tags/miq-structured-list-conditional-tag';

/** Component to render additional columns */
const MiqStructuredListSub = ({ row: { sub_items }, onClick, clickEvents }) => (
  (
    sub_items.map((item, index) => (
      <StructuredListCell className="content_value sub_items" key={index.toString()}>
        <MiqStructuredListConditionalTag row={item} onClick={onClick} clickEvents={clickEvents} />
      </StructuredListCell>
    ))
  )
);

export default MiqStructuredListSub;

MiqStructuredListSub.propTypes = {
  row: PropTypes.shape({
    sub_items: PropTypes.arrayOf(PropTypes.any).isRequired,
  }).isRequired,
  clickEvents: PropTypes.bool.isRequired,
  onClick: PropTypes.func,
};

MiqStructuredListSub.defaultProps = {
  onClick: undefined,
};
