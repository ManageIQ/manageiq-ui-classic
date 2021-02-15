import { componentTypes, validatorTypes } from '@@ddf';

const emsUrl = '/api/providers?expand=resources&attributes=id,name,supports_cloud_subnet_create&filter[]=supports_cloud_subnet_create=true';

const createSchema = (edit, fields = [], loadSchema) => ({
  fields: [
    {
      component: componentTypes.SELECT,
      name: 'ems_id',
      id: 'ems_id',
      label: __('Network Manager'),
      onChange: (value) => API.options(`/api/cloud_subnets?ems_id=${value}`).then(loadSchema()),
      loadOptions: () => API.get(emsUrl).then(({ resources }) => resources.map(({ id, name }) => ({ label: name, value: id }))),
      includeEmpty: true,
      isDisabled: edit,
      isRequired: true,
      validate: [{ type: validatorTypes.REQUIRED }],
    },
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
    ...fields,
  ],
});

export default createSchema;
