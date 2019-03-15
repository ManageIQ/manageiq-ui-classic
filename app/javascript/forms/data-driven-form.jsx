import React from 'react';
import FormRender, { Validators } from '@data-driven-forms/react-form-renderer';
import { layoutMapper } from '@data-driven-forms/pf3-component-mapper';
import formFieldsMapper from './mappers/formsFieldsMapper';

Validators.messages = {
  ...Validators.messages,
  required: __('Required'),
};

const defaultButtonsLabels = {
  submitLabel: __('Save'),
  resetLabel: __('Reset'),
  cancelLabel: __('Cancel'),
};

const MiqFormRenderer = ({ buttonsLabels, ...props }) => (
  <FormRender
    formFieldsMapper={formFieldsMapper}
    layoutMapper={layoutMapper}
    disableSubmit={[
      'pristine',
      'invalid',
    ]}
    buttonsLabels={{
      ...defaultButtonsLabels,
      ...buttonsLabels,
    }}
    {...props}
  />
);

export default MiqFormRenderer;
