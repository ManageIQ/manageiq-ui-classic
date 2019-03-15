import { componentTypes, validatorTypes } from '@data-driven-forms/react-form-renderer';

import { createVMwareTabs, createVMwareGeneralFields } from './cloud-vmware-provider.schema';
import { createEc2EndpointsFields, createEc2GeneralFields } from './cloud-ec2-provider.schema';
import { createAzureEndpointsFields, createAzureGeneralFields } from './cloud-azure-provider.schema';
import { createOpenstackTabs, createOpenStackGeneralFields } from './cloud-openstack-provider.schema';

const generalFields = (emsTypes, serverZones, providerRegions, openStackApiVersion, openstackInfraProviders, vmWareCloudApiVersions) => [[
  {
    component: componentTypes.TEXT_FIELD,
    name: 'name',
    label: __('Name'),
    validateOnMount: true,
    validate: [{
      type: validatorTypes.REQUIRED,
    }],
  }, {
    component: componentTypes.SELECT,
    name: 'type',
    label: __('Type'),
    placeholder: `<${__('Choose')}>`,
    options: emsTypes,
  },
  ...createEc2GeneralFields(providerRegions.ec2),
  ...createAzureGeneralFields(providerRegions.azure),
  ...createOpenStackGeneralFields(openStackApiVersion, openstackInfraProviders),
  ...createVMwareGeneralFields(vmWareCloudApiVersions),
  {
    component: componentTypes.SELECT,
    name: 'zone_id',
    label: __('Zone'),
    options: serverZones,
    validateOnMount: true,
    validate: [{
      type: 'required-validator',
    }],
  }, {
    component: componentTypes.SWITCH,
    label: __('Tenant Mapping Enabled'),
    name: 'ems_tenant_mapping_enabled',
    bsSize: 'mini',
    onText: __('Yes'),
    offText: __('No'),
    condition: {
      when: 'type',
      is: 'ManageIQ::Providers::Openstack::CloudManager',
    },
  },
]];

const createSchema = (
  emsTypes,
  serverZones,
  providerRegions,
  openStackApiVersion,
  openstackInfraProviders,
  vmWareCloudApiVersions,
  openstackSecurityProtocols,
  amqpSecurityProtocol,
) => ({
  fields: [
    ...generalFields(emsTypes, serverZones, providerRegions, openStackApiVersion, openstackInfraProviders, vmWareCloudApiVersions),
    {
      component: 'hr',
      name: 'tabs-separator',
    },
    ...createEc2EndpointsFields(),
    ...createAzureEndpointsFields(),
    ...createOpenstackTabs(openstackSecurityProtocols, amqpSecurityProtocol),
    ...createVMwareTabs(amqpSecurityProtocol),
  ],
});

export default createSchema;
