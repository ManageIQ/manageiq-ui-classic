import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { StructuredListCell } from 'carbon-components-react';
import MiqStructuredListConditionalTag from '../value-tags/miq-structured-list-conditional-tag';

/** Usage eg: Automation / Embeded Automate / Generic Objects / item
  * Properties has no links & Relationships have links */
const MiqStructuredListObject = ({ row, clickEvents, onClick }) => (
  <StructuredListCell
    className={classNames(row.label ? 'content_value' : 'label_header', 'object_item')}
    title={row && row.title !== undefined ? row.title : ''}
  >
    <MiqStructuredListConditionalTag row={row} onClick={onClick} clickEvents={clickEvents} />
  </StructuredListCell>
);

export default MiqStructuredListObject;

MiqStructuredListObject.propTypes = {
  row: PropTypes.shape({
    label: PropTypes.string,
    title: PropTypes.string,
  }),
  clickEvents: PropTypes.bool.isRequired,
  onClick: PropTypes.func,
};

MiqStructuredListObject.defaultProps = {
  row: undefined,
  onClick: undefined,
};
