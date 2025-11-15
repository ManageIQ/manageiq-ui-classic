/**
 * Provider Factory - Creates configuration objects for different cloud provider types
 * This factory makes it easy to add new provider types with minimal code changes
 */

// Common field labels
export const FIELD_LABELS = {
  TYPE: 'Type',
  NAME: 'Name',
  ZONE: 'Zone',
  API_VERSION: 'API Version',
  HOSTNAME: 'Hostname (or IPv4 or IPv6 address)',
  API_PORT: 'API Port',
  USERNAME: 'Username',
  PASSWORD: 'Password',
  SECURITY_PROTOCOL: 'Security Protocol',
  REGION: 'Region',
  TENANT_ID: 'Tenant ID',
  DOMAIN_ID: 'Domain ID',
  USER_ID: 'User ID',
  PUBLIC_KEY: 'Public Key',
  PRIVATE_KEY: 'Private Key',
  IBM_CLOUD: 'IBM Cloud',
  SERVICE: 'Service',
  PROJECT_ID: 'Project ID',
  SUBSCRIPTION_ID: 'Subscription ID',
  ENDPOINT_URL: 'Endpoint URL',
  CLIENT_ID: 'Client ID',
  CLIENT_KEY: 'Client Key',
  ASSUME_ROLE_ARN: 'Assume role ARN',
  ACCESS_KEY_ID: 'Access Key ID',
  SECRET_ACCESS_KEY: 'Secret Access Key',
  PROVIDER_REGION: 'Provider Region',
  OPENSTACK_INFRA_PROVIDER: 'Openstack Infra Provider',
  POWERVC_API_ENDPOINT: 'PowerVC API Endpoint (Hostname or IPv4/IPv6 address)',
  ANSIBLE_ACCESS_METHOD: 'Ansible Access Method',
  TENANT_MAPPING_ENABLED: 'Tenant Mapping Enabled',
  API_USERNAME: 'API Username',
  API_PASSWORD: 'API Password',
  POWERVC: 'PowerVC',
};

// Common tab labels
export const TAB_LABELS = {
  DEFAULT: 'Default',
  EVENTS: 'Events',
  METRICS: 'Metrics',
  RSA_KEY_PAIR: 'RSA key pair',
  IMAGE_EXPORT: 'Image Export',
  SMARTSTATE_DOCKER: 'SmartState Docker',
};

// Common select options
export const SELECT_OPTIONS = {
  EVENT_STREAM_TYPE_AMQP: 'AMQP',
  EVENT_STREAM_TYPE_STF: 'STF',
  ENABLED: 'Enabled',
  API_VERSION_V3: 'Keystone V3',
  API_VERSION_V5: 'vCloud API 5.5',
  API_VERSION_V9: 'vCloud API 9.0',
  API_VERSION_2017: 'V2017_03_09',
  ZONE_DEFAULT: 'default',
  SECURITY_PROTOCOL_SSL: 'SSL',
  SECURITY_PROTOCOL_NON_SSL: 'Non-SSL',
};

// Common region options
export const REGION_OPTIONS = {
  CENTRAL_INDIA: 'Central India',
  CENTRAL_US: 'Central US',
  HYDERABAD: 'ap-hyderabad-1',
  MELBOURNE: 'ap-melbourne-1',
  AUSTRALIA: 'Australia (Sydney)',
  SPAIN: 'EU Spain (Madrid)',
  CANADA: 'Canada (Central)',
  ASIA_PACIFIC: 'Asia Pacific (Malaysia)',
};

// Common field values
export const FIELD_VALUES = {
  TEST_NAME: 'Test Name:',
  TENANT_ID: '101',
  SUBSCRIPTION_ID: 'z565815f-05b6-402f-1999-045155da7dq4',
  ENDPOINT_URL: '/api',
  CLIENT_ID: 'manageiq.example.com',
  CLIENT_KEY: 'test_client_key',
  PORT: '3000',
  USERNAME: 'admin@example.com',
  PASSWORD: 'password123',
  PRIVATE_KEY:
    '-----BEGIN PRIVATE KEY-----\nFAKE-PRIVATE-KEY-FOR-TESTING-ONLY-DO-NOT-USE\n-----END PRIVATE KEY-----',
  PUBLIC_KEY:
    '-----BEGIN PUBLIC KEY-----\nFAKE-PUBLIC-KEY-FOR-TESTING-ONLY-DO-NOT-USE\n-----END PUBLIC KEY-----',
  CLOUD_API_KEY: 'fake-ibm-cloud-api-key-for-testing',
  GUID: 'fake-guid-0000-0000-0000-000000000000',
  PROJECT_ID: 'fake-miq-project-id-for-testing',
  ASSUME_ROLE: 'arn:aws:iam::000000000000:role/FakeTestRole',
  ACCESS_KEY_ID: 'FAKE-ACCESS-KEY-ID-FOR-TESTING',
  SECRET_ACCESS_KEY: 'fake-secret-access-key-for-testing-do-not-use',
  DOMAIN_ID_DEFAULT: 'default',
  PROVIDER_REGION: 'RegionOne',
};

