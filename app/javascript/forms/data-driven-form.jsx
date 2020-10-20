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

// This is a wrapper around the passed onSubmit function that filters out the values from the form
// data that don't have corresponding fields in the declared form schema.
const submitWrapper = (fn) => (values, formOptions, ...args) => {
  // Get a list of all fields declared in the schema
  const fields = formOptions.getRegisteredFields();

  const filteredValues = fields.reduce((obj, field) => (_.has(values, field) ? _.set(obj, field, _.get(values, field)) : obj), {});
  // For compatibility, we're passing all the other arguments as well
  return fn(filteredValues, formOptions, ...args);
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
  onSubmit,
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
      onSubmit={submitWrapper(onSubmit)}
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
  onSubmit: PropTypes.func,
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
  onSubmit: () => undefined,
};

export {
  componentTypes, validatorTypes, useFormApi, useFieldApi, FieldArray, FormSpy,
};
export default connect()(MiqFormRenderer);
