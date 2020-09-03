import { componentTypes } from '@@ddf';
import { API } from '../../http_api';
import debouncePromise from '../../helpers/promise-debounce';

const asyncValidator = label => API.get(`/api/service_dialogs?filter[]=label=${label}`)
  .then(({ subcount }) => {
    if (!label) {
      throw __('Required');
    }
    if (subcount !== 0) {
      throw __('Name has already been taken');
    }
    return undefined;
  });

const asyncValidatorDebounced = debouncePromise(asyncValidator);

const serviceDialogFromOtSchema = ({
  fields: [{
    component: componentTypes.TEXT_FIELD,
    id: 'label',
    name: 'label',
    label: __('Service Dialog Name'),
    isRequired: true,
    validateOnMount: true,
    validate: [asyncValidatorDebounced],
  }],
});

export default serviceDialogFromOtSchema;
