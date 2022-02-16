import { componentTypes, validatorTypes } from '@@ddf';
import { API } from '../../http_api';

const emsUrl = '/api/providers?&expand=resources&filter[]=supports_create_security_group=true';

const changeValue = (value, loadSchema, emptySchema) => {
  if (value === '-1') {
    emptySchema();
  } else {
    API.options(`/api/security_groups?ems_id=${value}`).then(loadSchema({}, value));
  }
};

const networkManagers = () => API.get(emsUrl).then(({ resources }) => {
  let networkManagersOptions = [];
  networkManagersOptions = resources.map(({ id, name }) => ({ label: name, value: id }));
  networkManagersOptions.unshift({ label: `<${__('Choose')}>`, value: '-1' });
  return networkManagersOptions;
});

function createSchema(securityGroupId, providerFields = [], subnets, loadSchema, emptySchema) {
  const fields = [{
    component: componentTypes.SUB_FORM,
    title: __('Network Management Provider'),
    id: 'network-provider',
    name: 'network-provider',
    fields: [{
      component: componentTypes.SELECT,
      id: 'ems_id',
      name: 'ems_id',
      label: __('Network Manager'),
      placeholder: `<${__('Choose')}>`,
      isDisabled: !!securityGroupId,
      validateOnMount: true,
      isRequired: true,
      validate: [{
        type: validatorTypes.REQUIRED,
        message: __('Required'),
      }],
      onChange: (value) => changeValue(value, loadSchema, emptySchema),
      loadOptions: networkManagers,
    }],
  },
  ...providerFields,
  ];
  return { fields };
}

export default createSchema;
