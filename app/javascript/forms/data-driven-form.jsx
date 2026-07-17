import { useRef } from 'react';
import PropTypes from 'prop-types';
import {
  validators,
  componentTypes,
  validatorTypes,
  useFormApi,
  useFieldApi,
  FieldArray,
  FormSpy,
  FormRenderer,
  FormError,
} from '@data-driven-forms/react-form-renderer';
import { FormTemplate } from '@data-driven-forms/carbon-component-mapper';
import defaultComponentMapper from './mappers/componentMapper';
import SpyField from './spy-field';

validators.messages = {
  ...validators.messages,
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
  className = 'form-react',
  componentMapper = defaultComponentMapper,
  buttonsLabels = {},
  disableSubmit = ['pristine', 'invalid'],
  canReset = false,
  showFormControls = true,
  schema: { fields = [], ...schema } = { fields: [] },
  initialize,
  onSubmit = () => {},
  validate = () => {},
  ...props
}) => {
  const { current: MiqFormTemplate } = useRef((props) => (
    <FormTemplate
      {...props}
      disableSubmit={disableSubmit}
      canReset={canReset}
      showFormControls={showFormControls}
      formWrapperProps={{ className }}
      {...defaultLabels}
      {...buttonsLabels}
    />
  ));

  return (
    <FormRenderer
      componentMapper={{ ...componentMapper, 'spy-field': SpyField }}
      FormTemplate={MiqFormTemplate}
      schema={{ fields: [...fields, { component: 'spy-field', name: 'spy-field', initialize }], ...schema }}
      onSubmit={submitWrapper(onSubmit)}
      onReset={() => add_flash(__('All changes have been reset'), 'warn')}
      validate={validate}
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
  validate: PropTypes.func,
};

export {
  componentTypes, validatorTypes, useFormApi, useFieldApi, FieldArray, FormSpy, FormError,
};
export default MiqFormRenderer;
