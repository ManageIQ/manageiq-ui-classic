import { componentTypes, validatorTypes } from '@@ddf';
import { API } from '../../http_api';

const emsUrl = '/api/providers?expand=resources&attributes=id,name,supports_cloud_subnet_create&filter[]=supports_cloud_subnet_create=true';
const networkManagers = () => API.get(emsUrl).then(({ resources }) => {
  let networkManagersOptions = [];
  networkManagersOptions = resources.map(({ id, name }) => ({ label: name, value: id }));
  networkManagersOptions.unshift({ label: `<${__('Choose')}>`, value: '-1' });
  return networkManagersOptions;
});

let empty = true;
let showError = false;

const createSchema = (edit, fields = [], loadSchema, emptySchema) => ({
  fields: [
    {
      component: componentTypes.SELECT,
      name: 'ems_id',
      id: 'ems_id',
      label: __('Network Manager'),
      onChange: (value) => {
        if (value !== '-1') {
          API.options(`/api/cloud_subnets?ems_id=${value}`).then(loadSchema());
          empty = false;
          showError = false;
        } else {
          emptySchema();
          empty = true;
          showError = true;
        }
      },
      loadOptions: networkManagers,
      isDisabled: edit,
      isRequired: true,
      validate: [{ type: validatorTypes.REQUIRED }],
    },
    ...(!empty ? [
      {
        component: componentTypes.TEXT_FIELD,
        name: 'name',
        id: 'name',
        label: __('Name'),
        isRequired: true,
        validate: [{ type: validatorTypes.REQUIRED }],
        condition: {
          when: 'ems_id',
          isNotEmpty: true,
        },
      },
      {
        component: componentTypes.TEXT_FIELD,
        name: 'cidr',
        id: 'cidr',
        label: __('CIDR'),
        isRequired: true,
        isDisabled: edit,
        validate: [{ type: validatorTypes.REQUIRED }], // TODO: pattern for validating IPv4/mask or IPv6/mask
        condition: {
          when: 'ems_id',
          isNotEmpty: true,
        },
      },
      {
        component: componentTypes.FIELD_ARRAY,
        name: 'dns_nameservers',
        id: 'dns_nameservers',
        label: __('DNS Servers'),
        noItemsMessage: __('None'),
        buttonLabels: {
          add: __('Add'),
          remove: __('Remove'),
        },
        AddButtonProps: {
          size: 'small',
        },
        RemoveButtonProps: {
          size: 'small',
        },
        fields: [{ // TODO: pattern for validating IPv4 or IPv6
          component: componentTypes.TEXT_FIELD,
        }],
        condition: {
          when: 'ems_id',
          isNotEmpty: true,
        },
      },
    ] : []),
    ...(showError ? [
      {
        id: 'networkWarning',
        component: componentTypes.PLAIN_TEXT,
        name: 'networkWarning',
        label: __('Please select a network manager.'),
      },
    ] : []),
    ...fields,
  ],
});

export default createSchema;