// Common flash message text snippets
export const FLASH_MESSAGES = {
  OPERATION_CANCELLED: 'cancelled',
  OPERATION_SAVED: 'saved',
  DELETE_OPERATION: 'delete',
  REFRESH_OPERATION: 'Refresh',
  REMOVE_PROVIDER_BROWSER_ALERT: 'removed',
};

// Common validation messages
export const VALIDATION_MESSAGES = {
  FAILED: 'Validation failed',
  SUCCESSFUL: 'Validation successful',
  NAME_ALREADY_EXISTS: 'already exists',
};

// Provider-specific validation error messages
export const VALIDATION_ERRORS = {
  VMWARE_VCLOUD: 'Socket error: no address for example.manageiq.com',
  ORACLE_CLOUD: 'The format of tenancy is invalid.',
  IBM_CLOUD_VPC: 'Provided API key could not be found.',
  IBM_POWER_SYSTEMS_VIRTUAL_SERVERS: 'IAM authentication failed',
  GOOGLE_COMPUTE_ENGINE: 'Invalid Google JSON key',
  AZURE_STACK: 'Failed to open TCP connection to example.manageiq.com:3000',
  AZURE: 'Incorrect credentials - no host component for URI',
  AMAZON_EC2: 'The security token included in the request is invalid.',
  IBM_POWERVC: 'unable to retrieve IBM PowerVC release version number',
  IBM_CIC: 'Login attempt timed out',
  OPENSTACK: 'Socket error: no address for example.manageiq.com',
};

// Provider types
export const PROVIDER_TYPES = {
  VMWARE_VCLOUD: 'VMware vCloud',
  AZURE_STACK: 'Azure Stack',
  IBM_CLOUD_VPC: 'IBM Cloud VPC',
  IBM_POWER_SYSTEMS: 'IBM Power Systems Virtual Servers',
  GOOGLE_COMPUTE: 'Google Compute Engine',
  ORACLE_CLOUD: 'Oracle Cloud',
  AZURE: 'Azure',
  AMAZON_EC2: 'Amazon EC2',
  IBM_POWERVC: 'IBM PowerVC',
  IBM_CIC: 'IBM Cloud Infrastructure Center',
  OPENSTACK: 'OpenStack',
};

/**
 * Creates a provider configuration object with all necessary properties
 * @param {string} type - The provider type
 * @param {Object} config - Additional configuration options
 * @returns {Object} - The provider configuration object
 */
function createProviderConfig(type, config = {}) {
  const baseConfig = {
    type,
    nameValue: `${FIELD_VALUES.TEST_NAME} ${type}`,
    validationError: VALIDATION_ERRORS[type.replace(/\s+/g, '_').toUpperCase()],
    formFields: {
      common: [
        {
          label: FIELD_LABELS.TYPE,
          id: 'type',
          type: 'select',
          required: true,
        },
        { label: FIELD_LABELS.NAME, id: 'name', type: 'text', required: true },
        {
          label: FIELD_LABELS.ZONE,
          id: 'zone_id',
          type: 'select',
          required: true,
        },
      ],
    },
    formValues: {
      common: {
        type,
        name: `${FIELD_VALUES.TEST_NAME} ${type}`,
        zone_id: SELECT_OPTIONS.ZONE_DEFAULT,
      },
    },
    fieldSelectionValues: {},
  };

  // Merge with provided config
  return { ...baseConfig, ...config };
}

/**
 * Creates a VMware vCloud provider configuration
 * @returns {Object} - The provider configuration
 */
