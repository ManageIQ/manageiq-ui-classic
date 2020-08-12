import React from 'react';
import PropTypes from 'prop-types';
import FormRender, {
  Validators,
  componentTypes,
  validatorTypes,
  useFormApi,
  FieldArray,
  FormSpy,
} from '@data-driven-forms/react-form-renderer';
import { FormTemplate } from '@data-driven-forms/pf3-component-mapper';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { setPristine } from '../miq-redux/form-reducer';
import defaultComponentMapper from './mappers/componentMapper';

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
  className, setPristine, onStateUpdate, componentMapper, buttonsLabels, disableSubmit, canReset, showFormControls, ...props
}) => (
  <FormRender
    componentMapper={componentMapper}
    FormTemplate={props => (
      <FormTemplate
        {...props}
        className={className}
        buttonsLabels={{ ...defaultLabels, ...buttonsLabels }}
        disableSubmit={disableSubmit}
        canReset={canReset}
        showFormControls={showFormControls}
      />
    )}
    onStateUpdate={(formOptions) => {
      setPristine(formOptions.pristine);
      if (onStateUpdate) {
        onStateUpdate(formOptions);
      }
    }}
    {...props}
  />
);

MiqFormRenderer.propTypes = {
  className: PropTypes.string,
  onStateUpdate: PropTypes.func,
  setPristine: PropTypes.func.isRequired,
  buttonsLabels: PropTypes.any,
  componentMapper: PropTypes.any,
  buttonsLabels: PropTypes.any,
  disableSubmit: PropTypes.arrayOf(PropTypes.string),
  canReset: PropTypes.bool,
  showFormControls: PropTypes.bool,
};

MiqFormRenderer.defaultProps = {
  className: 'form-react',
  onStateUpdate: undefined,
  buttonsLabels: {},
  componentMapper: defaultComponentMapper,
  buttonsLabels: {},
  disableSubmit: ['pristine', 'invalid'],
  canReset: false,
  showFormControls: true,
};

const mapDispatchToProps = dispatch => bindActionCreators({ setPristine }, dispatch);

export { componentTypes, validatorTypes, useFormApi, FieldArray, FormSpy };
export default connect(null, mapDispatchToProps)(MiqFormRenderer);
