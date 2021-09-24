import React from 'react';
import MiqFormRenderer, { useFormApi } from '@@ddf';
import PropTypes from 'prop-types';
import { FormSpy } from '@data-driven-forms/react-form-renderer';
import createSchema from './service-request-default.schema';

// NOTE: parameters to be used as filters
let daysAgo;

const getApprovalStateCheckboxesDefault = (miqRequestInitialOptions) => {
  const defaultStates = [];
  if (miqRequestInitialOptions.states) {
    miqRequestInitialOptions.states.forEach((state) => {
      defaultStates.push(state.value);
    });
  }
  return defaultStates;
};

// NOTE: processing the user selected filter values
const onSubmitData = (values, miqRequestInitialOptions) => {
  // Request Date (created_recently)
  if (values.selectedPeriod) { // user selected
    daysAgo = values.selectedPeriod;
  } else { // default
    if (miqRequestInitialOptions.timePeriods[1] && miqRequestInitialOptions.timePeriods[1].value) {
      daysAgo = miqRequestInitialOptions.timePeriods[1].value;
    }
  }

  const submitThis = [
    [
      'created_recently',
      parseInt(daysAgo, 10),
    ], [
      'with_approval_state',
      values.approvalStateCheckboxes ? values.approvalStateCheckboxes : getApprovalStateCheckboxesDefault(miqRequestInitialOptions),
    ], [
      'with_type',
      miqRequestInitialOptions.requestType,
    ],
  ];

  if (values.types && values.types !== 'all') {
    submitThis.push([
      'with_request_type',
      [values.types],
    ]);
  }

  if (values.reasonText) {
    submitThis.push([
      'with_reason_like',
      values.reasonText,
    ]);
  }

  sendDataWithRx({ type: 'setScope', namedScope: submitThis });
};

const ServiceRequestDefault = ({ miqRequestInitialOptions }) => {
  const onSubmit = (values) => {
    // NOTE: We only get what is *explicitly* clicked (so nothing for default values)
    onSubmitData(values, miqRequestInitialOptions);
  };

  const onReset = () => {
    onSubmitData({}, miqRequestInitialOptions);
  };

  return (
    <div className="service-request-form">
      <MiqFormRenderer
        FormTemplate={(props) => <FormTemplate {...props} />}
        schema={createSchema(miqRequestInitialOptions)}
        canReset
        onSubmit={onSubmit}
        onReset={onReset}
      />
    </div>
  );
};

const verifyCheckboxes = (values) => values.approvalStateCheckboxes.length === 0;

const FormTemplate = ({ formFields }) => {
  const {
    handleSubmit, onReset, getState,
  } = useFormApi();
  const { valid, pristine } = getState();
  return (
    <form onSubmit={handleSubmit}>
      {formFields}
      <FormSpy>
        {({ values }) => (
          <div className="custom-button-wrapper">
            <button
              disabled={verifyCheckboxes(values)}
              className="bx--btn bx--btn--primary btnRight"
              id="submit"
              type="submit"
              variant="contained"
            >
              {__('Apply')}
            </button>
            <button
              disabled={!valid && pristine}
              className="bx--btn bx--btn--secondary btnRight"
              variant="contained"
              id="reset"
              onClick={onReset}
              type="button"
            >
              {__('Reset')}
            </button>
          </div>
        )}
      </FormSpy>
    </form>
  );
};

ServiceRequestDefault.propTypes = {
  miqRequestInitialOptions: PropTypes.objectOf(PropTypes.any).isRequired,
};

FormTemplate.propTypes = {
  formFields: PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default ServiceRequestDefault;
