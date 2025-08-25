import { componentTypes } from '@@ddf';
import { uniqueNameValidator } from '../helper';

export const createSchema = (usedNames, currentSecName) => ({
  fields: [
    {
      component: componentTypes.TEXT_FIELD,
      name: 'section_name',
      label: 'Section Name',
      className: 'section-name',
      validate: [uniqueNameValidator(usedNames, currentSecName)],
    },
    {
      component: componentTypes.TEXTAREA,
      name: 'section_description',
      label: __('Section description'),
      maxLength: 128,
      className: 'section-description',
    },
  ],
});
