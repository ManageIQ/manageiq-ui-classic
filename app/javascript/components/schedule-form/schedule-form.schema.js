/* eslint-disable camelcase */
import { componentTypes } from '@@ddf';
import { scheduleFormFields } from './schedule-form-fields';

export const createSchema = (_recordId, actionOptions, filterOptions, data, setData) => {
  const formFields = scheduleFormFields(actionOptions, filterOptions, setData, data);

  const fields = [
    {
      component: componentTypes.SUB_FORM,
      name: 'BasicInformation',
      title: __('Basic Information'),

      fields: [
        formFields.name(),
        formFields.description(),
        formFields.active(),
        formFields.action(),
        formFields.filter(),
        formFields.target(),
        formFields.zone(),
        formFields.objectDetails(),
        formFields.system(),
        formFields.objectMessage(),
        formFields.objectRequest(),
        formFields.objectAttributes(),
        formFields.objectType(),
        formFields.objectField(),
        formFields.attributeValue(),
        formFields.run(),
        formFields.timerValue(),
        formFields.timezone(),
        formFields.startDate(),
        formFields.startTime(),
      ],
    },
  ];
  return { fields };
};