function getVMwareVcloudProviderConfig() {
  return createProviderConfig(PROVIDER_TYPES.VMWARE_VCLOUD, {
    formFields: {
      default: [
        {
          label: FIELD_LABELS.API_VERSION,
          id: 'api_version',
          type: 'select',
          required: true,
        },
        {
          label: FIELD_LABELS.HOSTNAME,
          id: 'endpoints.default.hostname',
          type: 'text',
          required: true,
        },
        {
          label: FIELD_LABELS.API_PORT,
          id: 'endpoints.default.port',
          type: 'number',
          required: true,
        },
        {
          label: FIELD_LABELS.USERNAME,
          id: 'authentications.default.userid',
          type: 'text',
          required: true,
        },
        {
          label: FIELD_LABELS.PASSWORD,
          id: 'authentications.default.password',
          type: 'password',
          required: true,
          isPlaceholderInEditMode: true,
        },
      ],
      events: [
        {
          label: FIELD_LABELS.TYPE,
          id: 'event_stream_selection',
          type: 'select',
          required: false,
        },
        {
          label: FIELD_LABELS.SECURITY_PROTOCOL,
          id: 'endpoints.amqp.security_protocol',
          type: 'select',
          required: false,
        },
        {
          label: FIELD_LABELS.HOSTNAME,
          id: 'endpoints.amqp.hostname',
          type: 'text',
          required: false,
        },
        {
          label: FIELD_LABELS.API_PORT,
          id: 'endpoints.amqp.port',
          type: 'number',
          required: false,
        },
        {
          label: FIELD_LABELS.USERNAME,
          id: 'authentications.amqp.userid',
          type: 'text',
          required: false,
        },
        {
          label: FIELD_LABELS.PASSWORD,
          id: 'authentications.amqp.password',
          type: 'password',
          required: false,
          isPlaceholderInEditMode: true,
        },
      ],
    },
    formValues: {
      default: {
        api_version: SELECT_OPTIONS.API_VERSION_V5,
        'endpoints.default.port': FIELD_VALUES.PORT,
        'authentications.default.userid': FIELD_VALUES.USERNAME,
        'authentications.default.password': FIELD_VALUES.PASSWORD,
      },
    },
    fieldSelectionValues: {
      events: {
        event_stream_selection: [SELECT_OPTIONS.EVENT_STREAM_TYPE_AMQP],
      },
    },
    tabs: [TAB_LABELS.DEFAULT, TAB_LABELS.EVENTS],
  });
}

/**
 * Creates an Oracle Cloud provider configuration
 * @returns {Object} - The provider configuration
 */
function getOracleCloudProviderConfig() {
  return createProviderConfig(PROVIDER_TYPES.ORACLE_CLOUD, {
    formFields: {
      default: [
        {
          label: FIELD_LABELS.REGION,
          id: 'provider_region',
          type: 'select',
          required: true,
        },
        {
          label: FIELD_LABELS.TENANT_ID,
          id: 'uid_ems',
          type: 'text',
          required: true,
        },
        {
          label: FIELD_LABELS.USER_ID,
          id: 'authentications.default.userid',
          type: 'text',
          required: true,
        },
        {
          label: FIELD_LABELS.PRIVATE_KEY,
          id: 'authentications.default.auth_key',
          type: 'textarea',
          required: true,
          isPlaceholderInEditMode: true,
        },
        {
          label: FIELD_LABELS.PUBLIC_KEY,
          id: 'authentications.default.public_key',
          type: 'textarea',
          required: true,
        },
      ],
    },
    formValues: {
      default: {
        provider_region: REGION_OPTIONS.HYDERABAD,
        uid_ems: FIELD_VALUES.TENANT_ID,
        'authentications.default.userid': FIELD_VALUES.USERNAME,
        'authentications.default.auth_key': FIELD_VALUES.PRIVATE_KEY,
        'authentications.default.public_key': FIELD_VALUES.PUBLIC_KEY,
      },
    },
    tabs: [TAB_LABELS.DEFAULT],
  });
}

/**
 * Creates an IBM Cloud VPC provider configuration
 * @returns {Object} - The provider configuration
 */
