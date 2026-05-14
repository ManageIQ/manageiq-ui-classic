import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from '@carbon/react';
import { useFieldApi } from '@@ddf';

const SelectWithIcons = ({
  label,
  options,
  placeholder,
  includeEmpty,
  isRequired,
  ...props
}) => {
  const { input, meta } = useFieldApi(props);

  // Transform options to Carbon Dropdown format
  // Use empty string for placeholder value to ensure it's properly handled
  const items = includeEmpty
    ? [{ label: placeholder, value: '' }, ...options]
    : options;

  // Custom renderer for dropdown items with icons
  const itemToElement = (item) => {
    if (!item) return '';

    const icon = item['data-icon'];
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {icon && <i className={icon} />}
        <span>{item.label}</span>
      </span>
    );
  };

  const selectedItem = items.find((item) => {
    if (input.value === undefined || input.value === null || input.value === '') {
      return item.value === '';
    }
    return item.value === input.value;
  }) || null;

  return (
    <Dropdown
      id={props.id || props.name}
      titleText={label}
      label={placeholder}
      items={items}
      itemToElement={itemToElement}
      itemToString={(item) => (item ? item.label : '')}
      selectedItem={selectedItem}
      onChange={({ selectedItem: newItem }) => {
        const newValue = newItem?.value === '' ? undefined : newItem?.value;
        if (newValue !== input.value) {
          input.onChange(newValue);
        }
      }}
      invalid={meta.touched && meta.error}
      invalidText={meta.error}
      warn={meta.touched && meta.warning}
      warnText={meta.warning}
    />
  );
};

SelectWithIcons.propTypes = {
  label: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    'data-icon': PropTypes.string,
  })),
  placeholder: PropTypes.string,
  includeEmpty: PropTypes.bool,
  isRequired: PropTypes.bool,
  id: PropTypes.string,
  name: PropTypes.string,
};

SelectWithIcons.defaultProps = {
  label: undefined,
  options: [],
  placeholder: `<${__('Choose')}>`,
  includeEmpty: false,
  isRequired: false,
  id: undefined,
  name: undefined,
};

export default SelectWithIcons;
