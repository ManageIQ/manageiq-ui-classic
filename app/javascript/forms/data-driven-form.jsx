import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import FormRender, {
  Validators,
  componentTypes,
  validatorTypes,
  useFormApi,
  useFieldApi,
  FieldArray,
  FormSpy,
} from '@data-driven-forms/react-form-renderer';
import { FormTemplate } from '@data-driven-forms/pf3-component-mapper';
import { Form } from 'patternfly-react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import defaultComponentMapper from './mappers/componentMapper';
import SpyField from './spy-field';

Validators.messages = {
  ...Validators.messages,
  required: __('Required'),
};

const defaultLabels = {
  submitLabel: __('Save'),
  resetLabel: __('Reset'),
  cancelLabel: __('Cancel'),
};

const MiqFormRenderer = ({
  className,
  componentMapper,
  buttonsLabels,
  disableSubmit,
  canReset,
  showFormControls,
  schema: { fields, ...schema },
  initialize,
  ...props
}) => {
  const { current: FormWrapper } = useRef(({ children, ...props }) => (
    <Form className={classNames('ddorg__pf3-layout-components__form-wrapper', className)} {...props}>
      { children }
    </Form>
  ));

  const { current: MiqFormTemplate } = useRef(props => (
    <FormTemplate
      {...props}
      FormWrapper={FormWrapper}
      disableSubmit={disableSubmit}
      canReset={canReset}
      showFormControls={showFormControls}
      {...defaultLabels}
      {...buttonsLabels}
    />
  ));

  return (
    <FormRender
      componentMapper={{ ...componentMapper, 'spy-field': SpyField }}
      FormTemplate={MiqFormTemplate}
      schema={{ fields: [...fields, { component: 'spy-field', name: 'spy-field', initialize }], ...schema }}
      {...props}
    />
  );
};

MiqFormRenderer.propTypes = {
  className: PropTypes.string,
  buttonsLabels: PropTypes.shape({
    submitLabel: PropTypes.string,
    resetLabel: PropTypes.string,
    cancelLabel: PropTypes.string,
  }),
  componentMapper: PropTypes.any,
  schema: PropTypes.shape({
    fields: PropTypes.arrayOf(PropTypes.any),
  }),
  disableSubmit: PropTypes.arrayOf(PropTypes.string),
  canReset: PropTypes.bool,
  showFormControls: PropTypes.bool,
  initialize: PropTypes.func,
};

MiqFormRenderer.defaultProps = {
  className: 'form-react',
  buttonsLabels: {},
  componentMapper: defaultComponentMapper,
  schema: {
    fields: [],
  },
  disableSubmit: ['pristine', 'invalid'],
  canReset: false,
  showFormControls: true,
  initialize: undefined,
};

export {
  componentTypes, validatorTypes, useFormApi, useFieldApi, FieldArray, FormSpy,
};
export default connect()(MiqFormRenderer);
