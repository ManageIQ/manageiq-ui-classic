import React, { useState, useEffect } from 'react';
import { Loading } from '@carbon/react';
import MiqFormRenderer from '../../forms/data-driven-form';
import { createSchema } from './schedule-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import {
  timeZoneData,
  setInitialData,
  getSubActionOptions,
  getSubmitData,
  scheduleConst,
} from './helper';
import type {
  FormState,
  FilterOptionType,
  FormInitialValues,
  TimezoneType,
} from './schedule-form-types';

type ScheduleFormProps = {
  recordId: string | number;
  actionOptions?: string[][];
  filterOptions: FilterOptionType[];
};

const ScheduleForm: React.FC<ScheduleFormProps> = ({
  recordId,
  actionOptions,
  filterOptions,
}) => {
  const [data, setData] = useState<FormState>({
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
    filterValue: '',
  });

  useEffect(() => {
    if (recordId === 'new') {
      API.get<{ timezones: TimezoneType[] }>('/api').then(({ timezones }) => {
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

  const onSubmit = (formData: FormInitialValues) => {
    miqSparkleOn();
    const URL = `/ops/schedule_edit/${recordId}?button=save`;
    miqAjaxButton(URL, getSubmitData(formData));
  };

  const onCancel = (currentData: FormState) => {
    miqSparkleOn();
    const returnURL = '/ops/explorer/';
    let message = sprintf(__('Add was cancelled by the user'));
    if (currentData.initialValues.name) {
      message = sprintf(__('Edit of "%s" was cancelled by the user'), currentData.initialValues.name);
    }
    miqRedirectBack(message, 'success', returnURL);
  };

  const customValidatorMapper = {
    customRequired: ({ hideField }: { hideField?: boolean }) => (value: string | number | boolean) => {
      if (!value && !hideField) {
        return __('Required');
      }
      return null;
    },
  };

  if (data.isLoading) {
    return <Loading className="export-spinner" withOverlay={false} small />;
  }
  return (
    !data.isLoading && (
      <MiqFormRenderer
        schema={createSchema(actionOptions, filterOptions, data, setData)}
        initialValues={data.initialValues}
        canReset={recordId !== 'new'}
        onSubmit={onSubmit}
        onCancel={() => onCancel(data)}
        validatorMapper={customValidatorMapper}
        buttonsLabels={{
          submitLabel: recordId ? __('Save') : __('Add'),
        }}
      />
    )
  );
};

export default ScheduleForm;
