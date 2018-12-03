import React from 'react';
import FormRender from '@data-driven-forms/react-form-renderer';
import { formFieldsMapper, layoutMapper } from '@data-driven-forms/pf3-component-mapper';

const MiqFormRenderer = props => (
  <FormRender
    formFieldsMapper={formFieldsMapper}
    layoutMapper={layoutMapper}
    disableSubmit={[
      'pristine',
      'invalid',
    ]}
    {...props}
  />
);
export default MiqFormRenderer;