function getIBMCloudVPCProviderConfig() {
  return createProviderConfig(PROVIDER_TYPES.IBM_CLOUD_VPC, {
    formFields: {
      default: [
        {
          label: FIELD_LABELS.REGION,
          id: 'provider_region',
          type: 'select',
          required: true,
        },
        {
          label: FIELD_LABELS.IBM_CLOUD,
          id: 'authentications.default.auth_key',
          type: 'password',
          required: true,
          isPlaceholderInEditMode: true,
        },
      ],
      metrics: [
        {
          label: FIELD_LABELS.TYPE,
          id: 'metrics_selection',
          type: 'select',
          required: false,
        },
        {
          label: FIELD_LABELS.IBM_CLOUD,
          id: 'endpoints.metrics.options.monitoring_instance_id',
          type: 'password',
          required: false,
        },
      ],
      events: [
        {
          label: FIELD_LABELS.TYPE,
          id: 'events_selection',
          type: 'select',
          required: false,
        },
        {
          label: FIELD_LABELS.IBM_CLOUD,
          id: 'authentications.events.auth_key',
          type: 'password',
          required: false,
        },
      ],
    },
    formValues: {
      default: {
        provider_region: REGION_OPTIONS.AUSTRALIA,
        'authentications.default.auth_key': FIELD_VALUES.CLOUD_API_KEY,
      },
    },
    fieldSelectionValues: {
      metrics: {
        metrics_selection: SELECT_OPTIONS.ENABLED,
      },
      events: {
        events_selection: SELECT_OPTIONS.ENABLED,
      },
    },
    tabs: [TAB_LABELS.DEFAULT, TAB_LABELS.METRICS, TAB_LABELS.EVENTS],
  });
}

/**
 * Creates an IBM Power Systems Virtual Servers provider configuration
 * @returns {Object} - The provider configuration
 */
function getIBMPowerSystemsProviderConfig() {
  return createProviderConfig(PROVIDER_TYPES.IBM_POWER_SYSTEMS, {
    formFields: {
      default: [
        {
          label: FIELD_LABELS.IBM_CLOUD,
          id: 'authentications.default.auth_key',
          type: 'password',
          required: true,
          isPlaceholderInEditMode: true,
        },
        {
          label: FIELD_LABELS.SERVICE,
          id: 'uid_ems',
          type: 'text',
          required: true,
        },
      ],
    },
    formValues: {
      default: {
        'authentications.default.auth_key': FIELD_VALUES.CLOUD_API_KEY,
        uid_ems: FIELD_VALUES.GUID,
      },
    },
    tabs: [TAB_LABELS.DEFAULT],
  });
}

/**
 * Creates a Google Compute Engine provider configuration
 * @returns {Object} - The provider configuration
 */
function getGoogleComputeEngineProviderConfig() {
  return createProviderConfig(PROVIDER_TYPES.GOOGLE_COMPUTE, {
    formFields: {
      default: [
        {
          label: FIELD_LABELS.PROJECT_ID,
          id: 'project',
          type: 'text',
          required: true,
        },
        {
          label: FIELD_LABELS.SERVICE,
          id: 'authentications.default.auth_key',
          type: 'textarea',
          required: true,
          isPlaceholderInEditMode: true,
        },
      ],
    },
    formValues: {
      default: {
        project: FIELD_VALUES.PROJECT_ID,
        'authentications.default.auth_key': `{"type":"service_account","project_id":"${FIELD_VALUES.PROJECT_ID}","private_key":"${FIELD_VALUES.PRIVATE_KEY}"}`,
      },
    },
    tabs: [TAB_LABELS.DEFAULT],
  });
}

/**
 * Creates an Azure Stack provider configuration
 * @returns {Object} - The provider configuration
 */
function getAzureStackProviderConfig() {
  return createProviderConfig(PROVIDER_TYPES.AZURE_STACK, {
    formFields: {
      default: [
        {
          label: FIELD_LABELS.TENANT_ID,
          id: 'uid_ems',
          type: 'text',
          required: true,
        },
        {
          label: FIELD_LABELS.SUBSCRIPTION_ID,
          id: 'subscription',
          type: 'text',
          required: true,
        },
        {
          label: FIELD_LABELS.API_VERSION,
          id: 'api_version',
          type: 'select',
          required: true,
        },
        {
          label: FIELD_LABELS.SECURITY_PROTOCOL,
          id: 'endpoints.default.security_protocol',
          type: 'select',
          required: true,
        },
        {
          label: FIELD_LABELS.HOSTNAME,
          id: 'endpoints.default.hostname',
          type: 'text',
          required: true,
        },
        {
          label: FIELD_LABELS.API_PORT,
          id: 'endpoints.default.port',
          type: 'number',
          required: true,
        },
        {
          label: FIELD_LABELS.USERNAME,
          id: 'authentications.default.userid',
          type: 'text',
          required: true,
        },
        {
          label: FIELD_LABELS.PASSWORD,
          id: 'authentications.default.password',
          type: 'password',
          required: true,
          isPlaceholderInEditMode: true,
        },
      ],
    },
    formValues: {
      default: {
        uid_ems: FIELD_VALUES.TENANT_ID,
        subscription: FIELD_VALUES.SUBSCRIPTION_ID,
        api_version: SELECT_OPTIONS.API_VERSION_2017,
        'endpoints.default.security_protocol':
          SELECT_OPTIONS.SECURITY_PROTOCOL_SSL,
        'endpoints.default.port': FIELD_VALUES.PORT,
        'authentications.default.userid': FIELD_VALUES.USERNAME,
        'authentications.default.password': FIELD_VALUES.PASSWORD,
      },
    },
    tabs: [TAB_LABELS.DEFAULT],
  });
}

