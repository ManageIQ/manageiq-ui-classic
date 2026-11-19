import { PROVIDER_TYPES, getProviderConfig } from '../../../../../cypress/e2e/ui/Compute/Clouds/Providers/provider-factory';
import { generateProviderTests } from './provider-test-helpers';

jest.mock('../../../helpers/storage_manager/validate-names', () => jest.fn());

/**
 * Jest counterpart of cypress/e2e/ui/Compute/Clouds/Providers/cloud_provider.cy.js.
 * To cover another provider, add it to the registry in provider-factory.js and add one line here.
 */
describe('Cloud provider form', () => {
  generateProviderTests(getProviderConfig(PROVIDER_TYPES.VMWARE_VCLOUD));
  generateProviderTests(getProviderConfig(PROVIDER_TYPES.AMAZON_EC2));
  generateProviderTests(getProviderConfig(PROVIDER_TYPES.AZURE));
  generateProviderTests(getProviderConfig(PROVIDER_TYPES.AZURE_STACK));
  generateProviderTests(getProviderConfig(PROVIDER_TYPES.GOOGLE_COMPUTE));
  generateProviderTests(getProviderConfig(PROVIDER_TYPES.IBM_CLOUD_VPC));
  generateProviderTests(getProviderConfig(PROVIDER_TYPES.IBM_POWER_SYSTEMS));
  generateProviderTests(getProviderConfig(PROVIDER_TYPES.IBM_POWERVC));
  generateProviderTests(getProviderConfig(PROVIDER_TYPES.IBM_CIC));
  generateProviderTests(getProviderConfig(PROVIDER_TYPES.ORACLE_CLOUD));
  generateProviderTests(getProviderConfig(PROVIDER_TYPES.OPENSTACK));
});
