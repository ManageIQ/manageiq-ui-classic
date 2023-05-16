import React, { useState, useEffect } from 'react';
import MiqFormRenderer from '@@ddf';
import createSchema from './schema';
import NotificationMessage from '../notification-message';
import { timeZoneData } from '../schedule-form/helper';
// import handleFailure from '../../helpers/handle-failure';

const DiagnosticsCURepairForm = () => {
  const [data, setData] = useState({
    isLoading: true,
    timezones: undefined,
    response: undefined,
  });

  useEffect(() => {
    API.get('/api').then(({ timezones }) => {
      setData({
        ...data,
        isLoading: false,
        timezones: timeZoneData(timezones),
      });
    });
  }, []);

  /** Function to append 0 to beginning of a number if it is a single digit. */
  const padStart = (number) => String(number).padStart(2, '0');

  /** This function format the date. */
  const formatDate = (date) => {
    const newDate = new Date(date[0]);
    return `${padStart(newDate.getMonth() + 1)}/${padStart(newDate.getDate())}/${newDate.getFullYear()}`;
  };

  const onSubmit = (values) => {
    const data = {
      timezone: values.timezone,
      start_date: formatDate(values.startDate),
      end_date: formatDate(values.endDate),
    };
    http.post(`/ops/cu_repair?button=submit`, data, { skipErrors: [400, 500] })
      .then(({ status, message }) => {
        ['startDate', 'endDate'].forEach((fieldName) => {
          document.getElementById(fieldName).value = '';
        });
        setData({
          ...data,
          response: { status, message },
        });
      });
  };

  const renderMessage = ({ status, message }) => <NotificationMessage type={status} message={message} />;

  return (
    <>
      { data.response && renderMessage(data.response) }
      { !data.isLoading && (
        <MiqFormRenderer
          schema={createSchema(data.timezones)}
          onSubmit={onSubmit}
        />
      )}
      {
        `${__('Note')} : ${__('Gap Collection is only available for VMware vSphere Infrastructures')}`
      }
    </>
  );
};

export default DiagnosticsCURepairForm;
