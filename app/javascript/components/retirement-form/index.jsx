/* eslint-disable camelcase */
import React, { useEffect, useState } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import MiqFormRenderer from '@@ddf';
import createSchema from './retirement-form.schema';
import handleFailure from '../../helpers/handle-failure';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import {
  convertDate, getDelay, getDate, getRetirementWarning, getRetirementDate, getDateFromUTC, datePassed,
} from './helper';

const RetirementForm = ({
  retirementID, redirect, url, timezone,
}) => {
  const retireItems = JSON.parse(retirementID);
  const tz = timezone;

  const [{ initialValues, isLoading }, setState] = useState({ isLoading: !!retireItems });
  const [showTimeField, setShowTimeField] = useState(false);
  const [showDateError, setShowDateError] = useState(false);

  const onSubmit = ({
    formMode, retirementDate, retirementTime, retirementWarning, days, weeks, months, hours,
  }) => {
    let NotEmpty = true;
    if (Array.isArray(retirementDate)) {
      if (retirementDate.length === 0) {
        NotEmpty = false;
      }
    }

    if ((retirementDate || formMode === 'delay') && NotEmpty) {
      miqSparkleOn();

      const retirementWarn = getRetirementWarning(retirementWarning);
      let tempDate = getRetirementDate(retirementDate);

      let date;
      if (formMode === 'delay') {
        date = getDelay(hours, days, weeks, months);
      } else {
        date = getDate(tempDate, retirementTime);
      }

      if (datePassed(date)) {
        setShowDateError(true);
        miqSparkleOff();
      } else {
        // Keep temp date as original date relative to user's timezone then convert date to manageiq timezone for posting data
        tempDate = date;
        date = convertDate(date, tz.tzinfo.info.identifier);

        const resources = retireItems.map((id) => ({
          id,
          date,
          warn: retirementWarn,
        }));

        API.post(url, { action: 'request_retire', resources }).then(() => {
          const message = sprintf(__(`Retirement date set to %s`), tempDate.toLocaleString());
          miqRedirectBack(message, 'success', redirect);
        }).catch(miqSparkleOff);
      }
    } else if (retirementDate === undefined || NotEmpty === false) {
      miqSparkleOn();

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
          retirementDate = getDateFromUTC(retires_on, tz.tzinfo.info.identifier);
          retirementTime = retirementDate;
          setShowTimeField(true);
        } else {
          retirementTime = moment().startOf('D')._d;
          setShowTimeField(false);
        }
        console.log(retires_on);
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
        schema={createSchema(showTimeField, setShowTimeField, showDateError)}
        onSubmit={onSubmit}
        canReset={!!retireItems}
        onCancel={onCancel}
        onReset={() => {
          add_flash(__('All changes have been reset'), 'warn');
          // If there is an initial value for retirement date then show time and warning fields on reset.
          // If initial value for date is empty then we don't need to show these fields.
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
