import React from 'react';
import FormRender from '@data-driven-forms/react-form-renderer';
import { formFieldsMapper, layoutMapper } from '@data-driven-forms/pf3-component-mapper';

const MiqFormRenderer = props => (
  <FormRender
    disableSubmit
    formFieldsMapper={formFieldsMapper}
    layoutMapper={layoutMapper}
    {...props}
  />
);

export default MiqFormRenderer;
