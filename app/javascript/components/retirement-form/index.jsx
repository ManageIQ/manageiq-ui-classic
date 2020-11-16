import React, { useEffect, useState } from 'react';
import moment from 'moment';

import MiqFormRenderer from '@@ddf';
import createSchema from './retirement-form.schema';
import handleFailure from '../../helpers/handle-failure';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const RetirementForm = ({ retirementID, redirect, title, url}) => {
  console.log(`URL: ${url}`)
  const id = retirementID.replace(/\D/g,'');
  const [{ initialValues, isLoading }, setState] = useState({
    isLoading: !!id,
  });

  const onSubmit = ({ formMode, retirementDate, retirementWarning, days, weeks, months, hours }) => {
    miqSparkleOn();
    const date = formMode === 'delay' ? moment().add({ days:Number(days), weeks:Number(weeks), months:Number(months), hours:Number(hours) })._d : retirementDate;
    const request = API.post(`${url}/${id}`, { action: 'request_retire', resource: { date, warn: retirementWarning } });
    request.then(() => {
      const message = sprintf(__(`Retirement date set to ${date.toLocaleString()}`));
      miqRedirectBack(message, 'success', redirect);
    }).catch(miqSparkleOff);
  };

  const onCancel = () => {
    miqSparkleOn();
    const message = __('Set/remove retirement date was cancelled by the user');
    miqRedirectBack(message, 'warn', redirect);
  }

  useEffect(() => {
    if (id) {
      API.get(`${url}/${id}?attributes=retires_on,retirement_warn`).then((res) => {
        if (res.retires_on != null) {
          setState({
            isLoading: false,
            initialValues: {
              retirementDate: res.retires_on,
              retirementWarning: res.retirement_warn || '',
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
        onCancel={onCancel}
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
