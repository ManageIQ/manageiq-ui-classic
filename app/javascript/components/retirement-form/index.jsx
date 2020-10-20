import React, { useEffect, useState } from 'react';

import MiqFormRenderer from '@@ddf';
import createSchema from './retirement-form.schema';
import { API } from '../../http_api';
import handleFailure from '../../helpers/handle-failure';
// import miqRedirectBack from '../../helpers/miq-redirect-back';

const RetirementForm = ({ retirementID }) => {
  const id = retirementID.split('"').filter(Number);
  let delayed = true;
  const [{ initialValues, isLoading }, setState] = useState({
    isLoading: !!id,
    initialValues: {
      retirementDate: null,
      retirementWarning: '',
    },
  });

  console.log(`retirementID ${id} ${typeof id}`);
  const cancelUrl = `/${ManageIQ.controller}/retire?button=cancel`;
  const saveURL = `/${ManageIQ.controller}/retire?button=save`;

  const onSubmit = (data) => {
    API.post(`/api/services/${id}`, {
      action: 'request_retire',
      resource: { date: data.retirement_date_datepicker, warn: data.retirementWarning },
    });
  };

  useEffect(() => {
    if (id.length === 1) {
      API.get(`/${ManageIQ.controller}/retirement_info/${id}`).then((res) => {
        console.log(res);
        if (res.retirement_date != null) {
          setState({
            initialValues: {
              retirementDate: new Date(res.retirement_date),
              retirementWarning: res.retirement_warning || '',
            },
          });
        }
        setState({ isLoading: false });
      }).catch(
        handleFailure,
      );
    }
  }, []);

  return (
    !isLoading && (
      <MiqFormRenderer
        initialValues={initialValues}
        schema={createSchema(delayed)}
        onSubmit={onSubmit}
        canReset={!!id}
        onCancel={() => miqAjaxButton(cancelUrl)}
        onReset={() => add_flash(__('All changes have been reset'), 'warn')}
        buttonsLabels={{
          resetLabel: __('Reset'),
          submitLabel: __('Save'),
          cancelLabel: __('Cancel'),
        }}
      />
    )
  );
};

export default RetirementForm;
