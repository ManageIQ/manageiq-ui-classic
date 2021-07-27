import { componentTypes, validatorTypes } from '@@ddf';
import { API } from '../../http_api';

function createSchema(ems, cloudNetworkId, loadSchema, providerFields = []) {
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
      onChange: (value) => API.options(`/api/cloud_networks?ems_id=${value}`).then(loadSchema()),
      validate: [{
        type: validatorTypes.REQUIRED,
        message: __('Required'),
      }],
      options: providers.map(({ id, name }) => ({ label: name, value: id })),
    }],
  },
  ...providerFields,
  ];
  return { fields };
}

export default createSchema;
