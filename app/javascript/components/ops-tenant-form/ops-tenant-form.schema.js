import { componentTypes, validatorTypes } from '@@ddf';
import debouncePromise from '../../helpers/promise-debounce';
import { API } from '../../http_api';

export const asyncValidator = (value = '', ancestry, itemId) =>
  API.get(`/api/tenants?filter[]=name=${value}&expand=resources`)
    .then((json) => {
      if (json.resources.find(({ id, name }) => name === value && id !== itemId)) {
        throw __('Name has already been taken');
      }
      if (value === '' || value === undefined) {
        throw __('Required');
      }
      return undefined;
    });

const asyncValidatorDebounced = debouncePromise(asyncValidator);

const createSchema = (newRecord, ancestry, itemId) => {
  let fields = [{
    component: componentTypes.TEXT_FIELD,
    id: 'name',
    name: 'name',
    label: 'Name',
    isRequired: true,
    validate: [(value) => asyncValidatorDebounced(value, ancestry, itemId)],
    validateOnMount: true,
    autoFocus: true,
  }, {
    component: componentTypes.TEXT_FIELD,
    id: 'description',
    name: 'description',
    label: 'Description',
    isRequired: true,
    validate: [{ type: validatorTypes.REQUIRED }],
    validateOnMount: true,
  }];

  return {
    fields,
  };
};

export default createSchema;
