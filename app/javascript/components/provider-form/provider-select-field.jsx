import React, { useContext } from 'react';
import { set } from 'lodash';

import fieldsMapper from '../../forms/mappers/formFieldsMapper';
import { EditingContext, loadProviderFields } from './index';

const extractInitialValues = ({ name, initialValue, fields }) => {
  const children = fields ? fields.reduce((obj, field) => ({ ...obj, ...extractInitialValues(field) }), {}) : {};
  const item = name && initialValue ? { [name]: initialValue } : undefined;
  return { ...item, ...children };
};

const ProviderSelectField = ({ kind, FieldProvider, formOptions, ...props }) => {
  const { isDisabled: edit } = props;

  const { setState } = useContext(EditingContext);
  const Component = fieldsMapper['select-field'];

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
        <Component input={{ ...input, onChange: enhancedChange(onChange) }} formOptions={formOptions} {...props} />
      )}
    />
  );
};

export default ProviderSelectField;
