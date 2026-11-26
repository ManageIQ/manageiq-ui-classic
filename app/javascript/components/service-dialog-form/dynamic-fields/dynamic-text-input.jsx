import PropTypes from 'prop-types';
import { TextInput } from '@carbon/react';

const DynamicTextInput = ({ field }) => (
  <TextInput
    id={`field-${field.name}`}
    labelText={field.label}
    value={field.default_value || ''}
    readOnly={field.read_only}
    type={field.options && field.options.protected ? 'password' : 'text'}
    onChange={() => {}} // display-only in the editor canvas
  />
);

DynamicTextInput.propTypes = {
  field: PropTypes.shape({
    name: PropTypes.string.isRequired,
    label: PropTypes.string,
    default_value: PropTypes.string,
    read_only: PropTypes.bool,
    options: PropTypes.shape({ protected: PropTypes.bool }),
  }).isRequired,
};

export default DynamicTextInput;
