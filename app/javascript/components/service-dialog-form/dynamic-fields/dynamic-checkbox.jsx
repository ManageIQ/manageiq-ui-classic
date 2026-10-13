import PropTypes from 'prop-types';
import { Checkbox } from '@carbon/react';

// Carbon Checkbox.onChange signature: (event, { checked, id })
// default_value is stored as 't' / 'f'.
const DynamicCheckBox = ({ field }) => (
  <Checkbox
    id={`field-${field.name}`}
    labelText={field.label}
    checked={field.default_value === 't'}
    readOnly={field.read_only}
    onChange={() => {}} // display-only in the editor canvas
  />
);

DynamicCheckBox.propTypes = {
  field: PropTypes.shape({
    name: PropTypes.string.isRequired,
    label: PropTypes.string,
    default_value: PropTypes.string,
    read_only: PropTypes.bool,
  }).isRequired,
};

export default DynamicCheckBox;
