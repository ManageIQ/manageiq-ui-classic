/* eslint-disable camelcase */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Loading } from 'carbon-components-react';
import MiqFormRenderer from '../../forms/data-driven-form';
import { createSchema } from './schedule-form.schema';
import { API } from '../../http_api';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import {
  timeZoneData, setInitialData, getSubActionOptions, getSubmitData, scheduleConst,
} from './helper';

const ScheduleForm = ({
  recordId, actionOptions, filterOptions,
}) => {
  const [data, setData] = useState({
    initialValues: { filter_type: scheduleConst.all, action_typ: scheduleConst.vm },
    isLoading: true,
    options: {
      timezone: [],
      subAction: [],
      target: [],
      zone: [],
      request: [],
      objectType: [],
      objectItem: [],
      everyTime: [],
    },
    displayFields: {
      target: true,
      filterType: false,
      automationFields: true,
      objectItem: true,
      everyTime: true,
    },
    timerInit: 1,
  });

  useEffect(() => {
    if (recordId === 'new') {
      API.get('/api').then(({ timezones }) => {
        setData({
          ...data,
          isLoading: false,
          options: {
            ...data.options,
            timezone: timeZoneData(timezones),
            subAction: getSubActionOptions(scheduleConst.vm, filterOptions),
          },
        });
      });
    } else {
      setInitialData(recordId, data, setData, filterOptions);
    }
  }, [recordId]);

  const onSubmit = (formData) => {
    miqSparkleOn();
    const URL = `/ops/schedule_edit/${recordId}?button=save`;
    miqAjaxButton(URL, getSubmitData(formData));
  };

  const onCancel = (data) => {
    miqSparkleOn();
    const returnURL = '/ops/explorer/';
    let message = sprintf(__('Add was cancelled by the user'));
    if (data.initialValues.name) {
      message = sprintf(__('Edit of "%s" was cancelled by the user'), data.initialValues.name);
    }
    miqRedirectBack(message, 'success', returnURL);
  };

  const customValidatorMapper = {
    customRequired: ({ hideField }) => (value) => (!value && !hideField ? __('Required') : undefined),
  };

  if (data.isLoading) return <Loading className="export-spinner" withOverlay={false} small />;
  return !data.isLoading && (
    <MiqFormRenderer
      schema={createSchema(recordId, actionOptions, filterOptions, data, setData)}
      initialValues={data.initialValues}
      canReset={(recordId !== 'new')}
      onSubmit={onSubmit}
      onCancel={() => onCancel(data)}
      validatorMapper={customValidatorMapper}
      buttonsLabels={{
        submitLabel: recordId ? __('Save') : __('Add'),
      }}
    />
  );
};

const optionProps = PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.any));

ScheduleForm.propTypes = {
  recordId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  actionOptions: optionProps,
  filterOptions: PropTypes.arrayOf(PropTypes.any),
};

ScheduleForm.defaultProps = {
  actionOptions: undefined,
  filterOptions: undefined,
};

export default ScheduleForm;
