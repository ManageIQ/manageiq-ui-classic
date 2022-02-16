import { componentTypes, validatorTypes } from '@@ddf';
import { API } from '../../http_api';

let showSubnets = false;

const emsUrl = '/api/providers?expand=resources&attributes=id,name,supports_create_network_router,type&filter[]=supports_create_network_router=true';

const changeValue = (value, loadSchema, emptySchema) => {
  if (value === '-1') {
    emptySchema();
  } else {
    API.options(`/api/network_routers?ems_id=${value}`).then(loadSchema({}, value));

    API.get(emsUrl).then(({ resources }) => {
      // eslint-disable-next-line array-callback-return
      resources.map((provider) => {
        if (provider.id === value && provider.type === 'ManageIQ::Providers::Openstack::NetworkManager') {
          showSubnets = true;
        }
      });
    });
  }
};

const networkManagers = () => API.get(emsUrl).then(({ resources }) => {
  let networkManagersOptions = [];
  networkManagersOptions = resources.map(({ id, name }) => ({ label: name, value: id }));
  networkManagersOptions.unshift({ label: `<${__('Choose')}>`, value: '-1' });
  return networkManagersOptions;
});

function createSchema(routerId, providerFields = [], subnets, loadSchema, emptySchema) {
  if (subnets) showSubnets = true;
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
      isDisabled: !!routerId,
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
  ...(showSubnets ? [
    {
      component: componentTypes.SELECT,
      id: 'cloud_subnet_id',
      name: 'cloud_subnet_id',
      key: `subnet-${subnets}`,
      label: __('Fixed IPs Subnet'),
      placeholder: __('<Choose>'),
      includeEmpty: true,
      clearOnUnmount: true,
      condition: {
        and: [
          {
            when: 'enable',
            is: true,
          },
          {
            when: 'cloud_network_id',
            isNotEmpty: true,
          },
        ],
      },
      options: subnets,
    },
  ] : []),
  ];
  return { fields };
}

export default createSchema;
