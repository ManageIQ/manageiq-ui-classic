import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'carbon-components-react';
import { customOnClickHandler } from '../../../../helpers/custom-click-handler';

/** Component to render a button in the cell.  */
const MiqStructuredListButton = ({
  row: {
    button: {
      name, action, href, target, rel, size, disabled,
    },
  },
}) => (
  <div className="cell button_wrapper">
    <Button
      kind="primary"
      title={name}
      href={href || null}
      target={target || ''}
      rel={rel || ''}
      size={size || 'default'}
      onClick={() => (action ? (!disabled && customOnClickHandler(action)) : '')}
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
      }),
      name: PropTypes.string.isRequired,
      href: PropTypes.string,
      target: PropTypes.string,
      rel: PropTypes.string,
      size: PropTypes.string,
      disabled: PropTypes.bool.isRequired,
    }),
  }).isRequired,

};
