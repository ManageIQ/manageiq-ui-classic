import { componentTypes } from '@data-driven-forms/react-form-renderer';
import debouncePromise from '../../helpers/promise-debounce';
import { API } from '../../http_api';

export const asyncValidator = (value, catalogId) =>
  API.get(`/api/service_catalogs?expand=resources&filter[]=name='${value ? value.replace('%', '%25') : ''}'`)
    .then((json) => {
      if (json.resources.find(({ id, name }) => name === value && id !== catalogId)) {
        return __('Name has already been taken');
      }
      if (value === '' || value === undefined) {
        return __("Name can't be blank");
      }
      return undefined;
    });

const asyncValidatorDebounced = debouncePromise(asyncValidator);

function createSchema(options, catalogId) {
  const fields = [{
    component: componentTypes.SUB_FORM,
    title: __('Basic Info'),
    name: 'basic-info',
    fields: [{
      component: componentTypes.TEXT_FIELD,
      name: 'name',
      validate: [
        value => asyncValidatorDebounced(value, catalogId),
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
    name: 'assign-catalog-items',
    fields: [
      {
        assignFieldProvider: true,
        component: 'dual-list-select',
        leftTitle: __('Unassigned:'),
        rightTitle: __('Selected:'),
        moveLeftTitle: __('Move Selected buttons left'),
        moveRightTitle: __('Move Selected buttons right'),
        name: 'service_templates',
        options,
        selectedSide: 'right',
        size: 8,
      },
    ],
  }];
  return { fields };
}

export default createSchema;
