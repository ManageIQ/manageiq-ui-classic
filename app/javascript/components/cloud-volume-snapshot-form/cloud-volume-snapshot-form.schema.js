/* eslint-disable no-restricted-syntax */
import { componentTypes} from '@data-driven-forms/react-form-renderer';

function createSchema (recordId) {
  const fields = [{
    component: componentTypes.SUB_FORM,
    title: __('Basic Information'),
    id: 'basic-information',
    name: 'basic-information',
    fields: [
      {
        component: componentTypes.TEXT_FIELD,
        id: 'name',
        name: 'name',
        label: __('Snapshot Name'),
        maxLength: 50,
      }],
  },
  ];
  return { fields };
}

export default createSchema;