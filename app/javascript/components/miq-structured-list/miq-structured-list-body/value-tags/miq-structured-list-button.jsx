import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'carbon-components-react';
import { customOnClickHandler } from '../../../../helpers/custom-click-handler';

/** Component to render a button in the cell.  */
const MiqStructuredListButton = ({ row: { button: { name, action, disabled } } }) => (
  <div className="cell button_wrapper">
    <Button
      kind="primary"
      title={name}
      onClick={() => !disabled && customOnClickHandler(action)}
      disabled={disabled}
    >
      {name}
    </Button>
  </div>
);

export default MiqStructuredListButton;

MiqStructuredListButton.propTypes = {
  row: PropTypes.shape({
    button: PropTypes.shape({
      action: PropTypes.shape({
        recordId: PropTypes.number,
      }).isRequired,
      name: PropTypes.string.isRequired,
      disabled: PropTypes.bool.isRequired,
    }),
  }).isRequired,

};
