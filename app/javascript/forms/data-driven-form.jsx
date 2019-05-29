import React from 'react';
import { Form } from 'patternfly-react';
import FormRender, { Validators, layoutComponents } from '@data-driven-forms/react-form-renderer';
import { layoutMapper } from '@data-driven-forms/pf3-component-mapper';
import formFieldsMapper from './mappers/formsFieldsMapper';

Validators.messages = {
  ...Validators.messages,
  required: __('Required'),
};

const buttonLabels = {
  submitLabel: __('Save'),
  resetLabel: __('Reset'),
  cancelLabel: __('Cancel'),
};

const FormWrapper = ({ children, ...props }) => <Form {...props} className="form-react">{children}</Form>;

const MiqFormRenderer = props => (
  <FormRender
    formFieldsMapper={formFieldsMapper}
    layoutMapper={{
      ...layoutMapper,
      [layoutComponents.FORM_WRAPPER]: FormWrapper,
    }}
    disableSubmit={[
      'pristine',
      'invalid',
    ]}
    {...buttonLabels}
    {...props}
  />
);
export default MiqFormRenderer;
