import React, { useEffect } from 'react';

import { useFieldApi, componentTypes } from '@@ddf';
import componentMapper from '../../forms/mappers/componentMapper';

const Select = componentMapper[componentTypes.SELECT];

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
