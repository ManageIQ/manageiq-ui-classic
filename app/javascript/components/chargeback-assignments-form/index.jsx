import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import MiqFormRenderer from '@@ddf';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import createSchema from './chargeback-assignments.schema';

const ChargebackAssignmentsForm = ({ options, selectedOption }) => {
  const [{ isLoading, initialValues, assignmentOptions }, setState] = useState({ isLoading: true, initialValues: {} });

  useEffect(() => {
    const tempOptions = [{ value: 'nil', label: `<${__('Nothing')}>` }];
    Object.keys(options).forEach((key) => {
      tempOptions.push({ value: key, label: options[key] });
    });
    console.log(options);
    console.log(selectedOption);
    setState((state) => ({
      ...state,
      isLoading: false,
      initialValues: { cbshow_typ: selectedOption },
      assignmentOptions: tempOptions,
    }));
  }, []);

  const onSubmit = (values) => {
  };

  const onCancel = () => {
  };

  return !isLoading && (
    <MiqFormRenderer
      initialValues={initialValues}
      schema={createSchema(assignmentOptions)}
      onSubmit={onSubmit}
      onCancel={onCancel}
      canReset
      buttonsLabels={{
        submitLabel: __('Save'),
      }}
    />
  );
};

ChargebackAssignmentsForm.propTypes = {
  options: PropTypes.objectOf(PropTypes.string).isRequired,
  selectedOption: PropTypes.string,
};

ChargebackAssignmentsForm.defaultProps = {
  selectedOption: 'nil',
};

export default ChargebackAssignmentsForm;
