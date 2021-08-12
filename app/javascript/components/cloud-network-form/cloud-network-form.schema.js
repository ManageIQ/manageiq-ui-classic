import { componentTypes, validatorTypes } from '@@ddf';
import { API } from '../../http_api';

let showError = false;

function changeValue(value, loadSchema, emptySchema) {
  if (value === '-1') {
    emptySchema();
    showError = true;
  } else {
    API.options(`/api/cloud_networks?ems_id=${value}`).then(loadSchema());
    showError = false;
  }
}

function createSchema(ems, cloudNetworkId, loadSchema, emptySchema, providerFields = []) {
  const providers = ems.filter((tenant) => tenant.type !== 'ManageIQ::Providers::Nuage::NetworkManager');
  const fields = [{
    component: componentTypes.SUB_FORM,
    title: __('Network Provider'),
    id: 'network-provider',
    name: 'network-provider',
    fields: [{
      component: componentTypes.SELECT,
      id: 'ems_id',
      name: 'ems_id',
      label: __('Network Manager'),
      placeholder: `<${__('Choose')}>`,
      isDisabled: !!cloudNetworkId,
      validateOnMount: true,
      isRequired: true,
      onChange: (value) => changeValue(value, loadSchema, emptySchema),
      validate: [{
        type: validatorTypes.REQUIRED,
        message: __('Required'),
      }],
      options: providers.map(({ id, name }) => ({ label: name, value: id })),
    }],
  },
  ...(showError ? [
    {
      id: 'networkWarning',
      component: componentTypes.PLAIN_TEXT,
      name: 'networkWarning',
      label: __('Please select a network manager.'),
    },
  ] : []),
  ...providerFields,
  ];
  return { fields };
}

export default createSchema;
