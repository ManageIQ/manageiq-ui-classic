import { componentTypes } from '@data-driven-forms/react-form-renderer';
import debouncePromise from '../../helpers/promise-debounce';
import { http } from '../../http_api';

export const asyncValidator = value =>
  http.get('/catalog/servicetemplates_names')
    .then((json) => {
      if (json.names.includes(value)) {
        return __('Name has already been taken');
      }
      if (value === '' || value === undefined) {
        return __("Name can't be blank");
      }
      return undefined;
    });
const asyncValidatorDebounced = debouncePromise(asyncValidator);

function createSchema() {
  const fields = [
    {
      component: componentTypes.TEXT_FIELD,
      name: 'name',
      validate: [
        value => asyncValidatorDebounced(value),
      ],
      label: __('Name'),
      maxLength: 40,
      autoFocus: true,
      validateOnMount: true,
    },
    {
      component: componentTypes.CHECKBOX,
      name: 'copy_tags',
      label: __('Copy Tags'),
    }];
  return { fields };
}

export default createSchema;
