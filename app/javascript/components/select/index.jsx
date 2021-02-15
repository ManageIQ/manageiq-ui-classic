import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { components } from '@data-driven-forms/carbon-component-mapper';

import { useFieldApi } from '@@ddf';

const SelectWithOnChange = ({
  includeEmpty,
  loadOptions: _loadOptions,
  onChange,
  placeholder,
  ...props
}) => {
  if (onChange) {
    const { input: { value } } = useFieldApi(props);

    useEffect(() => {
      if (!props.isDisabled && value) {
        onChange(value);
      }
    }, [value]);
  }

  // Add a dummy placeholder field to the list of the dynamically loaded options
  const loadOptions = includeEmpty !== true ? _loadOptions : ((...args) => _loadOptions(...args).then((items) => [
    {
      label: placeholder,
      value: undefined,
    },
    ...items,
  ]));

  return <components.Select placeholder={placeholder} loadOptions={loadOptions} {...props} />;
};

SelectWithOnChange.propTypes = {
  includeEmpty: PropTypes.bool,
  isDisabled: PropTypes.bool,
  loadOptions: PropTypes.func,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
};

SelectWithOnChange.defaultProps = {
  includeEmpty: undefined,
  isDisabled: undefined,
  loadOptions: undefined,
  onChange: undefined,
  placeholder: `<${__('Choose')}>`,
};

export default SelectWithOnChange;
