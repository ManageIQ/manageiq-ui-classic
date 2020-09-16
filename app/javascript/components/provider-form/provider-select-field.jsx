import React, { useEffect } from 'react';

import { useFieldApi } from '@@ddf';
import Select from '../select';

const ProviderSelectField = ({ loadSchema, ...props }) => {
  const { input: { value } } = useFieldApi(props);

  useEffect(() => {
    if (!props.isDisabled && value) {
      loadSchema(value);
    }
  }, [value]);

  return <Select {...props} />;
};

export default ProviderSelectField;
