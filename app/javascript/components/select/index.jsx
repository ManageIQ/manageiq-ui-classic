
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { components } from '@data-driven-forms/pf3-component-mapper';

import { useFieldApi } from '@@ddf';

const SelectWithOnChange = ({ onChange, ...props }) => {
  if (onChange) {
    const { input: { value } } = useFieldApi(props);

    useEffect(() => {
      if (!props.isDisabled && value) {
        onChange(value);
      }
    }, [value]);
  }

  return <components.Select placeholder={`<${__('Choose')}>`} {...props} />;
};

SelectWithOnChange.propTypes = {
  onChange: PropTypes.func,
};

SelectWithOnChange.defaultProps = {
  onChange: undefined,
};

export default SelectWithOnChange;
