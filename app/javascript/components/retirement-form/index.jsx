/* eslint-disable camelcase */
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
  const [showDateError, setShowDateError] = useState(false);

  const onSubmit = ({
    formMode, retirementDate, retirementTime, retirementWarning, days, weeks, months, hours,
  }) => {
    if (retirementDate || formMode === 'delay') {
      miqSparkleOn();
      let tempDate = retirementDate;
      if (Array.isArray(retirementDate)) {
        [tempDate] = retirementDate;
      }
      let date;
      if (tempDate !== undefined || formMode === 'delay') {
        if (formMode === 'delay') {
          date = moment().add({
            hours: Number(hours),
            days: Number(days),
            weeks: Number(weeks),
            months: Number(months),
          })._d;
        } else {
          date = new Date(tempDate);
          let time;
          let timeHours;
          let timeMinutes;
          if (retirementTime instanceof Date === false || retirementTime === undefined) {
            time = moment().startOf('D');
            timeHours = time.hour();
            timeMinutes = time.minute();
            if (/^([0-1][0-2]|0?[1-9]):[0-5][0-9]$/.test(retirementTime)) {
              [timeHours, timeMinutes] = retirementTime.split(':');
            } else {
              time = moment().startOf('D');
            }
          } else {
            time = moment(retirementTime);
            timeHours = time.hour();
            timeMinutes = time.minute();
          }
          date.setHours(timeHours);
          date.setMinutes(timeMinutes);
        }
      }
      tempDate = date;
      const resources = retireItems.map((id) => ({
        id,
        date,
        warn: retirementWarning,
      }));
      API.post(url, { action: 'request_retire', resources }).then(() => {
        const message = sprintf(__(`Retirement date set to ${date.toLocaleString()}`));
        miqRedirectBack(message, 'success', redirect);
      }).catch(miqSparkleOff);
    } else if (retirementDate === undefined) {
      setShowDateError(true);
    }
  };

  const onCancel = () => {
    const message = __('Set/remove retirement date was cancelled by the user');
    miqRedirectBack(message, 'warn', redirect);
  };

  useEffect(() => {
    if (retireItems.length === 1) {
      API.get(`${url}/${retireItems[0]}?attributes=retires_on,retirement_warn`).then(({ retires_on, retirement_warn }) => {
        let retirementTime;
        if (retires_on) {
          const tempDate = new Date(retires_on);
          const hours = `${tempDate.getHours()}`;
          const minutes = `${tempDate.getMinutes()}`;
          retirementTime = new Date();
          retirementTime.setHours(hours);
          retirementTime.setMinutes(minutes);
        } else {
          retirementTime = moment().startOf('D')._d;
        }
        setState({
          isLoading: false,
          initialValues: retires_on ? {
            retirementDate: retires_on,
            retirementTime,
            retirementWarning: retirement_warn || '',
          } : {
            retirementTime,
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
        schema={createSchema(showDateError)}
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
