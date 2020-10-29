import React, { useEffect, useState } from 'react';
import moment from 'moment';

import MiqFormRenderer from '@@ddf';
import createSchema from './retirement-form.schema';
import handleFailure from '../../helpers/handle-failure';

const RetirementForm = ({ retirementID }) => {
  const id = retirementID.split('"').filter(Number);
  const [{ initialValues, isLoading }, setState] = useState({
    isLoading: !!id,
    initialValues: { formMode: '' },
  });

  const cancelUrl = `/${ManageIQ.controller}/retire?button=cancel`;
  const saveURL = `/${ManageIQ.controller}/retire?button=save`;

  const onSubmit = (data) => {
    miqSparkleOn();
    const date = data.formMode === 'delay' ? moment().add({ days:Number(data.days), weeks:Number(data.weeks), months:Number(data.months), hours:Number(data.hours) })._d : data.retirementDate;
    const request = API.post(`/api/services/${id}`, { action: 'request_retire', resource: { date, warn: data.retirementWarning } });
    request.then(() => {
      miqAjaxButton(saveURL, { retire_date: date, retire_warn: data.retirementWarning });
    }).catch(miqSparkleOff);
  };

  useEffect(() => {
    if (id.length === 1) {
      API.get(`/api/services/${id}?attributes=retires_on,retirement_warn`).then((res) => {
        if (res.retires_on != null) {
          setState({
            isLoading: false,
            initialValues: {
              retirementDate: res.retires_on,
              retirementWarning: res.retirement_warn || '',
              formMode: 'date',
            }
          });
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
