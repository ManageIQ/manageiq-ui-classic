/* eslint-disable camelcase */
import { componentTypes, validatorTypes } from '@@ddf';

/** Schema for input parameter form */
export const inputParameterSchema = ({ available_datatypes }) => ({
  fields: [
    {
      component: componentTypes.TEXT_FIELD,
      id: 'inputName',
      name: 'inputName',
      label: __('Input Name'),
      isRequired: true,
      validate: [{ type: validatorTypes.REQUIRED }],
    },
    {
      component: componentTypes.SELECT,
      id: 'dataType',
      name: 'dataType',
      label: __('Choose'),
      options: available_datatypes.map((item) => ({ label: item, value: item })),
      isRequired: true,
      validate: [{ type: validatorTypes.REQUIRED }],
    },
    {
      component: componentTypes.TEXT_FIELD,
      id: 'defaultValue',
      name: 'defaultValue',
      label: __('Default Value'),
      isRequired: true,
      validate: [{ type: validatorTypes.REQUIRED }],
    },
  ],
});
