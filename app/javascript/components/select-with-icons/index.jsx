import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from '@carbon/react';
import { useFieldApi } from '@@ddf';

/**
 * SelectWithIcons - A dropdown component that displays icons alongside option labels
 *
 * This component extends Carbon's Dropdown to render custom icons for each option.
 * It integrates with Data Driven Forms (DDF) and is designed for use in form schemas.
 *
 * @component
 * @example
 * // Usage in a Data Driven Forms schema:
 * {
 *   component: 'select-with-icons',
 *   name: 'datatype',
 *   label: 'Data Type',
 *   options: [
 *     { label: 'String', value: 'string', 'data-icon': 'fa fa-font' },
 *     { label: 'Integer', value: 'integer', 'data-icon': 'fa fa-hashtag' },
 *     { label: 'Boolean', value: 'boolean', 'data-icon': 'fa fa-check-square' }
 *   ],
 *   placeholder: '<Choose>',
 *   includeEmpty: true,
 *   isRequired: false
 * }
 *
 * @example
 * // Options can also be provided in array format (from backend):
 * // [['Display Text', 'value', { 'data-icon': 'fa fa-icon' }], ...]
 * // These are transformed to the object format by transformSelectOptions helper
 *
 * @param {Object} props - Component props
 * @param {string} [props.label] - Label text displayed above the dropdown
 * @param {Array<Object>} [props.options=[]] - Array of option objects
 * @param {string} props.options[].label - Display text for the option
 * @param {string|number} props.options[].value - Value for the option
 * @param {string} [props.options[].'data-icon'] - CSS class for the icon (e.g., 'fa fa-icon')
 * @param {string} [props.placeholder='<Choose>'] - Placeholder text shown when no selection
 * @param {boolean} [props.includeEmpty=false] - Whether to include a placeholder option
 * @param {boolean} [props.isRequired=false] - Whether the field is required
 * @param {string} [props.id] - HTML id attribute (defaults to name if not provided)
 * @param {string} [props.name] - Field name for form submission
 *
 * @returns {React.Component} A Carbon Dropdown with icon support
 *
 */
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
