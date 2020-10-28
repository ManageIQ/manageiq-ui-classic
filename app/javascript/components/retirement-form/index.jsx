import React, { useEffect, useState } from 'react';

import MiqFormRenderer from '@@ddf';
import createSchema from './retirement-form.schema';
import { API, http } from '../../http_api';
import handleFailure from '../../helpers/handle-failure';

const RetirementForm = ({ retirementID }) => {
  console.log(retirementID)
  const id = retirementID.split('"').filter(Number);
  const [{ initialValues, isLoading }, setState] = useState({
    isLoading: !!id,
    initialValues: {
      retirementDate: null,
      retirementWarning: '',
      formMode: '',
    },
  });

  console.log(`retirementID ${id} ${typeof id}`);
  const cancelUrl = `/${ManageIQ.controller}/retire?button=cancel`;
  const saveURL = `/${ManageIQ.controller}/retire?button=save`;

  const calculateDate = (months, weeks, days, hours) => {
    const now = new Date();
    now.setDate(now.getDate() + (weeks * 7) + days);
    now.setMonth(now.getMonth() + months);
    now.setHours(now.getHours() + hours);
    return now;
  };

  const onSubmit = (data) => {
    miqSparkleOn();
    const date = data.formMode === 'delay' ? calculateDate(parseInt(data.months, 10), parseInt(data.weeks, 10), parseInt(data.days, 10), parseInt(data.hours, 10)) : data.retirementDate;
    const request = data.formMode === 'delay'
      ? API.post(`/api/services/${id}`, { action: 'request_retire', resource: { date, warn: data.retirementWarning } })
      : API.post(`/api/services/${id}`, { action: 'request_retire', resource: { date, warn: data.retirementWarning } });
    request.then(() => {
      miqAjaxButton(saveURL, { retire_date: date, retire_warn: data.retirementWarning });
    }).catch(miqSparkleOff);
  };

  useEffect(() => {
    if (id.length === 1) {
      http.get(`/${ManageIQ.controller}/retirement_info/${id}`).then((res) => {
        console.log('Manage IQ Controller')
        console.log(ManageIQ.controller);
        if (res.retirement_date != null) {
          console.log(res);
          setState(prevState => ({
            ...prevState,
            isLoading: false,
            initialValues: { ...prevState.initialValues, 
              retirementDate: new Date(res.retirement_date),
              retirementWarning: res.retirement_warning || '',
              formMode: 'date',
            }
          }));
        }
        else {
          setState(prev => ({ ...prev, isLoading: false }))
        }
      }).catch(
        handleFailure,
      );
    }
  }, []);

  return (
    !isLoading && (
      <MiqFormRenderer
        initialValues={initialValues}
        schema={createSchema()}
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
