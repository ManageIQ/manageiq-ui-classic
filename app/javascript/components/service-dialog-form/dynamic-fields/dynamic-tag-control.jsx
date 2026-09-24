import PropTypes from 'prop-types';
import { Select, SelectItem } from '@carbon/react';

// TagControl renders a Select showing the category's children (values).
// values are populated from the API and stored as [[value, description], ...].
const DynamicTagControl = ({ field }) => {
  const items = Array.isArray(field.values)
    ? field.values.map((v) => (Array.isArray(v) ? { value: v[0], description: v[1] } : v))
    : [];

  return (
    <Select
      id={`field-${field.name}`}
      labelText={field.label}
      value={field.default_value || ''}
      readOnly={field.read_only}
      onChange={() => {}} // display-only in the editor canvas
    >
      <SelectItem value="" text={__('Choose a tag...')} />
      {items.map(({ value, description }) => (
        <SelectItem key={value} value={value} text={description} />
      ))}
    </Select>
  );
};

DynamicTagControl.propTypes = {
  field: PropTypes.shape({
    name: PropTypes.string.isRequired,
    label: PropTypes.string,
    default_value: PropTypes.string,
    read_only: PropTypes.bool,
    values: PropTypes.array,
  }).isRequired,
};

export default DynamicTagControl;
