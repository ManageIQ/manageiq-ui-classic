import React, { useContext, useEffect } from 'react';

import { useFieldApi, componentTypes } from '@@ddf';
import componentMapper from '../../forms/mappers/componentMapper';

import { EditingContext, loadProviderFields } from './index';

const Select = componentMapper[componentTypes.SELECT];

const ProviderSelectField = ({ kind, ...props }) => {
  const { input: { value } } = useFieldApi(props);
  const { isDisabled: edit } = props;
  const { setState } = useContext(EditingContext);

  useEffect(() => {
    if (!edit && value) {
      loadProviderFields(kind, value).then((fields) => {
        setState(({ fields: [firstField] }) => ({
          fields: [firstField, ...fields],
        }));
      });
    }
  }, [value]);

  return <Select {...props} />;
};

export default ProviderSelectField;
