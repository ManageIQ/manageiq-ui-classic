import { componentTypes } from '@@ddf';
import { scheduleFormFields } from './schedule-form-fields';

export const createSchema = (_recordId, actionOptions, filterOptions, data, setData) => {
  const formFields = scheduleFormFields(actionOptions, filterOptions, setData, data);
  const fields = [
    {
      component: componentTypes.SUB_FORM,
      name: 'BasicInformation',
      title: __('Basic Information'),
      className: 'schedule_form',
      fields: [formFields],
    },
  ];
  return { fields };
};
