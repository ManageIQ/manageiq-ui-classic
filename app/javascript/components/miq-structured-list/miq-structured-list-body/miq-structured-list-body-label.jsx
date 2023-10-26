import React from 'react';
import PropTypes from 'prop-types';
import { StructuredListCell } from 'carbon-components-react';

/** Component to render the label (left hand side of list) */
const MiqStructuredListBodyLabel = ({ label }) => (
  <StructuredListCell className="label_header">
    {label}
  </StructuredListCell>
);

export default MiqStructuredListBodyLabel;

MiqStructuredListBodyLabel.propTypes = {
  label: PropTypes.string.isRequired,
};
