import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'patternfly-react';
import FormRender, { Validators, layoutComponents } from '@data-driven-forms/react-form-renderer';
import { layoutMapper } from '@data-driven-forms/pf3-component-mapper';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { setPristine } from '../miq-redux/form-reducer';
import formFieldsMapper from './mappers/formsFieldsMapper';

Validators.messages = {
  ...Validators.messages,
  required: __('Required'),
};

const MiqFormRenderer = ({
  className, setPristine, onStateUpdate, buttonsLabels, ...props
}) => (
  <FormRender
    formFieldsMapper={formFieldsMapper}
    buttonsLabels={{
      submitLabel: __('Save'),
      resetLabel: __('Reset'),
      cancelLabel: __('Cancel'),
      ...buttonsLabels,
    }}
    layoutMapper={{
      ...layoutMapper,
      [layoutComponents.FORM_WRAPPER]: props => <Form {...props} className={className} />,
    }}
    disableSubmit={[
      'pristine',
      'invalid',
    ]}
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
};

MiqFormRenderer.defaultProps = {
  className: 'form-react',
  onStateUpdate: undefined,
  buttonsLabels: {},
};

const mapDispatchToProps = dispatch => bindActionCreators({ setPristine }, dispatch);

export default connect(null, mapDispatchToProps)(MiqFormRenderer);
