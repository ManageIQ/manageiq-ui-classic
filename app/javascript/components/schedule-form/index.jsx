/* eslint-disable camelcase */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Loading } from 'carbon-components-react';
import MiqFormRenderer from '../../forms/data-driven-form';
import { createSchema } from './schedule-form.schema';
import { API } from '../../http_api';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import { timeZoneData, setInitialData, getSubActionOptions } from './helper';

const ScheduleForm = ({
  recordId, actionOptions, filterOptions,
}) => {
  const newRecord = recordId === 'new';

  const [data, setData] = useState({
    initialValues: { filter_type: 'all', action_typ: 'vm' },
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
      hideTarget: true,
      hideFilterType: false,
      hideAutomationFields: true,
      hideObjectItem: true,
      hideEveryTime: true,
    },
    timerInit: 1,
  });

  useEffect(() => {
    if (newRecord) {
      API.get('/api').then(({ timezones }) => {
        setData({
          ...data,
          isLoading: false,
          options: {
            ...data.options, timezone: timeZoneData(timezones), subAction: getSubActionOptions('vm', filterOptions),
          },
        });
      });
    } else {
      setInitialData(recordId, data, setData, filterOptions);
    }
  }, [recordId]);

  const onSubmit = (formData) => {
    let ui_attrs = [];
    if (formData.action_typ === 'automation_request') {
      ui_attrs = [...Array(5)].map((_item, i) => ([formData[`attribute_${i + 1}`], formData[`value_${i + 1}`]]));
    }
    const values = {
      ...formData,
      start_date: typeof formData.start_date[0] === 'object' ? formData.start_date[0] : new Date(formData.start_date),
      start_hour: typeof (formData.start_hour) === 'object' ? formData.start_hour.getHours() : formData.start_hour.split(':')[0],
      start_min: typeof (formData.start_hour) === 'object' ? formData.start_hour.getMinutes() : formData.start_hour.split(':')[1],
      ui_attrs,
    };
    miqSparkleOn();
    const URL = `/ops/schedule_edit/${recordId}?button=save`;
    miqAjaxButton(URL, values);
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