/**
 * Creates an Azure provider configuration
 * @returns {Object} - The provider configuration
 */
function getAzureProviderConfig() {
  return createProviderConfig(PROVIDER_TYPES.AZURE, {
    formFields: {
      default: [
        {
          label: FIELD_LABELS.REGION,
          id: 'provider_region',
          type: 'select',
          required: true,
        },
        {
          label: FIELD_LABELS.TENANT_ID,
          id: 'uid_ems',
          type: 'text',
          required: true,
        },
        {
          label: FIELD_LABELS.SUBSCRIPTION_ID,
          id: 'subscription',
          type: 'text',
          required: true,
        },
        {
          label: FIELD_LABELS.ENDPOINT_URL,
          id: 'endpoints.default.url',
          type: 'text',
          required: true,
        },
        {
          label: FIELD_LABELS.CLIENT_ID,
          id: 'authentications.default.userid',
          type: 'text',
          required: true,
        },
        {
          label: FIELD_LABELS.CLIENT_KEY,
          id: 'authentications.default.password',
          type: 'password',
          required: true,
          isPlaceholderInEditMode: true,
        },
      ],
    },
    formValues: {
      default: {
        provider_region: REGION_OPTIONS.CENTRAL_INDIA,
        uid_ems: FIELD_VALUES.TENANT_ID,
        subscription: FIELD_VALUES.SUBSCRIPTION_ID,
        'endpoints.default.url': FIELD_VALUES.ENDPOINT_URL,
        'authentications.default.userid': FIELD_VALUES.CLIENT_ID,
        'authentications.default.password': FIELD_VALUES.CLIENT_KEY,
      },
    },
    tabs: [TAB_LABELS.DEFAULT],
  });
}

/**
 * Creates an Amazon EC2 provider configuration
 * @returns {Object} - The provider configuration
 */
function getAmazonEC2ProviderConfig() {
  return createProviderConfig(PROVIDER_TYPES.AMAZON_EC2, {
    formFields: {
      default: [
        {
          label: FIELD_LABELS.REGION,
          id: 'provider_region',
          type: 'select',
          required: true,
        },
        {
          label: FIELD_LABELS.ENDPOINT_URL,
          id: 'endpoints.default.url',
          type: 'text',
          required: true,
        },
        {
          label: FIELD_LABELS.ASSUME_ROLE_ARN,
          id: 'authentications.default.service_account',
          type: 'text',
          required: false,
        },
        {
          label: FIELD_LABELS.ACCESS_KEY_ID,
          id: 'authentications.default.userid',
          type: 'text',
          required: true,
        },
        {
          label: FIELD_LABELS.SECRET_ACCESS_KEY,
          id: 'authentications.default.password',
          type: 'password',
          required: true,
          isPlaceholderInEditMode: true,
        },
      ],
      smartstate_docker: [
        {
          label: FIELD_LABELS.USERNAME,
          id: 'authentications.smartstate_docker.userid',
          type: 'text',
          required: false,
        },
        {
          label: FIELD_LABELS.PASSWORD,
          id: 'authentications.smartstate_docker.password',
          type: 'password',
          required: false,
          isPlaceholderInEditMode: true,
        },
      ],
    },
    formValues: {
      default: {
        provider_region: REGION_OPTIONS.CANADA,
        'endpoints.default.url': FIELD_VALUES.ENDPOINT_URL,
        'authentications.default.service_account': FIELD_VALUES.ASSUME_ROLE,
        'authentications.default.userid': FIELD_VALUES.ACCESS_KEY_ID,
        'authentications.default.password': FIELD_VALUES.SECRET_ACCESS_KEY,
      },
    },
    tabs: [TAB_LABELS.DEFAULT, TAB_LABELS.SMARTSTATE_DOCKER],
  });
}

