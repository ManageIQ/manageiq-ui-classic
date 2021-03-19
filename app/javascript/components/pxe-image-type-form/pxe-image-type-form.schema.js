import { componentTypes, validatorTypes } from '@@ddf';
import { parseCondition } from '@data-driven-forms/react-form-renderer';

const createSchema = () => {
  return ({
    fields: [
      {
        component: componentTypes.TEXT_FIELD,
        name: 'name',
        id: 'name',
        label: __('Name'),
        maxLength: 255,
        validate: [{ type: validatorTypes.REQUIRED }],
      },
      {
        component: componentTypes.SELECT,
        name: 'provision_type',
        id: 'provision_type',
        label: __('Type'),
        placeholder: __('<Choose>'),
        includeEmpty: true,
        options: [
            {
              'label': 'Host',
              'value': 'host'
            },
            {
              'label': 'VM and Instance',
              'value': 'vm'
            }
        ],
      },
    ],
  });
};

export default createSchema;
