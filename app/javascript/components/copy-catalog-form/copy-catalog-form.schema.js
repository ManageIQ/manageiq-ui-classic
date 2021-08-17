import { componentTypes } from '@@ddf';
import debouncePromise from '../../helpers/promise-debounce';
import { http } from '../../http_api';

export const asyncValidator = (value) =>
  http.get('/catalog/servicetemplates_names')
    .then((json) => {
      if (json.names.includes(value)) {
        throw __('Name has already been taken');
      }
      if (value === '' || value === undefined) {
        throw __("Name can't be blank");
      }
      return undefined;
    });
const asyncValidatorDebounced = debouncePromise(asyncValidator);

function createSchema() {
  const fields = [
    {
      component: componentTypes.TEXT_FIELD,
      id: 'name',
      name: 'name',
      validate: [
        (value) => asyncValidatorDebounced(value),
      ],
      label: __('Name'),
      maxLength: 40,
      autoFocus: true,
      validateOnMount: true,
    },
    {
      component: componentTypes.CHECKBOX,
      id: 'copy_tags',
      name: 'copy_tags',
      label: __('Copy Tags'),
    }];
  return { fields };
}

export default createSchema;
