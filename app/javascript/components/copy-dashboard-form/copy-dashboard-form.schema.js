import { componentTypes, validatorTypes } from '@@ddf';
import debouncePromise from '../../helpers/promise-debounce';
import { http } from '../../http_api';

export const asyncValidator = (value, dashboardId, name) =>
  http.get(`/report/dashboard_get/${dashboardId}?name=${value}`)
    .then((json) => {
      if (value === name) {
        return __('Use different name');
      }
      if (json.length > 0) {
        return __('Name has already been taken');
      }
      if (value === '' || value === undefined) {
        return __("Name can't be blank");
      }
      return undefined;
    });

const asyncValidatorDebounced = debouncePromise(asyncValidator);

export default (miqGroups, name, dashboardId) => {
  const fields = [
    {
      component: componentTypes.SUB_FORM,
      title: __('Basic Info'),
      name: 'basic-info',
      fields: [
        {
          component: componentTypes.TEXT_FIELD,
          name: 'name',
          validate: [
            value => asyncValidatorDebounced(value, dashboardId, name),
          ],
          label: __('Name'),
          maxLength: 40,
          validateOnMount: true,
        },
        {
          component: componentTypes.TEXT_FIELD,
          name: 'description',
          validate: [{
            type: validatorTypes.REQUIRED,
            message: __('Required'),
          }],
          label: __('Description'),
          maxLength: 255,
          validateOnMount: true,
        },
        {
          component: componentTypes.SELECT_COMPONENT,
          name: 'group_id',
          options: miqGroups,
          label: __('Select Group'),
          placeholder: __('Nothing selected'),
          isSearchable: true,
          validate: [{
            type: validatorTypes.REQUIRED,
            message: __('Required'),
          }],
          validateOnMount: true,
        },
      ],
    },
  ];
  return { fields };
};
