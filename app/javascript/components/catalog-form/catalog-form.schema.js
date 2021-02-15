import { componentTypes } from '@@ddf';
import debouncePromise from '../../helpers/promise-debounce';
import { API } from '../../http_api';

export const asyncValidator = (value, catalogId) =>
  API.get(`/api/service_catalogs?expand=resources&filter[]=name='${value ? value.replace('%', '%25') : ''}'`)
    .then((json) => {
      if (json.resources.find(({ id, name }) => name === value && id !== catalogId)) {
        throw __('Name has already been taken');
      }
      if (value === '' || value === undefined) {
        throw __("Name can't be blank");
      }
      return undefined;
    });

const asyncValidatorDebounced = debouncePromise(asyncValidator);

const createSchema = (options, catalogId) => ({
  fields: [
    {
      component: componentTypes.TEXT_FIELD,
      id: 'name',
      name: 'name',
      validate: [
        (value) => asyncValidatorDebounced(value, catalogId),
      ],
      label: __('Name'),
      maxLength: 40,
      autoFocus: true,
      validateOnMount: true,
    },
    {
      component: componentTypes.TEXT_FIELD,
      id: 'description',
      name: 'description',
      label: __('Description'),
      maxLength: 60,
    },
    {
      component: componentTypes.DUAL_LIST_SELECT,
      id: 'service_templates',
      name: 'service_templates',
      label: __('Assign Catalog Items'),
      leftTitle: __('Unassigned:'),
      rightTitle: __('Selected:'),
      allToRight: false,
      moveLeftTitle: __('Remove'),
      moveAllLeftTitle: __('Remove All'),
      moveRightTitle: __('Add'),
      moveAllRightTitle: __('Add All'),
      options,
    },
  ],
});

export default createSchema;
