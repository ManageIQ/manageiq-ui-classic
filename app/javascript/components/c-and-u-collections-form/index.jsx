import React, { useState, useEffect } from 'react';
import MiqFormRenderer from '@@ddf';
import createSchema from './schema';
import NotificationMessage from '../notification-message';
import { timeZoneData } from '../schedule-form/helper';
import { formatDate } from './helper';

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

  const onSubmit = (values) => {
    const paramsData = {
      timezone: values.timezone,
      start_date: formatDate(values.startDate),
      end_date: formatDate(values.endDate),
    };
    http.post(`/ops/cu_repair?button=submit`, paramsData, { skipErrors: [400, 500] })
      .then(({ status, message }) => {
        setData({
          ...data,
          isLoading: true,
          response: { status, message },
        });
        setTimeout(() => {
          setData({
            ...data,
            response: undefined,
            isLoading: false,
          });
        }, 1000);
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
