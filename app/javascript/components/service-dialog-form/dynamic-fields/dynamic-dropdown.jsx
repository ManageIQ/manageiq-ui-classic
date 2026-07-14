import PropTypes from 'prop-types';
import { Dropdown, MultiSelect } from '@carbon/react';
import { getFieldValues } from '../helper';

// values are stored as [[value, description], ...] (wire format, A1).
// getFieldValues normalises to [{value, description}] for the Carbon items list.
const DynamicDropdown = ({ field }) => {
  const items = getFieldValues(field);
  const isMulti = field.options && field.options.force_multi_value;

  if (isMulti) {
    const initialSelectedItems = items.filter((item) => {
      const selected = Array.isArray(field.default_value)
        ? field.default_value
        : [field.default_value];
      return selected.includes(item.value);
    });

    return (
      <MultiSelect
        id={`field-${field.name}`}
        titleText={field.label}
        label={__('Select...')}
        items={items}
        itemToString={(item) => (item ? item.description : '')}
        initialSelectedItems={initialSelectedItems}
        readOnly={field.read_only}
        onChange={() => {}} // display-only in the editor canvas
      />
    );
  }

  const selectedItem = items.find((i) => i.value === field.default_value) || null;

  return (
    <Dropdown
      id={`field-${field.name}`}
      titleText={field.label}
      label={__('Select...')}
      items={items}
      itemToString={(item) => (item ? item.description : '')}
      selectedItem={selectedItem}
      readOnly={field.read_only}
      onChange={() => {}} // display-only in the editor canvas
    />
  );
};

DynamicDropdown.propTypes = {
  field: PropTypes.shape({
    name: PropTypes.string.isRequired,
    label: PropTypes.string,
    default_value: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    read_only: PropTypes.bool,
    values: PropTypes.array,
    options: PropTypes.shape({ force_multi_value: PropTypes.bool }),
  }).isRequired,
};

export default DynamicDropdown;
