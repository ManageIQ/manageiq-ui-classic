/* eslint-disable camelcase */
import React, { useEffect, useState } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import MiqFormRenderer from '@@ddf';
import createSchema from './retirement-form.schema';
import handleFailure from '../../helpers/handle-failure';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const RetirementForm = ({
  retirementID, redirect, url, timezone,
}) => {
  const retireItems = JSON.parse(retirementID);
  const tz = timezone;

  const [{ initialValues, isLoading }, setState] = useState({ isLoading: !!retireItems });
  const [showTimeField, setShowTimeField] = useState(false);

  const onSubmit = ({
    formMode, retirementDate, retirementTime, retirementWarning, days, weeks, months, hours,
  }) => {
    let NotEmpty = true;
    if (retirementDate === []) {
      NotEmpty = false;
    }
    if ((retirementDate || formMode === 'delay') && NotEmpty) {
      miqSparkleOn();
      let retirementWarn = retirementWarning;
      if (retirementWarn === undefined) {
        retirementWarn = '';
      }
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
          date.setSeconds(0);
        }
      }

      tempDate = date;

      // Find utc offset of browser time zone (utcOffset) and manage iq timezone (newOffset)
      const browserOffset = moment().utcOffset();
      const miqOffset = moment.tz(tz.tzinfo.info.identifier).utcOffset();
      date = moment(date).add({ minutes: browserOffset - miqOffset })._d;

      const resources = retireItems.map((id) => ({
        id,
        date,
        warn: retirementWarn,
      }));
      API.post(url, { action: 'request_retire', resources }).then(() => {
        const message = sprintf(__(`Retirement date set to ${tempDate.toLocaleString()}`));
        miqRedirectBack(message, 'success', redirect);
      }).catch(miqSparkleOff);
    } else if (retirementDate === undefined || NotEmpty === false) {
      const resources = retireItems.map((id) => ({
        id,
        date: '',
        warn: '',
      }));
      API.post(url, { action: 'request_retire', resources }).then(() => {
        const message = sprintf(__('Retirement date removed'));
        miqRedirectBack(message, 'success', redirect);
      }).catch(miqSparkleOff);
    }
  };

  const onCancel = () => {
    const message = __('Set/remove retirement date was cancelled by the user');
    miqRedirectBack(message, 'warn', redirect);
  };

  useEffect(() => {
    if (retireItems.length === 1) {
      API.get(`${url}/${retireItems[0]}?attributes=retires_on,retirement_warn`).then(({ retires_on, retirement_warn }) => {
        let retirementDate;
        let retirementTime;
        if (retires_on) {
          // Convert utc date from api to miq time zone then add browser timezone utc offset to get time relative to user's browser
          const utcOffset = -1 * moment().utcOffset();
          retirementDate = moment(retires_on).tz(tz.tzinfo.info.identifier).add({ minutes: utcOffset })._d;
          retirementTime = retirementDate;
          setShowTimeField(true);
        } else {
          retirementTime = moment().startOf('D')._d;
          setShowTimeField(false);
        }
        setState({
          isLoading: false,
          initialValues: retires_on ? {
            retirementDate,
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
        schema={createSchema(showTimeField, setShowTimeField)}
        onSubmit={onSubmit}
        canReset={!!retireItems}
        onCancel={onCancel}
        onReset={() => {
          add_flash(__('All changes have been reset'), 'warn');
          setShowTimeField(true);
          if (initialValues.retirementDate) {
            setShowTimeField(true);
          } else {
            setShowTimeField(false);
          }
        }}
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
  timezone: PropTypes.objectOf(PropTypes.any),
};

RetirementForm.defaultProps = {
  redirect: undefined,
  timezone: { tzinfo: { info: { identifier: 'Etc/UTC' } } },
};

export default RetirementForm;