/**
 * Creates an IBM PowerVC provider configuration
 * @returns {Object} - The provider configuration
 */
function getIBMPowerVCProviderConfig() {
  return createProviderConfig(PROVIDER_TYPES.IBM_POWERVC, {
    formFields: {
      default: [
        {
          label: FIELD_LABELS.PROVIDER_REGION,
          id: 'provider_region',
          type: 'text',
          required: true,
        },
        {
          label: FIELD_LABELS.TENANT_MAPPING_ENABLED,
          id: 'tenant_mapping_enabled',
          type: 'checkbox',
          required: false,
        },
        {
          label: FIELD_LABELS.SECURITY_PROTOCOL,
          id: 'endpoints.default.security_protocol',
          type: 'select',
          required: true,
        },
        {
          label: FIELD_LABELS.POWERVC_API_ENDPOINT,
          id: 'endpoints.default.hostname',
          type: 'text',
          required: true,
        },
        {
          label: FIELD_LABELS.API_PORT,
          id: 'endpoints.default.port',
          type: 'number',
          required: true,
        },
        {
          label: FIELD_LABELS.API_USERNAME,
          id: 'authentications.default.userid',
          type: 'text',
          required: true,
        },
        {
          label: FIELD_LABELS.API_PASSWORD,
          id: 'authentications.default.password',
          type: 'password',
          required: true,
          isPlaceholderInEditMode: true,
        },
      ],
      events: [
        {
          label: FIELD_LABELS.TYPE,
          id: 'event_stream_selection',
          type: 'select',
          required: false,
        },
      ],
      rsa_key_pair: [
        {
          label: FIELD_LABELS.USERNAME,
          id: 'authentications.ssh_keypair.userid',
          type: 'text',
          required: false,
        },
        {
          label: FIELD_LABELS.PRIVATE_KEY,
          id: 'authentications.ssh_keypair.auth_key',
          type: 'textarea',
          required: false,
          isPlaceholderInEditMode: true,
        },
      ],
      image_export: [
        {
          label: FIELD_LABELS.POWERVC,
          id: 'authentications.node.userid',
          type: 'text',
          required: false,
        },
        {
          label: FIELD_LABELS.ANSIBLE_ACCESS_METHOD,
          id: 'authentications.node.options',
          type: 'select',
          required: false,
        },
        {
          label: FIELD_LABELS.POWERVC,
          id: 'authentications.node.auth_key_password',
          type: 'password',
          required: false,
        },
        {
          label: FIELD_LABELS.POWERVC,
          id: 'authentications.node.auth_key',
          type: 'textarea',
          required: false,
        },
      ],
    },
    formValues: {
      default: {
        uid_ems: FIELD_VALUES.DOMAIN_ID_DEFAULT,
        'endpoints.default.security_protocol':
          SELECT_OPTIONS.SECURITY_PROTOCOL_SSL,
        'endpoints.default.port': FIELD_VALUES.PORT,
        'authentications.default.userid': FIELD_VALUES.USERNAME,
        'authentications.default.password': FIELD_VALUES.PASSWORD,
      },
    },
    tabs: [
      TAB_LABELS.DEFAULT,
      TAB_LABELS.EVENTS,
      TAB_LABELS.RSA_KEY_PAIR,
      TAB_LABELS.IMAGE_EXPORT,
    ],
  });
}

/**
 * Creates an IBM Cloud Infrastructure Center provider configuration
 * @returns {Object} - The provider configuration
 */
