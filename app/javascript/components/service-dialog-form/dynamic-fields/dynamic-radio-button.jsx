import PropTypes from 'prop-types';
import { RadioButtonGroup, RadioButton } from '@carbon/react';
import { getFieldValues } from '../helper';

// values stored as [[value, description], ...]; normalised to [{value, description}].
const DynamicRadioButton = ({ field }) => {
  const items = getFieldValues(field);

  return (
    <RadioButtonGroup
      name={`field-${field.name}`}
      legendText={field.label}
      valueSelected={field.default_value || ''}
      onChange={() => {}} // display-only in the editor canvas
      readOnly={field.read_only}
    >
      {items.map(({ value, description }) => (
        <RadioButton
          key={value}
          id={`field-${field.name}-${value}`}
          labelText={description}
          value={value}
        />
      ))}
    </RadioButtonGroup>
  );
};

DynamicRadioButton.propTypes = {
  field: PropTypes.shape({
    name: PropTypes.string.isRequired,
    label: PropTypes.string,
    default_value: PropTypes.string,
    read_only: PropTypes.bool,
    values: PropTypes.array,
  }).isRequired,
};

export default DynamicRadioButton;
