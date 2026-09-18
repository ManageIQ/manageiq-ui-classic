import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { components } from '@data-driven-forms/carbon-component-mapper';

import { useFieldApi } from '@@ddf';

const SelectWithOnChange = ({
  includeEmpty = false,
  loadOptions: _loadOptions = null,
  options: _options = [],
  onChange = null,
  placeholder = `<${__('Choose')}>`,
  ...props
}) => {
  const { input: { value } } = useFieldApi(props);

  useEffect(() => {
    if (onChange && !props.isDisabled && value) {
      onChange(value);
    }
  }, [value]);

  // Add a dummy placeholder field to the list of the static options
  if (!_loadOptions) {
    const options = includeEmpty !== true ? _options : [
      {
        label: placeholder,
        value: '',
      },
      ..._options,
    ];

    return <components.Select placeholder={placeholder} options={options} {...props} />;
  }

  // Add a dummy placeholder field to the list of the dynamically loaded options
  const loadOptions = includeEmpty !== true ? _loadOptions : (...args) => _loadOptions(...args).then((items) => [
    {
      label: placeholder,
      value: '',
    },
    ...items,
  ]);

  return <components.Select placeholder={placeholder} loadOptions={loadOptions} {...props} />;
};

SelectWithOnChange.propTypes = {
  includeEmpty: PropTypes.bool,
  isDisabled: PropTypes.bool,
  loadOptions: PropTypes.func,
  options: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  })),
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
};

export default SelectWithOnChange;
