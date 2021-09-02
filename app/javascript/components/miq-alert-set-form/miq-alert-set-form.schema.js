import { componentTypes, validatorTypes } from '@data-driven-forms/react-form-renderer';
import {
  buildModeOptions,
} from './helper';

const tenantUrl = (emsId) => `/api/alert_definitions?expand=resources&attributes=id,description&filter[]=db=${emsId}`;
/*
const loadTenants = (emsId) => API.get(tenantUrl(emsId)).then(({ resources }) => resources.map(({
  id, description,
}) => ({
  label: description,
  value: id,
})));
*/
/*
const networkManagers = (emsId) => API.get(tenantUrl(emsId)).then(({ resources }) => {
  let networkManagersOptions = [];
  networkManagersOptions = resources.map(({ id, description }) => ({ label: description, value: id }));
  // networkManagersOptions.unshift({ label: `<${__('Choose')}>`, value: '-1' });
  return networkManagersOptions;
});
*/
const networkManagers = (emsId) => API.get(tenantUrl(emsId)).then(({ resources }) => {
  // let networkManagersOptions = [];
  // networkManagersOptions = resources.map(({ id, description }) => ({ label: description, value: id }));
  const parentTypeArray = [];
  resources.forEach((pt) => {
    const tempObj = { label: pt.description, value: pt.id };
    parentTypeArray.push(tempObj);
  });
  // networkManagersOptions.unshift({ label: `<${__('Choose')}>`, value: '-1' });
  return parentTypeArray;
});

// const myVar;
const myVar = networkManagers('MiddlewareServer');
function createSchema(fieldss, recordId, emsId, setState, promise, mode, loadSchema, alertState) {
  const idx = fieldss.findIndex((field) => field.name === 'volume_type');
  const subForm = [
    {
      component: componentTypes.SUB_FORM,
      id: 'subform-1',
      name: 'subform-1',
      title: __('Analysis Profiles'),
      condition: {
        when: 'active',
        is: true,
      },
      fields: [
        {
          component: componentTypes.TEXT_FIELD,
          id: 'options.scan_item_set_name',
          name: 'options.scan_item_set_name',
          label: __('Analysis Profiles'),
        },
      ],
    },
  ];

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
          validate: [{ type: validatorTypes.REQUIRED }],
          maxLength: 50,
        },
        {
          component: componentTypes.SELECT,
          id: 'mode',
          name: 'mode',
          label: __('Mode'),
          placeholder: __('<Choose>'),
          onChange: (emsId) => loadSchema(emsId),
          // onChange: (emsId) => setState((state) => ({ ...state, emsId })),
          options: buildModeOptions(mode),
          /*
          resolveProps: (props, { meta, input }, formOptions) => {
            if (meta.touched) {
              return {
                myVar: networkManagers('MiddlewareServer'),
              };
            }
          },
          */
          includeEmpty: true,
        },
        {
          component: componentTypes.DUAL_LIST_SELECT,
          id: 'alerts',
          name: 'alerts',
          key: `alerts-${emsId}`,
          label: __('Alert Selection'),
          leftTitle: __('Available Alerts:'),
          rightTitle: __('Profile Alerts:'),
          allToRight: false,
          moveLeftTitle: __('Remove'),
          moveAllLeftTitle: __('Remove All'),
          moveRightTitle: __('Add'),
          moveAllRightTitle: __('Add All'),
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
          options: alertState,
          /*
          options: [
            {
              label: 'Kickstart',
              value: 'CustomizationTemplateKickstart',
            },
          ],
*/
          // options: myVar,
          // options: networkManagers('MiddlewareServer'),
/*
          options: emsId ? networkManagers(emsId)
            : [{
              label: 'Kickstart',
              value: 'CustomizationTemplateKickstart',
            }],
    */      
          /*
          loadOptions: () =>
            promise.then(
              ({
                data: {
                  // eslint-disable-next-line camelcase
                  snmp_trap,
                },
              }) =>
                Object.values(snmp_trap).sort().map((key) => ({
                  value: key,
                  label: key,
                })),
            ),
            */
          /*
          options: [
            {
              label: 'Kickstart',
              value: 'CustomizationTemplateKickstart',
            },
            {
              label: 'Sysprep',
              value: 'CustomizationTemplateSysprep',
            },
            {
              label: 'CloudInit',
              value: 'CustomizationTemplateCloudInit',
            },
          ],
          */
        },
        {
          component: componentTypes.TEXTAREA,
          id: 'notes',
          name: 'notes',
          label: __('Notes'),
          maxLength: 512,
        }, ...subForm],
    },
  ];
  return { fields };
}

export default createSchema;
