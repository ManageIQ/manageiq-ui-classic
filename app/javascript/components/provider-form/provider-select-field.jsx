import React, { useContext } from 'react';
import { set } from 'lodash';

import { useFormApi } from '@@ddf';
import { components } from '@data-driven-forms/pf3-component-mapper';
import { EditingContext, loadProviderFields } from './index';

const extractInitialValues = ({ name, initialValue, fields }) => {
  const children = fields ? fields.reduce((obj, field) => ({ ...obj, ...extractInitialValues(field) }), {}) : {};
  const item = name && initialValue ? { [name]: initialValue } : undefined;
  return { ...item, ...children };
};

const ProviderSelectField = ({ kind, FieldProvider, ...props }) => {
  const formOptions = useFormApi();

  const { isDisabled: edit } = props;
  const { setState } = useContext(EditingContext);

  const enhancedChange = onChange => (type) => {
    if (!edit && type) {
      miqSparkleOn();

      loadProviderFields(kind, type).then((fields) => {
        setState(({ fields: [firstField] }) => ({ fields: [firstField, ...fields] }));
        const initialValues = extractInitialValues({ fields });
        formOptions.initialize(Object.keys(initialValues).reduce((obj, key) => set(obj, key, initialValues[key]), { type }));
      }).then(miqSparkleOff);
    }

    return onChange(type);
  };

  return (
    <FieldProvider
      {...props}
      formOptions={formOptions}
      render={({ input: { onChange, ...input }, ...props }) => (
        <components.Select input={{ ...input, onChange: enhancedChange(onChange) }} formOptions={formOptions} {...props} />
      )}
    />
  );
};

export default ProviderSelectField;
