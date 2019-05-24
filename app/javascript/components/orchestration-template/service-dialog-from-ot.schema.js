import { componentTypes } from '@data-driven-forms/react-form-renderer';
import { API } from '../../http_api';
import debouncePromise from '../../helpers/promise-debounce';

const asyncValidator = label => API.get(`/api/service_dialogs?filter[]=label=${label}`)
  .then(({ subcount }) => {
    if (!label) {
      return __('Required');
    }
    if (subcount !== 0) {
      return __('Name has already been taken');
    }
    return undefined;
  });

const asyncValidatorDebounced = debouncePromise(asyncValidator);

const serviceDialogFromOtSchema = ({
  fields: [{
    component: componentTypes.TEXT_FIELD,
    name: 'label',
    label: __('Service Dialog Name'),
    isRequired: true,
    validateOnMount: true,
    validate: [asyncValidatorDebounced],
  }],
});

export default serviceDialogFromOtSchema;
