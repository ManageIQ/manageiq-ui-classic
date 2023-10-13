import { componentTypes } from '@data-driven-forms/react-form-renderer';
import {
  buildModeOptions, changeTitle,
} from './helper';

function createSchema(fieldss, recordId, emsId, mode, loadSchema, alertState, alertOptions) {
  let selectedOptions = []; // in edit form, selectedOptions are options that are passed in when open the form for first time
  let editSelectedOptions = []; // in edit form, editSelectedOptions recorded all the selected options once the form is changed
  let selectedOptionsChanged = false; // in edit form, selectedOptionsChanged changes to true once there is a change in selected options

  if (recordId) {
    selectedOptions = alertOptions;
  } else {
    selectedOptions = [];
  }

  const fields = [
    {
      component: componentTypes.SUB_FORM,
      title: __('Basic Information'),
      id: 'basic-information',
      name: 'basic-information',
      fields: [
        {
          component: componentTypes.TEXT_FIELD,
          id: 'description',
          name: 'description',
          label: __('Description'),
          isRequired: true,
          maxLength: 255,
        },
        {
          component: componentTypes.SELECT,
          id: 'mode',
          name: 'mode',
          label: __('Mode'),
          placeholder: __('<Choose>'),
          isRequired: true,
          onChange: (emsId) => loadSchema(emsId, selectedOptions, editSelectedOptions, selectedOptionsChanged),
          options: buildModeOptions(mode),
          includeEmpty: true,
        },
        {
          component: componentTypes.SUB_FORM,
          id: 'alert-profile',
          name: 'alert-profile',
          fields: [
            {
              component: 'dual-list-select',
              id: 'alert_profile_alerts',
              name: 'alert_profile_alerts',
              key: `alerts-${emsId}`,
              label: __('Alert Selection'),
              leftTitle: emsId ? changeTitle(emsId, mode) : __('Available Alerts:'),
              rightTitle: __('Profile Alerts:'),
              allToRight: false,
              moveLeftTitle: __('Remove'),
              moveAllLeftTitle: __('Remove All'),
              moveRightTitle: __('Add'),
              moveAllRightTitle: __('Add All'),
              noValueTitle: __('No option selected'),
              noOptionsTitle: __('No available options'),
              filterOptionsTitle: __('Filter options'),
              filterValuesTitle: __('Filter values'),
              AddButtonProps: {
                size: 'small',
              },
              AddAllButtonProps: {
                size: 'small',
              },
              RemoveButtonProps: {
                size: 'small',
              },
              RemoveAllButtonProps: {
                size: 'small',
              },
              resolveProps: (props, { meta, input }) => {
                if (!meta.pristine && meta.dirty) {
                  editSelectedOptions = input.value;
                  selectedOptionsChanged = true;
                  return {
                  };
                } if (meta.pristine && !recordId) {
                  editSelectedOptions = [];
                  selectedOptionsChanged = false;
                  return {
                  };
                }
                return {};
              },
              options: alertState,
            },
          ],
        },
        {
          component: componentTypes.TEXTAREA,
          id: 'notes',
          name: 'notes',
          label: __('Notes'),
          maxLength: 512,
          resolveProps: (props, { meta, input }) => {
            if (meta.pristine && input.value === undefined) {
              return {
                helperText: `(0/512)`,
              };
            }
            if (meta.pristine) {
              return {
                helperText: `(${input.value.length}/512)`,
              };
            } if (meta.dirty) {
              return {
                helperText: `(${input.value.length}/512)`,
              };
            }
            return {};
          },
        }],
    },
  ];
  return { fields };
}

export default createSchema;
