import React, { useEffect, useState } from 'react';
import MiqFormRenderer, { useFormApi } from '@@ddf';
import PropTypes from 'prop-types';
import { FormSpy } from '@data-driven-forms/react-form-renderer';
import createSchema from './service-request-default.schema';

// NOTE: parameters to be used as filters
let daysAgo;

// NOTE: processing the user selected filter values
const onSubmitData = (values, miqRequestInitialOptions) => {
  // Request Date (created_recently)
  if (values.selectedPeriod) { // user selected
    daysAgo = values.selectedPeriod;
  } else if (miqRequestInitialOptions.timePeriods[1] && miqRequestInitialOptions.timePeriods[1].value) {
    daysAgo = miqRequestInitialOptions.timePeriods[1].value;
  }

  const filters = [
    [
      'created_recently',
      parseInt(daysAgo, 10),
    ], [
      'with_approval_state',
      values.approvalStates,
    ], [
      'with_type',
      miqRequestInitialOptions.requestType,
    ],
  ];

  if (values.types && values.types !== 'all') {
    filters.push([
      'with_request_type',
      [values.types],
    ]);
  }

  if (values.reasonText) {
    filters.push([
      'with_reason_like',
      values.reasonText,
    ]);
  }

  if (values.selectedUser && (values.selectedUser !== 'all')) {
    filters.push([
      'with_requester',
      values.selectedUser,
    ]);
  }

  sendDataWithRx({ type: 'setScope', namedScope: filters });
};

const ServiceRequestDefault = ({ miqRequestInitialOptions }) => {
  const [{ initialValues }, setState] = useState({});

  useEffect(() => {
    const tempInitialValues = {};
    if (miqRequestInitialOptions.savedFilters) {
      if (miqRequestInitialOptions.savedFilters.selectedUser) {
        tempInitialValues.selectedUser = miqRequestInitialOptions.savedFilters.selectedUser;
      }

      if (miqRequestInitialOptions.savedFilters.approvalStates) {
        tempInitialValues.approvalStates = miqRequestInitialOptions.savedFilters.approvalStates;
      } else {
        tempInitialValues.approvalStates = ['pending_approval', 'approved', 'denied'];
      }

      if (miqRequestInitialOptions.savedFilters.types) {
        tempInitialValues.types = miqRequestInitialOptions.savedFilters.types;
      }

      if (miqRequestInitialOptions.savedFilters.selectedPeriod) {
        tempInitialValues.selectedPeriod = miqRequestInitialOptions.savedFilters.selectedPeriod;
      }

      if (miqRequestInitialOptions.savedFilters.reasonText) {
        tempInitialValues.reasonText = miqRequestInitialOptions.savedFilters.reasonText;
      }
    } else {
      tempInitialValues.selectedPeriod = 7;
      tempInitialValues.approvalStates = ['pending_approval', 'approved', 'denied'];
    }
    setState(() => ({
      initialValues: tempInitialValues,
    }));
  }, []);

  const onSubmit = (values) => {
    // NOTE: We only get what is *explicitly* clicked (so nothing for default values)
    onSubmitData(values, miqRequestInitialOptions);
  };

  const onReset = () => {
    setState(() => ({
      initialValues: {
        selectedUser: undefined,
        approvalStates: ['pending_approval', 'approved', 'denied'],
        types: 'all',
        selectedPeriod: 7,
        reasonText: undefined,
      },
    }));

    const filters = [
      ['created_recently', 7],
      ['with_approval_state', ['pending_approval', 'approved', 'denied']],
    ];
    sendDataWithRx({ type: 'setScope', namedScope: filters });
  };

  return (
    <div className="service-request-form">
      <MiqFormRenderer
        initialValues={initialValues}
        FormTemplate={(props) => <FormTemplate {...props} />}
        schema={createSchema(miqRequestInitialOptions)}
        canReset
        onSubmit={onSubmit}
        onReset={onReset}
      />
    </div>
  );
};

const verifyCheckboxes = (values) => (values.approvalStates === undefined ? true : values.approvalStates.length === 0);

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