function getIBMCICProviderConfig() {
  return createProviderConfig(PROVIDER_TYPES.IBM_CIC, {
    formFields: {
      default: [
        {
          label: FIELD_LABELS.PROVIDER_REGION,
          id: 'provider_region',
          type: 'text',
          required: true,
        },
        {
          label: FIELD_LABELS.API_VERSION,
          id: 'api_version',
          type: 'select',
          required: true,
        },
        {
          label: FIELD_LABELS.DOMAIN_ID,
          id: 'uid_ems',
          type: 'text',
          required: true,
        },
        {
          label: FIELD_LABELS.TENANT_MAPPING_ENABLED,
          id: 'tenant_mapping_enabled',
          type: 'checkbox',
          required: false,
        },
        {
          label: FIELD_LABELS.SECURITY_PROTOCOL,
          id: 'endpoints.default.security_protocol',
          type: 'select',
          required: true,
        },
        {
          label: FIELD_LABELS.HOSTNAME,
          id: 'endpoints.default.hostname',
          type: 'text',
          required: true,
        },
        {
          label: FIELD_LABELS.API_PORT,
          id: 'endpoints.default.port',
          type: 'number',
          required: true,
        },
        {
          label: FIELD_LABELS.USERNAME,
          id: 'authentications.default.userid',
          type: 'text',
          required: true,
        },
        {
          label: FIELD_LABELS.PASSWORD,
          id: 'authentications.default.password',
          type: 'password',
          required: true,
          isPlaceholderInEditMode: true,
        },
        {
          label: FIELD_LABELS.TYPE,
          id: 'event_stream_selection',
          type: 'select',
          required: false,
        },
        {
          label: FIELD_LABELS.HOSTNAME,
          id: 'endpoints.amqp.hostname',
          type: 'text',
          required: false,
        },
        {
          label: FIELD_LABELS.API_PORT,
          id: 'endpoints.amqp.port',
          type: 'number',
          required: false,
        },
        {
          label: FIELD_LABELS.USERNAME,
          id: 'authentications.amqp.userid',
          type: 'text',
          required: false,
        },
        {
          label: FIELD_LABELS.PASSWORD,
          id: 'authentications.amqp.password',
          type: 'password',
          required: false,
        },
        {
          label: FIELD_LABELS.USERNAME,
          id: 'authentications.ssh_keypair.userid',
          type: 'text',
          required: false,
        },
        {
          label: FIELD_LABELS.PRIVATE_KEY,
          id: 'authentications.ssh_keypair.auth_key',
          type: 'textarea',
          required: false,
          isPlaceholderInEditMode: true,
        },
      ],
    },
    formValues: {
      default: {
        provider_region: FIELD_VALUES.PROVIDER_REGION,
        api_version: SELECT_OPTIONS.API_VERSION_V3,
        uid_ems: FIELD_VALUES.DOMAIN_ID_DEFAULT,
        'endpoints.default.security_protocol':
          SELECT_OPTIONS.SECURITY_PROTOCOL_SSL,
        'endpoints.default.port': FIELD_VALUES.PORT,
        'authentications.default.userid': FIELD_VALUES.USERNAME,
        'authentications.default.password': FIELD_VALUES.PASSWORD,
      },
    },
    // Values used for field selection that conditionally show other fields
    fieldSelectionValues: {
      default: {
        api_version: SELECT_OPTIONS.API_VERSION_V3,
        // TODO: set up multiple value validation
        event_stream_selection: [
          SELECT_OPTIONS.EVENT_STREAM_TYPE_AMQP,
          SELECT_OPTIONS.EVENT_STREAM_TYPE_STF,
        ],
      },
    },
    tabs: [TAB_LABELS.DEFAULT],
  });
}

/**
 * Creates an OpenStack provider configuration
 * @returns {Object} - The provider configuration
 */
