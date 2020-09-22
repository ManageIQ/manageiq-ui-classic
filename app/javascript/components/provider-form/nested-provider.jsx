import React, { useState, useContext } from 'react';

import { EditingContext } from './index';
import Select from '../select';
import { useFormApi, validatorTypes } from '@@ddf';

// Recursively omits the required validator and the isRequired attribute
const override = fields => fields.map(({
  fields, validate, isRequired: _isRequired, ...field
}) => ({
  ...field,
  validate: validate.filter(({ type }) => type !== validatorTypes.REQUIRED),
  ...(fields ? { fields: override(fields) } : {}),
}));

const NestedProvider = ({ fields, ...props }) => {
  const { providerId } = useContext(EditingContext);
  const [{ edit, require }, setState] = useState(() => ({ edit: !!providerId, require: !props.initialValue }));
  const formOptions = useFormApi();

  return (
    <>
      { edit && formOptions.renderForm(require ? fields : override(fields)) }
      <Select onChange={value => setState(state => ({ ...state, require: !value }))} {...props} />
    </>
  );
};

export default NestedProvider;
