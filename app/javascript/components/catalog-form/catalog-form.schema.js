import { componentTypes } from '@data-driven-forms/react-form-renderer';
import debouncePromise from '../../helpers/promise-debounce';
import { API } from '../../http_api';

export const asyncValidator = value => API.get(`/api/service_catalogs?expand=resources&filter[]=name=${value}`)
  .then((json) => {
    if (json.resources.length > 0) {
      return __('Name has already been taken');
    }
    if (value === '' || value === undefined) {
      return __("Name can't be blank");
    }
    return undefined;
  });

const asyncValidatorDebounced = debouncePromise(asyncValidator);

function createSchema(options) {
  const fields = [{
    component: componentTypes.SUB_FORM,
    title: __('Basic Info'),
    fields: [{
      component: componentTypes.TEXT_FIELD,
      name: 'name',
      validate: [
        asyncValidatorDebounced,
      ],
      label: __('Name'),
      maxLength: 40,
      autoFocus: true,
      validateOnMount: true,
    }, {
      component: componentTypes.TEXT_FIELD,
      name: 'description',
      label: __('Description'),
      maxLength: 60,
    }],
  }, {
    component: 'hr',
    name: 'hr',
  }, {
    component: componentTypes.SUB_FORM,
    title: __('Assign Catalog Items'),
    fields: [
      {
        component: 'dual-list-select',
        leftTitle: __('Unassigned:'),
        rightTitle: __('Selected:'),
        leftId: 'available_fields',
        rightId: 'selected_fields',
        allToRight: false,
        moveLeftTitle: __('Move Selected buttons left'),
        moveRightTitle: __('Move Selected buttons right'),
        size: 8,
        assignFieldProvider: true,
        options,
        name: 'service_templates',
      },
    ],
  }];
  return { fields };
}

export default createSchema;
