import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'carbon-components-react';

/** Component to render a button in the cell.  */
const MiqStructuredListButton = ({ row: { button: { name, action, disabled } } }) => (
  <div className="cell button_wrapper">
    <Button
      kind="primary"
      title={name}
      // eslint-disable-next-line no-eval
      onClick={() => !disabled && eval(action)}
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
      action: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      disabled: PropTypes.bool.isRequired,
    }),
  }).isRequired,

};
