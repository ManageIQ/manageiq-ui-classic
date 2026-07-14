import PropTypes from 'prop-types';
import { DatePicker, DatePickerInput } from '@carbon/react';

const DynamicDatePicker = ({ field }) => (
  <DatePicker
    datePickerType="single"
    value={field.default_value || ''}
    readOnly={field.read_only}
    onChange={() => {}} // display-only in the editor canvas
  >
    <DatePickerInput
      id={`field-${field.name}`}
      labelText={field.label}
      placeholder="mm/dd/yyyy"
    />
  </DatePicker>
);

DynamicDatePicker.propTypes = {
  field: PropTypes.shape({
    name: PropTypes.string.isRequired,
    label: PropTypes.string,
    default_value: PropTypes.string,
    read_only: PropTypes.bool,
  }).isRequired,
};

export default DynamicDatePicker;
