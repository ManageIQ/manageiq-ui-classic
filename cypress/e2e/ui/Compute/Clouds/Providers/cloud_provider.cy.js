/* eslint-disable no-undef */
import { generateProviderTests } from '../../../../../support/commands/provider_helper_commands';
import { getProviderConfig, PROVIDER_TYPES } from './provider-factory';

describe('Automate Cloud Provider form operations: Compute > Clouds > Providers > Configuration > Add a New Cloud Provider', () => {
  beforeEach(() => {
    cy.login();
    cy.menu('Compute', 'Clouds', 'Providers');
    cy.toolbar('Configuration', 'Add a New Cloud Provider');
  });

  // Generate tests for VMware vCloud provider
  const vmwareVcloudConfig = getProviderConfig(PROVIDER_TYPES.VMWARE_VCLOUD);
  generateProviderTests(vmwareVcloudConfig);

  // Generate tests for Amazon EC2 provider
  const amazonEC2Config = getProviderConfig(PROVIDER_TYPES.AMAZON_EC2);
  generateProviderTests(amazonEC2Config);

  // Generate tests for Azure provider
  const azureConfig = getProviderConfig(PROVIDER_TYPES.AZURE);
  generateProviderTests(azureConfig);

  // Generate tests for Azure Stack provider (requires special handling)
  const azureStackConfig = getProviderConfig(PROVIDER_TYPES.AZURE_STACK);
  generateProviderTests(azureStackConfig);

  // Generate tests for Google Compute Engine provider
  const googleComputeConfig = getProviderConfig(PROVIDER_TYPES.GOOGLE_COMPUTE);
  generateProviderTests(googleComputeConfig);

  // Generate tests for IBM Cloud VPC provider
  const ibmCloudVpcConfig = getProviderConfig(PROVIDER_TYPES.IBM_CLOUD_VPC);
  generateProviderTests(ibmCloudVpcConfig);

  // Generate tests for IBM Power Systems Virtual Servers provider
  const ibmPowerSystemsConfig = getProviderConfig(
    PROVIDER_TYPES.IBM_POWER_SYSTEMS
  );
  generateProviderTests(ibmPowerSystemsConfig);

  // Generate tests for IBM PowerVC provider
  const ibmPowerVcConfig = getProviderConfig(PROVIDER_TYPES.IBM_POWERVC);
  generateProviderTests(ibmPowerVcConfig);

  // Generate tests for IBM Cloud Infrastructure Center provider
  const ibmCicConfig = getProviderConfig(PROVIDER_TYPES.IBM_CIC);
  generateProviderTests(ibmCicConfig);

  // Generate tests for Oracle Cloud provider
  const oracleCloudConfig = getProviderConfig(PROVIDER_TYPES.ORACLE_CLOUD);
  generateProviderTests(oracleCloudConfig);

  // Generate tests for OpenStack provider
  const openstackConfig = getProviderConfig(PROVIDER_TYPES.OPENSTACK);
  generateProviderTests(openstackConfig);
});
