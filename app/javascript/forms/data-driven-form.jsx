import React from 'react';
import PropTypes from 'prop-types';
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

const MiqFormRenderer = ({ className, ...props }) => (
  <FormRender
    formFieldsMapper={formFieldsMapper}
    layoutMapper={{
      ...layoutMapper,
      [layoutComponents.FORM_WRAPPER]: props => <Form {...props} className={className} />,
    }}
    disableSubmit={[
      'pristine',
      'invalid',
    ]}
    {...buttonLabels}
    {...props}
  />
);

MiqFormRenderer.propTypes = {
  className: PropTypes.string,
};

MiqFormRenderer.defaultProps = {
  className: 'form-react',
};

export default MiqFormRenderer;
