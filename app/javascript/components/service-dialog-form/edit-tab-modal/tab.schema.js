import { componentTypes } from '@@ddf';
import { uniqueNameValidator } from '../helper';

export const createSchema = (usedNames, currentTabName) => ({
  fields: [
    {
      component: componentTypes.TEXT_FIELD,
      name: 'tab_name',
      label: 'Tab Name',
      className: 'tab-name',
      validate: [uniqueNameValidator(usedNames, currentTabName)],
    },
    {
      component: componentTypes.TEXTAREA,
      name: 'tab_description',
      label: __('Tab description'),
      maxLength: 128,
      className: 'tab-description',
    },
  ],
});
