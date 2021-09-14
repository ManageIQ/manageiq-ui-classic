import React, { useEffect, useState } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import MiqFormRenderer from '@@ddf';
import createSchema from './retirement-form.schema';
import handleFailure from '../../helpers/handle-failure';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const RetirementForm = ({ retirementID, redirect, url }) => {
  const retireItems = JSON.parse(retirementID);

  const [{ initialValues, isLoading }, setState] = useState({ isLoading: !!retireItems });

  const onSubmit = ({
    formMode, retirementDate, retirementWarning, days, weeks, months, hours,
  }) => {
    miqSparkleOn();

    const date = formMode !== 'delay' ? retirementDate[0] : moment().add({
      hours: Number(hours),
      days: Number(days),
      weeks: Number(weeks),
      months: Number(months),
    })._d;

    const resources = retireItems.map((id) => ({
      id,
      date,
      warn: retirementWarning,
    }));

    API.post(url, { action: 'request_retire', resources }).then(() => {
      const message = sprintf(__(`Retirement date set to ${date.toLocaleString()}`));
      miqRedirectBack(message, 'success', redirect);
    }).catch(miqSparkleOff);
  };

  const onCancel = () => {
    const message = __('Set/remove retirement date was cancelled by the user');
    miqRedirectBack(message, 'warn', redirect);
  };

  useEffect(() => {
    if (retireItems.length === 1) {
      // eslint-disable-next-line camelcase
      API.get(`${url}/${retireItems[0]}?attributes=retires_on,retirement_warn`).then(({ retires_on, retirement_warn }) => {
        setState({
          isLoading: false,
          // eslint-disable-next-line camelcase
          initialValues: retires_on && {
            retirementDate: retires_on,
            // eslint-disable-next-line camelcase
            retirementWarning: retirement_warn || '',
          },
        });
      }).catch(handleFailure);
    } else {
      setState((state) => ({ ...state, isLoading: false }));
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

RetirementForm.propTypes = {
  retirementID: PropTypes.string.isRequired,
  redirect: PropTypes.string,
  url: PropTypes.string.isRequired,
};

RetirementForm.defaultProps = {
  redirect: undefined,
};

export default RetirementForm;
