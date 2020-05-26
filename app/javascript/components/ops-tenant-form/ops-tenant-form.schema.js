import { componentTypes, validatorTypes } from '@@ddf';
import debouncePromise from '../../helpers/promise-debounce';
import { API } from '../../http_api';

export const asyncValidator = (value = '', ancestry, itemId) =>
  API.get(`/api/tenants?filter[]=name=${value}&expand=resources`)
    .then((json) => {
      if (json.resources.find(({ id, name }) => name === value && id !== itemId)) {
        return __('Name has already been taken');
      }
      if (value === '' || value === undefined) {
        return __('Required');
      }
      return undefined;
    });

const asyncValidatorDebounced = debouncePromise(asyncValidator);

const createSchema = (newRecord, showUseConfig, ancestry, itemId) => {
  let fields = [{
    component: componentTypes.TEXT_FIELD,
    name: 'name',
    label: 'Name',
    isRequired: true,
    validate: [value => asyncValidatorDebounced(value, ancestry, itemId)],
    validateOnMount: true,
    autoFocus: true,
  }, {
    component: componentTypes.TEXT_FIELD,
    name: 'description',
    label: 'Description',
    isRequired: true,
    validate: [{ type: validatorTypes.REQUIRED }],
    validateOnMount: true,
  }];

  if (!newRecord && showUseConfig) {
    fields.push({
      component: componentTypes.SWITCH,
      name: 'use_config_for_attributes',
      label: 'Use Configuration Settings',
      onText: __('Yes'),
      offText: __('No'),
    });

    const enabledName = {
      ...fields[0],
      isDisabled: false,
      condition: {
        when: 'use_config_for_attributes',
        is: false,
      },
    };

    const disabledName = {
      component: componentTypes.SUB_FORM,
      name: 'disabled-placeholder',
      fields: [{
        ...fields[0],
        isDisabled: true,
      }],
      condition: {
        when: 'use_config_for_attributes',
        is: true,
      },
    };
    fields = [
      enabledName,
      disabledName,
      ...fields.slice(1),
    ];
  }
  return {
    fields,
  };
};

export default createSchema;
