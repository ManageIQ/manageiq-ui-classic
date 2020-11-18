import React, { useEffect, useState } from 'react';
import moment from 'moment';

import MiqFormRenderer from '@@ddf';
import createSchema from './retirement-form.schema';
import handleFailure from '../../helpers/handle-failure';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const RetirementForm = ({ retirementID, redirect, url}) => {
  const retireItems = JSON.parse(retirementID);
  const [{ initialValues, isLoading }, setState] = useState({
    isLoading: !!retireItems,
  });

  const onSubmit = ({ formMode, retirementDate, retirementWarning, days, weeks, months, hours }) => {
    miqSparkleOn();
    const date = formMode === 'delay' ? moment().add({ days:Number(days), weeks:Number(weeks), months:Number(months), hours:Number(hours) })._d : retirementDate;
    var objects = [];
    retireItems.forEach(id => objects.push({
      id: id,
      date: date,
      warn: retirementWarning,
    }));
    const request = API.post(url, { action: 'request_retire', resources: objects });
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
    if (retireItems.length === 1) {
      API.get(`${url}/${retireItems[0]}?attributes=retires_on,retirement_warn`).then((res) => {
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
          setState(prev => ({ ...prev, isLoading: false }));
        }
      }).catch(
        handleFailure,
      );
    }
    else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
}, []);

  return (
    !isLoading && (
      <MiqFormRenderer
        initialValues={initialValues}
        schema={createSchema()}
        onSubmit={onSubmit}
        canReset={!!retireItems}
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
