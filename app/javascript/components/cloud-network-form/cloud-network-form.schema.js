import { componentTypes, validatorTypes } from '@@ddf';
import { API } from '../../http_api';

export const providersNetworkTypes = [
  { label: __('None') },
  { label: __('Local'), value: 'local' },
  { label: __('Flat'), value: 'flat' },
  { label: __('GRE'), value: 'gre' },
  { label: __('GENEVE'), value: 'geneve' },
  { label: __('VLAN'), value: 'vlan' },
  { label: __('VXLAN'), value: 'vxlan' },
];

const getTenants = id => API.get(`/api/providers/${id}/cloud_tenants?expand=resources&attributes=id,name`).then(data => [
  { label: `<${__('Choose')}>` },
  ...data.resources.map(({ id, name }) => ({ value: id, label: name })),
]);

function createSchema(ems, cloudNetworkId) {
  const dynamicPlacement = ems.map((tenant => ({
    component: componentTypes.SELECT,
    id: 'cloud_tenant',
    name: 'cloud_tenant',
    key: `id-${tenant.id}`,
    label: __('Cloud Tenant'),
    placeholder: `<${__('Choose')}>`,
    validateOnMount: true,
    validate: [{
      type: validatorTypes.REQUIRED,
      message: __('Required'),
    }],
    isDisabled: !!cloudNetworkId,
    loadOptions: () => getTenants(tenant.id),
    condition: {
      when: 'ems_id',
      is: tenant.id,
    },
    clearOnUnmount: true,
  })));

  const subForm = [
    {
      component: componentTypes.SUB_FORM,
      id: 'subform-1',
      name: 'subform-1',
      condition: {
        when: 'provider_network_type',
        is: 'flat',
      },
      fields: [
        {
          component: componentTypes.TEXT_FIELD,
          label: __('Physical Network'),
          maxLength: 128,
          id: 'provider_physical_network',
          name: 'provider_physical_network',
          isDisabled: !!cloudNetworkId,
          validateOnMount: true,
          validate: [{
            type: validatorTypes.REQUIRED,
            message: __('Required'),
          }],
        },
      ],
    }, {
      component: componentTypes.SUB_FORM,
      id: 'subform-2',
      name: 'subform-2',
      condition: {
        when: 'provider_network_type',
        is: 'gre',
      },
      fields: [
        {
          component: componentTypes.TEXT_FIELD,
          label: __('Segmentation ID'),
          maxLength: 128,
          id: 'provider_segmentation_id',
          name: 'provider_segmentation_id',
          isDisabled: !!cloudNetworkId,
          validateOnMount: true,
          validate: [{
            type: validatorTypes.REQUIRED,
            message: __('Required'),
          }],
        },
      ],
    }, {
      component: componentTypes.SUB_FORM,
      id: 'subform-3',
      name: 'subform-3',
      condition: {
        when: 'provider_network_type',
        is: 'vlan',
      },
      fields: [{
        component: componentTypes.TEXT_FIELD,
        label: __('Physical Network'),
        maxLength: 128,
        id: 'provider_physical_network',
        name: 'provider_physical_network',
        isDisabled: !!cloudNetworkId,
        validateOnMount: true,
        validate: [{
          type: validatorTypes.REQUIRED,
          message: __('Required'),
        }],
      },
      {
        component: componentTypes.TEXT_FIELD,
        label: __('Segmentation ID'),
        maxLength: 128,
        id: 'provider_segmentation_id',
        name: 'provider_segmentation_id',
        isDisabled: !!cloudNetworkId,
        validateOnMount: true,
        validate: [{
          type: validatorTypes.REQUIRED,
          message: __('Required'),
        }],
      },
      ],
    }, {
      component: componentTypes.SUB_FORM,
      id: 'subform-4',
      name: 'subform-4',
      condition: {
        when: 'provider_network_type',
        is: 'vxlan',
      },
      fields: [
        {
          component: componentTypes.TEXT_FIELD,
          label: __('Segmentation ID'),
          maxLength: 128,
          id: 'provider_segmentation_id',
          name: 'provider_segmentation_id',
          isDisabled: !!cloudNetworkId,
        },
      ],
    },
  ];

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
      validate: [{
        type: validatorTypes.REQUIRED,
        message: __('Required'),
      }],
      options: ems.map(({ id, name }) => ({ label: name, value: id })),
    }],
  }, {
    component: componentTypes.SUB_FORM,
    title: __('Placement'),
    id: 'placement',
    name: 'placement',
    condition: {
      when: 'ems_id',
      isNotEmpty: true,
    },
    fields: [...dynamicPlacement],
  }, {
    component: componentTypes.SUB_FORM,
    title: __('Network Provider Information'),
    id: 'provider-information',
    name: 'provider-information',
    condition: {
      when: 'cloud_tenant',
      isNotEmpty: true,
    },
    fields: [{
      component: componentTypes.SELECT,
      id: 'provider_network_type',
      name: 'provider_network_type',
      label: __('Provider Network Type'),
      placeholder: __('Nothing selected'),
      options: providersNetworkTypes,
      isDisabled: !!cloudNetworkId,
    }, ...subForm],
  }, {
    component: componentTypes.SUB_FORM,
    title: __('Network Information'),
    id: 'network-information',
    name: 'network-information',
    fields: [{
      component: componentTypes.TEXT_FIELD,
      id: 'name',
      name: 'name',
      validateOnMount: true,
      label: __('Network Name'),
      validate: [{
        type: validatorTypes.REQUIRED,
        message: __('Required'),
      }],
    }, {
      component: componentTypes.SWITCH,
      id: 'cloud_network_external_facing',
      name: 'external_facing',
      label: __('External Router'),
      bsSize: 'mini',
      onText: __('Yes'),
      offText: __('No'),
    }, {
      component: componentTypes.SWITCH,
      id: 'cloud_network_enabled',
      name: 'enabled',
      label: __('Administrative State'),
      bsSize: 'mini',
      onText: __('Up'),
      offText: __('Down'),
    }, {
      component: componentTypes.SWITCH,
      id: 'cloud_network_shared',
      name: 'shared',
      label: __('Shared'),
      bsSize: 'mini',
      onText: __('Yes'),
      offText: __('No'),
    }],
  }];
  return { fields };
}

export default createSchema;