function getOpenStackProviderConfig() {
  return createProviderConfig(PROVIDER_TYPES.OPENSTACK, {
    formFields: {
      default: [
        {
          label: FIELD_LABELS.PROVIDER_REGION,
          id: 'provider_region',
          type: 'text',
          required: true,
        },
        {
          label: FIELD_LABELS.OPENSTACK_INFRA_PROVIDER,
          id: 'provider_id',
          type: 'text',
          required: false,
        },
        {
          label: FIELD_LABELS.API_VERSION,
          id: 'api_version',
          type: 'select',
          required: true,
        },
        {
          label: FIELD_LABELS.DOMAIN_ID,
          id: 'uid_ems',
          type: 'text',
          required: true,
        },
        {
          label: FIELD_LABELS.TENANT_MAPPING_ENABLED,
          id: 'tenant_mapping_enabled',
          type: 'checkbox',
          required: false,
        },
        {
          label: FIELD_LABELS.SECURITY_PROTOCOL,
          id: 'endpoints.default.security_protocol',
          type: 'select',
          required: true,
        },
        {
          label: FIELD_LABELS.HOSTNAME,
          id: 'endpoints.default.hostname',
          type: 'text',
          required: true,
        },
        {
          label: FIELD_LABELS.API_PORT,
          id: 'endpoints.default.port',
          type: 'number',
          required: true,
        },
        {
          label: FIELD_LABELS.USERNAME,
          id: 'authentications.default.userid',
          type: 'text',
          required: true,
        },
        {
          label: FIELD_LABELS.PASSWORD,
          id: 'authentications.default.password',
          type: 'password',
          required: true,
          isPlaceholderInEditMode: true,
        },
        {
          label: FIELD_LABELS.TYPE,
          id: 'event_stream_selection',
          type: 'select',
          required: false,
        },
        {
          label: FIELD_LABELS.HOSTNAME,
          id: 'endpoints.amqp.hostname',
          type: 'text',
          required: false,
        },
        {
          label: FIELD_LABELS.API_PORT,
          id: 'endpoints.amqp.port',
          type: 'number',
          required: false,
        },
        {
          label: FIELD_LABELS.USERNAME,
          id: 'authentications.amqp.userid',
          type: 'text',
          required: false,
        },
        {
          label: FIELD_LABELS.PASSWORD,
          id: 'authentications.amqp.password',
          type: 'password',
          required: false,
        },
        {
          label: FIELD_LABELS.USERNAME,
          id: 'authentications.ssh_keypair.userid',
          type: 'text',
          required: false,
        },
        {
          label: FIELD_LABELS.PRIVATE_KEY,
          id: 'authentications.ssh_keypair.auth_key',
          type: 'textarea',
          required: false,
          isPlaceholderInEditMode: true,
        },
      ],
    },
    formValues: {
      default: {
        provider_region: FIELD_VALUES.PROVIDER_REGION,
        api_version: SELECT_OPTIONS.API_VERSION_V3,
        uid_ems: FIELD_VALUES.DOMAIN_ID_DEFAULT,
        'endpoints.default.security_protocol':
          SELECT_OPTIONS.SECURITY_PROTOCOL_SSL,
        'endpoints.default.port': FIELD_VALUES.PORT,
        'authentications.default.userid': FIELD_VALUES.USERNAME,
        'authentications.default.password': FIELD_VALUES.PASSWORD,
      },
    },
    // Values used for field selection that conditionally show other fields
    fieldSelectionValues: {
      default: {
        api_version: SELECT_OPTIONS.API_VERSION_V3,
        // TODO: set up multiple value validation
        event_stream_selection: [
          SELECT_OPTIONS.EVENT_STREAM_TYPE_AMQP,
          SELECT_OPTIONS.EVENT_STREAM_TYPE_STF,
        ],
      },
    },
    tabs: [TAB_LABELS.DEFAULT],
  });
}

/**
 * Provider Registry - Maps provider types to their factory functions
 * This makes it easy to get a provider configuration by type
 */
const PROVIDER_REGISTRY = {
  [PROVIDER_TYPES.VMWARE_VCLOUD]: getVMwareVcloudProviderConfig,
  [PROVIDER_TYPES.ORACLE_CLOUD]: getOracleCloudProviderConfig,
  [PROVIDER_TYPES.IBM_CLOUD_VPC]: getIBMCloudVPCProviderConfig,
  [PROVIDER_TYPES.IBM_POWER_SYSTEMS]: getIBMPowerSystemsProviderConfig,
  [PROVIDER_TYPES.GOOGLE_COMPUTE]: getGoogleComputeEngineProviderConfig,
  [PROVIDER_TYPES.AZURE_STACK]: getAzureStackProviderConfig,
  [PROVIDER_TYPES.AZURE]: getAzureProviderConfig,
  [PROVIDER_TYPES.AMAZON_EC2]: getAmazonEC2ProviderConfig,
  [PROVIDER_TYPES.IBM_POWERVC]: getIBMPowerVCProviderConfig,
  [PROVIDER_TYPES.IBM_CIC]: getIBMCICProviderConfig,
  [PROVIDER_TYPES.OPENSTACK]: getOpenStackProviderConfig,
};

/**
 * Gets a provider configuration by type
 * @param {string} type - The provider type
 * @returns {Object} - The provider configuration
 */
export function getProviderConfig(type) {
  if (!PROVIDER_REGISTRY[type]) {
    cy.logAndThrowError(`Provider type "${type}" is not supported`);
  }
  return PROVIDER_REGISTRY[type]();
}
