/* eslint-disable no-undef */
import { flashClassMap } from '../../../../../support/assertions/assertion_constants';

// Menu options
const COMPUTE_MENU_OPTION = 'Compute';
const CLOUDS_AUTOMATION_MENU_OPTION = 'Clouds';
const PROVIDERS_MENU_OPTION = 'Providers';

// Data table component URL
const CLOUD_PROVIDERS_LIST_URL = '/ems_cloud/show_list#/';

// Config options
const CONFIG_TOOLBAR_BUTTON = 'Configuration';
const ADD_PROVIDER_CONFIG_OPTION = 'Add a New Cloud Provider';
const EDIT_PROVIDER_CONFIG_OPTION = 'Edit Selected Cloud Provider';
const REMOVE_PROVIDER_CONFIG_OPTION = 'Remove Cloud Providers from Inventory';
const REFRESH_CONFIG_OPTION = 'Refresh Relationships and Power States';

// Provider types
const PROVIDER_TYPE_VMWARE_VCLOUD = 'VMware vCloud';
const PROVIDER_TYPE_AZURE_STACK = 'Azure Stack';
const PROVIDER_TYPE_IBM_CLOUD_VPC = 'IBM Cloud VPC';
const PROVIDER_TYPE_IBM_POWER_SYSTEMS = 'IBM Power Systems Virtual Servers';
const PROVIDER_TYPE_GOOGLE_COMPUTE = 'Google Compute Engine';
const PROVIDER_TYPE_ORACLE_CLOUD = 'Oracle Cloud';
const PROVIDER_TYPE_AZURE = 'Azure';
const PROVIDER_TYPE_AMAZON_EC2 = 'Amazon EC2';
const PROVIDER_TYPE_IBM_POWERVC = 'IBM PowerVC';
const PROVIDER_TYPE_IBM_CIC = 'IBM Cloud Infrastructure Center';
const PROVIDER_TYPE_OPENSTACK = 'OpenStack';

// Other select options
const EVENT_STREAM_TYPE_AMQP = 'AMQP';
const EVENT_STREAM_TYPE_STF = 'STF';
const ENABLED_SELECT_OPTION = 'Enabled';
const API_VERSION_TYPE_V3 = 'Keystone V3';
const API_VERSION_TYPE_V5 = 'vCloud API 5.5';
const API_VERSION_TYPE_V9 = 'vCloud API 9.0';
const API_VERSION_TYPE_2017 = 'V2017_03_09';
const ZONE_OPTION_DEFAULT = 'default';
const REGION_OPTION_CENTRAL_INDIA = 'Central India';
const REGION_OPTION_CENTRAL_US = 'Central US';
const REGION_OPTION_HYDERABAD = 'ap-hyderabad-1';
const REGION_OPTION_MELBOURNE = 'ap-melbourne-1';
const REGION_OPTION_AUSTRALIA = 'Australia (Sydney)';
const REGION_OPTION_SPAIN = 'EU Spain (Madrid)';
const REGION_OPTION_CANADA = 'Canada (Central)';
const REGION_OPTION_ASIA_PACIFIC = 'Asia Pacific (Malaysia)';
const SECURITY_PROTOCOL_SSL = 'SSL';
const SECURITY_PROTOCOL_NON_SSL = 'Non-SSL';

// Field labels
const TYPE_FIELD_LABEL = 'Type';
const NAME_FIELD_LABEL = 'Name';
const ZONE_FIELD_LABEL = 'Zone';
const API_VERSION_FIELD_LABEL = 'API Version';
const HOSTNAME_FIELD_LABEL = 'Hostname (or IPv4 or IPv6 address)';
const API_PORT_FIELD_LABEL = 'API Port';
const USERNAME_FIELD_LABEL = 'Username';
const PASSWORD_FIELD_LABEL = 'Password';
const SECURITY_PROTOCOL_FIELD_LABEL = 'Security Protocol';
const REGION_FIELD_LABEL = 'Region';
const TENANT_ID_FIELD_LABEL = 'Tenant ID';
const DOMAIN_ID_FIELD_LABEL = 'Domain ID';
const USER_ID_FIELD_LABEL = 'User ID';
const PUBLIC_KEY_FIELD_LABEL = 'Public Key';
const PRIVATE_KEY_FIELD_LABEL = 'Private Key';
const IBM_CLOUD_COMMON_FIELD_LABEL = 'IBM Cloud';
const SERVICE_COMMON_FIELD_LABEL = 'Service';
const PROJECT_ID_FIELD_LABEL = 'Project ID';
const SUBSCRIPTION_ID_FIELD_LABEL = 'Subscription ID';
const ENDPOINT_URL_FIELD_LABEL = 'Endpoint URL';
const CLIENT_ID_FIELD_LABEL = 'Client ID';
const CLIENT_KEY_FIELD_LABEL = 'Client Key';
const ASSUME_ROLE_ARN_FIELD_LABEL = 'Assume role ARN';
const ACCESS_KEY_ID_FIELD_LABEL = 'Access Key ID';
const SECRET_ACCESS_KEY_FIELD_LABEL = 'Secret Access Key';
const SMARTSTATE_DOCKER_TAB_LABEL = 'SmartState Docker';
const PROVIDER_REGION_FIELD_LABEL = 'Provider Region';
const OPENSTACK_INFRA_PROVIDER_FIELD_LABEL = 'Openstack Infra Provider';
const POWERVC_API_ENDPOINT_FIELD_LABEL =
  'PowerVC API Endpoint (Hostname or IPv4/IPv6 address)';
const ANSIBLE_ACCESS_METHOD_FIELD_LABEL = 'Ansible Access Method';
const TENANT_MAPPING_ENABLED_FIELD_LABEL = 'Tenant Mapping Enabled';
const API_USERNAME_FIELD_LABEL = 'API Username';
const API_PASSWORD_FIELD_LABEL = 'API Password';
const POWERVC_COMMON_FIELD_LABEL = 'PowerVC';

// Tab labels
const EVENTS_TAB_LABEL = 'Events';
const METRICS_TAB_LABEL = 'Metrics';
const RSA_KEY_PAIR_TAB_LABEL = 'RSA key pair';
const IMAGE_EXPORT_TAB_LABEL = 'Image Export';

// Field values
const TEST_NAME = 'Test Name:';
const AZURE_NAME_VALUE = `${TEST_NAME} ${PROVIDER_TYPE_AZURE}`;
const VMWARE_VCLOUD_NAME_VALUE = `${TEST_NAME} ${PROVIDER_TYPE_VMWARE_VCLOUD}`;
const ORACLE_CLOUD_NAME_VALUE = `${TEST_NAME} ${PROVIDER_TYPE_ORACLE_CLOUD}`;
const IBM_CLOUD_VPC_NAME_VALUE = `${TEST_NAME} ${PROVIDER_TYPE_IBM_CLOUD_VPC}`;
const IBM_POWER_SYSTEMS_VIRTUAL_SERVERS_NAME_VALUE = `${TEST_NAME} ${PROVIDER_TYPE_IBM_POWER_SYSTEMS}`;
const GOOGLE_COMPUTE_ENGINE_NAME_VALUE = `${TEST_NAME} ${PROVIDER_TYPE_GOOGLE_COMPUTE}`;
const AZURE_STACK_NAME_VALUE = `${TEST_NAME} ${PROVIDER_TYPE_AZURE_STACK}`;
const AMAZON_EC2_NAME_VALUE = `${TEST_NAME} ${PROVIDER_TYPE_AMAZON_EC2}`;
const IBM_POWERVC_NAME_VALUE = `${TEST_NAME} ${PROVIDER_TYPE_IBM_POWERVC}`;
const IBM_CIC_NAME_VALUE = `${TEST_NAME} ${PROVIDER_TYPE_IBM_CIC}`;
const OPENSTACK_NAME_VALUE = `${TEST_NAME} ${PROVIDER_TYPE_OPENSTACK}`;
const TENANT_ID_VALUE = '101';
const SUBSCRIPTION_ID_VALUE = 'z565815f-05b6-402f-1999-045155da7dq4';
const ENDPOINT_URL_VALUE = '/api';
const CLIENT_ID_VALUE = 'manageiq.example.com';
const CLIENT_KEY_VALUE = 'test_client_key';
const PORT_VALUE = '3000';
const USERNAME_VALUE = 'admin@example.com';
const PASSWORD_VALUE = 'password123';
const PRIVATE_KEY_VALUE =
  '-----BEGIN PRIVATE KEY-----\nMIIEvQIBAzApPugkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC\n-----END PRIVATE KEY-----';
const PUBLIC_KEY_VALUE =
  '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAz14iAAOCAQ8AMIIBCgKCAQEA\n-----END PUBLIC KEY-----';
const CLOUD_API_KEY_VALUE = 'ibm_cloud_api_key_k#157';
const GUID_VALUE = '723e4a67-e89b-1qd3-z486-920614074000';
const PROJECT_ID_VALUE = 'gcp-project-123456';
const ASSUME_ROLE_VALUE = 'arn:aws:iam::123456789012:role/ManageIQRole';
const ACCESS_KEY_ID_VALUE = 'AKIAIOSFODNN7EXAMPLE';
const SECRET_ACCESS_KEY_VALUE = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY';
const DOMAIN_ID_DEFAULT_VALUE = 'default';
const PROVIDER_REGION_VALUE = 'RegionOne';

// Flash message text snippets
const FLASH_MESSAGE_OPERATION_CANCELLED = 'cancelled';
const FLASH_MESSAGE_OPERATION_SAVED = 'saved';
const FLASH_MESSAGE_DELETE_OPERATION = 'delete';
const REFRESH_OPERATION_MESSAGE = 'Refresh';
const REMOVE_PROVIDER_BROWSER_ALERT_MESSAGE = 'removed';

// Other message snippets
const VALIDATION_FAILED_COMMON_ERROR = 'Validation failed';
const VALIDATION_SUCCESSFUL_COMMON_MESSAGE = 'Validation successful';
const IBM_POWER_SYSTEMS_VIRTUAL_SERVERS_VALIDATION_ERROR =
  'IAM authentication failed';
const VMWARE_VCLOUD_VALIDATION_ERROR =
  'Socket error: no address for example.manageiq.com';
const ORACLE_CLOUD_VALIDATION_ERROR = 'The format of tenancy is invalid.';
const IBM_CLOUD_VPC_VALIDATION_ERROR = 'Provided API key could not be found.';
const GOOGLE_COMPUTE_ENGINE_VALIDATION_ERROR = 'Invalid Google JSON key';
const AZURE_STACK_VALIDATION_ERROR =
  'Failed to open TCP connection to example.manageiq.com:3000';
const AZURE_VALIDATION_ERROR =
  'Incorrect credentials - no host component for URI';
const AMAZON_EC2_VALIDATION_ERROR =
  'The security token included in the request is invalid.';
const IBM_POWERVC_VALIDATION_ERROR =
  'unable to retrieve IBM PowerVC release version number';
const IBM_CIC_VALIDATION_ERROR = 'Login attempt timed out';
const OPENSTACK_VALIDATION_ERROR =
  'Socket error: no address for example.manageiq.com';
const NAME_ALRADY_EXISTS_ERROR = 'already exists';

// Methods for VMware vCloud
function validateVmwareVcloudFormFields(isEdit) {
  cy.getFormLabelByForAttribute({ forValue: 'type' })
    .should('be.visible')
    .and('contain.text', TYPE_FIELD_LABEL);
  if (isEdit) {
    cy.getFormSelectFieldById({ selectId: 'type' })
      .should('be.visible')
      .and('be.disabled')
      .find('option:selected')
      .should('have.text', PROVIDER_TYPE_VMWARE_VCLOUD);
  } else {
    cy.getFormSelectFieldById({ selectId: 'type' })
      .should('be.visible')
      .and('be.enabled')
      .select(PROVIDER_TYPE_VMWARE_VCLOUD);
  }
  cy.getFormLabelByForAttribute({ forValue: 'name' })
    .should('be.visible')
    .and('contain.text', NAME_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'name' })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({ forValue: 'zone_id' })
    .should('be.visible')
    .and('contain.text', ZONE_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'zone_id' })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({ forValue: 'api_version' })
    .should('be.visible')
    .and('contain.text', API_VERSION_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'api_version' })
    .should('be.visible')
    .and('be.enabled');
  cy.contains('h3', 'Endpoints').should('be.visible');
  /* Verify Default tab fields */
  cy.getFormLabelByForAttribute({ forValue: 'endpoints.default.hostname' })
    .should('be.visible')
    .and('contain.text', HOSTNAME_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'endpoints.default.hostname' })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({ forValue: 'endpoints.default.port' })
    .should('be.visible')
    .and('contain.text', API_PORT_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({
    inputId: 'endpoints.default.port',
    inputType: 'number',
  })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({
    forValue: 'authentications.default.userid',
  })
    .should('be.visible')
    .and('contain.text', USERNAME_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({
    inputId: 'authentications.default.userid',
  })
    .should('be.visible')
    .and('be.enabled');
  if (isEdit) {
    cy.contains('.bx--fieldset legend.bx--label', PASSWORD_FIELD_LABEL);
  } else {
    cy.getFormLabelByForAttribute({
      forValue: 'authentications.default.password',
    })
      .scrollIntoView()
      .should('be.visible')
      .and('contain.text', PASSWORD_FIELD_LABEL);
  }
  if (isEdit) {
    cy.getFormInputFieldByIdAndType({
      inputId: 'authentications.default.password-password-placeholder',
      inputType: 'password',
    })
      .scrollIntoView()
      .should('be.visible')
      .and('be.disabled');
  } else {
    cy.getFormInputFieldByIdAndType({
      inputId: 'authentications.default.password',
      inputType: 'password',
    })
      .should('be.visible')
      .and('be.enabled');
  }
  cy.contains('#default-tab__panel button', 'Validate')
    .should('be.visible')
    .and('be.disabled');
  cy.tabs({ tabLabel: EVENTS_TAB_LABEL });
  cy.getFormLabelByForAttribute({ forValue: 'event_stream_selection' })
    .should('be.visible')
    .and('contain.text', TYPE_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'event_stream_selection' })
    .should('be.visible')
    .and('be.enabled')
    .select(EVENT_STREAM_TYPE_AMQP);
  cy.getFormLabelByForAttribute({
    forValue: 'endpoints.amqp.security_protocol',
  })
    .should('be.visible')
    .and('contain.text', SECURITY_PROTOCOL_FIELD_LABEL);
  cy.getFormSelectFieldById({
    selectId: 'endpoints.amqp.security_protocol',
  })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({ forValue: 'endpoints.amqp.hostname' })
    .should('be.visible')
    .and('contain.text', HOSTNAME_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'endpoints.amqp.hostname' })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({ forValue: 'endpoints.amqp.port' })
    .scrollIntoView()
    .should('be.visible')
    .and('contain.text', API_PORT_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({
    inputId: 'endpoints.amqp.port',
    inputType: 'number',
  })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({ forValue: 'authentications.amqp.userid' })
    .should('be.visible')
    .and('contain.text', USERNAME_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({
    inputId: 'authentications.amqp.userid',
  })
    .should('be.visible')
    .and('be.enabled');
  if (isEdit) {
    cy.contains('.bx--fieldset legend.bx--label', PASSWORD_FIELD_LABEL);
  } else {
    cy.getFormLabelByForAttribute({
      forValue: 'authentications.amqp.password',
    })
      .should('be.visible')
      .and('contain.text', PASSWORD_FIELD_LABEL);
  }
  if (isEdit) {
    cy.getFormInputFieldByIdAndType({
      inputId: 'authentications.amqp.password-password-placeholder',
      inputType: 'password',
    })
      .should('be.visible')
      .and('be.disabled');
  } else {
    cy.getFormInputFieldByIdAndType({
      inputId: 'authentications.amqp.password',
      inputType: 'password',
    })
      .should('be.visible')
      .and('be.enabled');
  }
  cy.contains('#events-tab__panel button', 'Validate')
    .should('be.visible')
    .and('be.disabled');
  cy.getFormFooterButtonByTypeWithText({
    buttonText: isEdit ? 'Save' : 'Add',
    buttonType: 'submit',
  })
    .should('be.visible')
    .and('be.disabled');
  if (isEdit) {
    cy.getFormFooterButtonByTypeWithText({ buttonText: 'Reset' })
      .should('be.visible')
      .and('be.enabled');
  }
  cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' })
    .should('be.visible')
    .and('be.enabled');
}

function fillVmwareVcloudForm({ nameValue, hostValue }) {
  cy.getFormSelectFieldById({ selectId: 'type' }).select(
    PROVIDER_TYPE_VMWARE_VCLOUD
  );
  cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type(nameValue);
  cy.getFormSelectFieldById({ selectId: 'zone_id' }).select(
    ZONE_OPTION_DEFAULT
  );
  cy.getFormSelectFieldById({ selectId: 'api_version' }).select(
    API_VERSION_TYPE_V5
  );
  cy.getFormInputFieldByIdAndType({
    inputId: 'endpoints.default.hostname',
  }).type(hostValue);
  cy.getFormInputFieldByIdAndType({
    inputId: 'endpoints.default.port',
    inputType: 'number',
  })
    .clear()
    .type(PORT_VALUE);
  cy.getFormInputFieldByIdAndType({
    inputId: 'authentications.default.userid',
  }).type(USERNAME_VALUE);
  cy.getFormInputFieldByIdAndType({
    inputId: 'authentications.default.password',
    inputType: 'password',
  }).type(PASSWORD_VALUE);
}

function addVmwareVcloudProviderAndOpenEditForm({ nameValue, hostValue }) {
  fillVmwareVcloudForm({
    nameValue,
    hostValue,
  });
  validate({
    stubErrorResponse: false,
  });
  cy.getFormFooterButtonByTypeWithText({
    buttonText: 'Add',
    buttonType: 'submit',
  }).click();
  selectCreatedProvider(nameValue);
  cy.toolbar(CONFIG_TOOLBAR_BUTTON, EDIT_PROVIDER_CONFIG_OPTION);
}

// Methods for Oracle Cloud
function validateOracleCloudFormFields(isEdit) {
  cy.getFormLabelByForAttribute({ forValue: 'type' })
    .should('be.visible')
    .and('contain.text', TYPE_FIELD_LABEL);
  if (isEdit) {
    cy.getFormSelectFieldById({ selectId: 'type' })
      .should('be.visible')
      .and('be.disabled')
      .find('option:selected')
      .should('have.text', PROVIDER_TYPE_ORACLE_CLOUD);
  } else {
    cy.getFormSelectFieldById({ selectId: 'type' })
      .should('be.visible')
      .and('be.enabled')
      .select(PROVIDER_TYPE_ORACLE_CLOUD);
  }
  cy.getFormLabelByForAttribute({ forValue: 'name' })
    .should('be.visible')
    .and('contain.text', NAME_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'name' })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({ forValue: 'zone_id' })
    .should('be.visible')
    .and('contain.text', ZONE_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'zone_id' })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({ forValue: 'provider_region' })
    .should('be.visible')
    .and('contain.text', REGION_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'provider_region' })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({ forValue: 'uid_ems' })
    .should('be.visible')
    .and('contain.text', TENANT_ID_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'uid_ems' })
    .should('be.visible')
    .and('be.enabled');
  cy.contains('h3', 'Endpoints').should('be.visible');
  cy.getFormLabelByForAttribute({
    forValue: 'authentications.default.userid',
  })
    .should('be.visible')
    .and('contain.text', USER_ID_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({
    inputId: 'authentications.default.userid',
  })
    .should('be.visible')
    .and('be.enabled');
  cy.get('[id="authentications.default.userid-helper-text"]').contains(
    'privileged access'
  );
  if (isEdit) {
    cy.contains('.bx--fieldset legend.bx--label', PRIVATE_KEY_FIELD_LABEL);
  } else {
    cy.getFormLabelByForAttribute({
      forValue: 'authentications.default.auth_key',
    })
      .should('be.visible')
      .and('contain.text', PRIVATE_KEY_FIELD_LABEL);
  }
  if (isEdit) {
    cy.getFormInputFieldByIdAndType({
      inputId: 'authentications.default.auth_key-password-placeholder',
      inputType: 'password',
    })
      .should('be.visible')
      .and('be.disabled');
  } else {
    cy.getFormTextareaById({ textareaId: 'authentications.default.auth_key' })
      .should('be.visible')
      .and('be.enabled');
  }
  cy.getFormLabelByForAttribute({
    forValue: 'authentications.default.public_key',
  })
    .scrollIntoView()
    .should('be.visible')
    .and('contain.text', PUBLIC_KEY_FIELD_LABEL);
  cy.getFormTextareaById({
    textareaId: 'authentications.default.public_key',
  })
    .should('be.visible')
    .and('be.enabled');
  cy.contains('button', 'Validate').should('be.visible').and('be.disabled');
  cy.getFormFooterButtonByTypeWithText({
    buttonText: isEdit ? 'Save' : 'Add',
    buttonType: 'submit',
  })
    .should('be.visible')
    .and('be.disabled');
  if (isEdit) {
    cy.getFormFooterButtonByTypeWithText({ buttonText: 'Reset' })
      .should('be.visible')
      .and('be.disabled');
  }
  cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' })
    .should('be.visible')
    .and('be.enabled');
}

function fillOracleCloudForm({ nameValue }) {
  cy.getFormSelectFieldById({ selectId: 'type' }).select(
    PROVIDER_TYPE_ORACLE_CLOUD
  );
  cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type(nameValue);
  cy.getFormSelectFieldById({ selectId: 'zone_id' }).select(
    ZONE_OPTION_DEFAULT
  );
  cy.getFormSelectFieldById({ selectId: 'provider_region' }).select(
    REGION_OPTION_HYDERABAD
  );
  cy.getFormInputFieldByIdAndType({ inputId: 'uid_ems' }).type(TENANT_ID_VALUE);
  cy.getFormInputFieldByIdAndType({
    inputId: 'authentications.default.userid',
  }).type(USERNAME_VALUE);
  cy.getFormTextareaById({
    textareaId: 'authentications.default.auth_key',
  }).type(PRIVATE_KEY_VALUE);
  cy.getFormTextareaById({
    textareaId: 'authentications.default.public_key',
  }).type(PUBLIC_KEY_VALUE);
}

function addOracleCloudProviderAndOpenEditForm({ nameValue }) {
  fillOracleCloudForm({
    nameValue,
  });
  validate({
    stubErrorResponse: false,
  });
  cy.getFormFooterButtonByTypeWithText({
    buttonText: 'Add',
    buttonType: 'submit',
  }).click();
  selectCreatedProvider(nameValue);
  cy.toolbar(CONFIG_TOOLBAR_BUTTON, EDIT_PROVIDER_CONFIG_OPTION);
}

// Methods for IBM Cloud VPC
function validateIbmCloudVpcFormFields(isEdit) {
  cy.getFormLabelByForAttribute({ forValue: 'type' })
    .should('be.visible')
    .and('contain.text', TYPE_FIELD_LABEL);
  if (isEdit) {
    cy.getFormSelectFieldById({ selectId: 'type' })
      .should('be.visible')
      .and('be.disabled')
      .find('option:selected')
      .should('have.text', PROVIDER_TYPE_IBM_CLOUD_VPC);
  } else {
    cy.getFormSelectFieldById({ selectId: 'type' })
      .should('be.visible')
      .and('be.enabled')
      .select(PROVIDER_TYPE_IBM_CLOUD_VPC);
  }
  cy.getFormLabelByForAttribute({ forValue: 'name' })
    .should('be.visible')
    .and('contain.text', NAME_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'name' })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({ forValue: 'zone_id' })
    .should('be.visible')
    .and('contain.text', ZONE_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'zone_id' })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({ forValue: 'provider_region' })
    .should('be.visible')
    .and('contain.text', REGION_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'provider_region' })
    .should('be.visible')
    .and('be.enabled');
  cy.contains('h3', 'Endpoint').should('be.visible');
  if (isEdit) {
    cy.contains('.bx--fieldset legend.bx--label', IBM_CLOUD_COMMON_FIELD_LABEL);
  } else {
    cy.getFormLabelByForAttribute({
      forValue: 'authentications.default.auth_key',
    })
      .should('be.visible')
      .and('contain.text', IBM_CLOUD_COMMON_FIELD_LABEL);
  }
  if (isEdit) {
    cy.getFormInputFieldByIdAndType({
      inputId: 'authentications.default.auth_key-password-placeholder',
      inputType: 'password',
    })
      .should('be.visible')
      .and('be.disabled');
  } else {
    cy.getFormInputFieldByIdAndType({
      inputId: 'authentications.default.auth_key',
      inputType: 'password',
    })
      .should('be.visible')
      .and('be.enabled');
  }
  cy.contains('button', 'Validate').should('be.visible').and('be.disabled');
  cy.tabs({ tabLabel: METRICS_TAB_LABEL });
  cy.getFormLabelByForAttribute({ forValue: 'metrics_selection' })
    .should('be.visible')
    .and('contain.text', TYPE_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'metrics_selection' })
    .should('be.visible')
    .and('be.enabled')
    .select(ENABLED_SELECT_OPTION);
  cy.getFormLabelByForAttribute({
    forValue: 'endpoints.metrics.options.monitoring_instance_id',
  })
    .should('be.visible')
    .and('contain.text', IBM_CLOUD_COMMON_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({
    inputId: 'endpoints.metrics.options.monitoring_instance_id',
    inputType: 'password',
  })
    .should('be.visible')
    .and('be.enabled');
  cy.tabs({ tabLabel: EVENTS_TAB_LABEL });
  cy.getFormLabelByForAttribute({ forValue: 'events_selection' })
    .should('be.visible')
    .and('contain.text', TYPE_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'events_selection' })
    .should('be.visible')
    .and('be.enabled')
    .select(ENABLED_SELECT_OPTION);
  cy.getFormLabelByForAttribute({
    forValue: 'authentications.events.auth_key',
  })
    .should('be.visible')
    .and('contain.text', IBM_CLOUD_COMMON_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({
    inputId: 'authentications.events.auth_key',
    inputType: 'password',
  })
    .should('be.visible')
    .and('be.enabled');
  if (isEdit) {
    cy.getFormFooterButtonByTypeWithText({
      buttonText: 'Save',
      buttonType: 'submit',
    })
      .should('be.visible')
      .and('be.enabled');
  } else {
    cy.getFormFooterButtonByTypeWithText({
      buttonText: 'Add',
      buttonType: 'submit',
    })
      .should('be.visible')
      .and('be.disabled');
  }
  if (isEdit) {
    cy.getFormFooterButtonByTypeWithText({ buttonText: 'Reset' })
      .should('be.visible')
      .and('be.enabled');
  }
  cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' })
    .should('be.visible')
    .and('be.enabled');
}

function fillIbmCloudVpcForm({ nameValue }) {
  cy.getFormSelectFieldById({ selectId: 'type' }).select(
    PROVIDER_TYPE_IBM_CLOUD_VPC
  );
  cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type(nameValue);
  cy.getFormSelectFieldById({ selectId: 'zone_id' }).select(
    ZONE_OPTION_DEFAULT
  );
  cy.getFormSelectFieldById({ selectId: 'provider_region' }).select(
    REGION_OPTION_AUSTRALIA
  );
  cy.getFormInputFieldByIdAndType({
    inputId: 'authentications.default.auth_key',
    inputType: 'password',
  }).type(CLOUD_API_KEY_VALUE);
}

function addIbmCloudVpcProviderAndOpenEditForm({ nameValue }) {
  fillIbmCloudVpcForm({
    nameValue,
  });
  validate({
    stubErrorResponse: false,
  });
  cy.getFormFooterButtonByTypeWithText({
    buttonText: 'Add',
    buttonType: 'submit',
  }).click();
  selectCreatedProvider(nameValue);
  cy.toolbar(CONFIG_TOOLBAR_BUTTON, EDIT_PROVIDER_CONFIG_OPTION);
}

// Methods for IBM Power Systems Virtual Servers
function validateIbmPowerSystemsVirtualServersFormFields(isEdit) {
  cy.getFormLabelByForAttribute({ forValue: 'type' })
    .should('be.visible')
    .and('contain.text', TYPE_FIELD_LABEL);
  if (isEdit) {
    cy.getFormSelectFieldById({ selectId: 'type' })
      .should('be.visible')
      .and('be.disabled')
      .find('option:selected')
      .should('have.text', PROVIDER_TYPE_IBM_POWER_SYSTEMS);
  } else {
    cy.getFormSelectFieldById({ selectId: 'type' })
      .should('be.visible')
      .and('be.enabled')
      .select(PROVIDER_TYPE_IBM_POWER_SYSTEMS);
  }
  cy.getFormLabelByForAttribute({ forValue: 'name' })
    .should('be.visible')
    .and('contain.text', NAME_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'name' })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({ forValue: 'zone_id' })
    .should('be.visible')
    .and('contain.text', ZONE_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'zone_id' })
    .should('be.visible')
    .and('be.enabled');
  cy.contains('h3', 'Endpoints').should('be.visible');
  if (isEdit) {
    cy.contains('.bx--fieldset legend.bx--label', IBM_CLOUD_COMMON_FIELD_LABEL);
  } else {
    cy.getFormLabelByForAttribute({
      forValue: 'authentications.default.auth_key',
    })
      .should('be.visible')
      .and('contain.text', IBM_CLOUD_COMMON_FIELD_LABEL);
  }
  if (isEdit) {
    cy.getFormInputFieldByIdAndType({
      inputId: 'authentications.default.auth_key-password-placeholder',
      inputType: 'password',
    })
      .should('be.visible')
      .and('be.disabled');
  } else {
    cy.getFormInputFieldByIdAndType({
      inputId: 'authentications.default.auth_key',
      inputType: 'password',
    })
      .should('be.visible')
      .and('be.enabled');
  }
  cy.getFormLabelByForAttribute({ forValue: 'uid_ems' })
    .should('be.visible')
    .and('contain.text', SERVICE_COMMON_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'uid_ems' })
    .should('be.visible')
    .and('be.enabled');
  cy.contains('button', 'Validate').should('be.visible').and('be.disabled');
  cy.getFormFooterButtonByTypeWithText({
    buttonText: isEdit ? 'Save' : 'Add',
    buttonType: 'submit',
  })
    .scrollIntoView()
    .should('be.visible')
    .and('be.disabled');
  if (isEdit) {
    cy.getFormFooterButtonByTypeWithText({ buttonText: 'Reset' })
      .should('be.visible')
      .and('be.disabled');
  }
  cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' })
    .should('be.visible')
    .and('be.enabled');
}

function fillIbmPowerSystemsVirtualServersForm({ nameValue }) {
  cy.getFormSelectFieldById({ selectId: 'type' }).select(
    PROVIDER_TYPE_IBM_POWER_SYSTEMS
  );
  cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type(nameValue);
  cy.getFormSelectFieldById({ selectId: 'zone_id' }).select(
    ZONE_OPTION_DEFAULT
  );
  cy.getFormInputFieldByIdAndType({
    inputId: 'authentications.default.auth_key',
    inputType: 'password',
  }).type(CLOUD_API_KEY_VALUE);
  cy.getFormInputFieldByIdAndType({ inputId: 'uid_ems' }).type(GUID_VALUE);
}

function addIbmPowerSystemsVirtualServersProviderAndOpenEditForm({
  nameValue,
}) {
  fillIbmPowerSystemsVirtualServersForm({
    nameValue,
  });
  validate({
    stubErrorResponse: false,
  });
  cy.getFormFooterButtonByTypeWithText({
    buttonText: 'Add',
    buttonType: 'submit',
  }).click();
  selectCreatedProvider(nameValue);
  cy.toolbar(CONFIG_TOOLBAR_BUTTON, EDIT_PROVIDER_CONFIG_OPTION);
}

// Methods for Google Compute Engine
function validateGoogleComputeEngineFormFields(isEdit) {
  cy.getFormLabelByForAttribute({ forValue: 'type' })
    .should('be.visible')
    .and('contain.text', TYPE_FIELD_LABEL);
  if (isEdit) {
    cy.getFormSelectFieldById({ selectId: 'type' })
      .should('be.visible')
      .and('be.disabled')
      .find('option:selected')
      .should('have.text', PROVIDER_TYPE_GOOGLE_COMPUTE);
  } else {
    cy.getFormSelectFieldById({ selectId: 'type' })
      .should('be.visible')
      .and('be.enabled')
      .select(PROVIDER_TYPE_GOOGLE_COMPUTE);
  }
  cy.getFormLabelByForAttribute({ forValue: 'name' })
    .should('be.visible')
    .and('contain.text', NAME_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'name' })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({ forValue: 'zone_id' })
    .should('be.visible')
    .and('contain.text', ZONE_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'zone_id' })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({ forValue: 'project' })
    .should('be.visible')
    .and('contain.text', PROJECT_ID_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'project' })
    .should('be.visible')
    .and('be.enabled');
  cy.contains('h3', 'Endpoint').should('be.visible');
  if (isEdit) {
    cy.contains('.bx--fieldset legend.bx--label', SERVICE_COMMON_FIELD_LABEL);
  } else {
    cy.getFormLabelByForAttribute({
      forValue: 'authentications.default.auth_key',
    })
      .should('be.visible')
      .and('contain.text', SERVICE_COMMON_FIELD_LABEL);
  }
  if (isEdit) {
    cy.getFormInputFieldByIdAndType({
      inputId: 'authentications.default.auth_key-password-placeholder',
      inputType: 'password',
    })
      .should('be.visible')
      .and('be.disabled');
  } else {
    cy.getFormTextareaById({ textareaId: 'authentications.default.auth_key' })
      .should('be.visible')
      .and('be.enabled');
  }
  cy.contains('button', 'Validate')
    .scrollIntoView()
    .should('be.visible')
    .and('be.disabled');
  cy.getFormFooterButtonByTypeWithText({
    buttonText: isEdit ? 'Save' : 'Add',
    buttonType: 'submit',
  })
    .should('be.visible')
    .and('be.disabled');
  if (isEdit) {
    cy.getFormFooterButtonByTypeWithText({ buttonText: 'Reset' })
      .should('be.visible')
      .and('be.disabled');
  }
  cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' })
    .should('be.visible')
    .and('be.enabled');
}

function fillGoogleComputeEngineForm({ nameValue }) {
  cy.getFormSelectFieldById({ selectId: 'type' }).select(
    PROVIDER_TYPE_GOOGLE_COMPUTE
  );
  cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type(nameValue);
  cy.getFormSelectFieldById({ selectId: 'zone_id' }).select(
    ZONE_OPTION_DEFAULT
  );
  cy.getFormInputFieldByIdAndType({ inputId: 'project' }).type(
    PROJECT_ID_VALUE
  );
  cy.getFormTextareaById({
    textareaId: 'authentications.default.auth_key',
  }).type(
    `{"type":"service_account","project_id":"${PROJECT_ID_VALUE}","private_key":"${PRIVATE_KEY_VALUE}"}`
  );
}

function addGoogleComputeEngineProviderAndOpenEditForm({ nameValue }) {
  fillGoogleComputeEngineForm({
    nameValue,
  });
  validate({
    stubErrorResponse: false,
  });
  cy.getFormFooterButtonByTypeWithText({
    buttonText: 'Add',
    buttonType: 'submit',
  }).click();
  selectCreatedProvider(nameValue);
  cy.toolbar(CONFIG_TOOLBAR_BUTTON, EDIT_PROVIDER_CONFIG_OPTION);
}

// Methods for Azure Stack
function validateAzureStackFormFields(isEdit) {
  cy.getFormLabelByForAttribute({ forValue: 'type' })
    .should('be.visible')
    .and('contain.text', TYPE_FIELD_LABEL);
  if (isEdit) {
    cy.getFormSelectFieldById({ selectId: 'type' })
      .should('be.visible')
      .and('be.disabled')
      .find('option:selected')
      .should('have.text', PROVIDER_TYPE_AZURE_STACK);
  } else {
    cy.getFormSelectFieldById({ selectId: 'type' })
      .should('be.visible')
      .and('be.enabled')
      .select(PROVIDER_TYPE_AZURE_STACK);
  }
  cy.getFormLabelByForAttribute({ forValue: 'name' })
    .should('be.visible')
    .and('contain.text', NAME_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'name' })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({ forValue: 'zone_id' })
    .should('be.visible')
    .and('contain.text', ZONE_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'zone_id' })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({ forValue: 'uid_ems' })
    .should('be.visible')
    .and('contain.text', TENANT_ID_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'uid_ems' })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({ forValue: 'subscription' })
    .should('be.visible')
    .and('contain.text', SUBSCRIPTION_ID_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'subscription' })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({ forValue: 'api_version' })
    .should('be.visible')
    .and('contain.text', API_VERSION_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'api_version' })
    .should('be.visible')
    .and('be.enabled');
  cy.contains('h3', 'Endpoint').should('be.visible');
  cy.getFormLabelByForAttribute({
    forValue: 'endpoints.default.security_protocol',
  })
    .should('be.visible')
    .and('contain.text', SECURITY_PROTOCOL_FIELD_LABEL);
  cy.getFormSelectFieldById({
    selectId: 'endpoints.default.security_protocol',
  })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({ forValue: 'endpoints.default.hostname' })
    .should('be.visible')
    .and('contain.text', HOSTNAME_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'endpoints.default.hostname' })
    .scrollIntoView()
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({ forValue: 'endpoints.default.port' })
    .should('be.visible')
    .and('contain.text', API_PORT_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({
    inputId: 'endpoints.default.port',
    inputType: 'number',
  })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({
    forValue: 'authentications.default.userid',
  })
    .should('be.visible')
    .and('contain.text', USERNAME_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({
    inputId: 'authentications.default.userid',
  })
    .should('be.visible')
    .and('be.enabled');
  if (isEdit) {
    cy.contains('.bx--fieldset legend.bx--label', PASSWORD_FIELD_LABEL);
  } else {
    cy.getFormLabelByForAttribute({
      forValue: 'authentications.default.password',
    })
      .should('be.visible')
      .and('contain.text', PASSWORD_FIELD_LABEL);
  }
  if (isEdit) {
    cy.getFormInputFieldByIdAndType({
      inputId: 'authentications.default.password-password-placeholder',
      inputType: 'password',
    })
      .should('be.visible')
      .and('be.disabled');
  } else {
    cy.getFormInputFieldByIdAndType({
      inputId: 'authentications.default.password',
      inputType: 'password',
    })
      .should('be.visible')
      .and('be.enabled');
  }
  cy.contains('button', 'Validate').should('be.visible').and('be.disabled');
  cy.getFormFooterButtonByTypeWithText({
    buttonText: isEdit ? 'Save' : 'Add',
    buttonType: 'submit',
  })
    .should('be.visible')
    .and('be.disabled');
  if (isEdit) {
    cy.getFormFooterButtonByTypeWithText({ buttonText: 'Reset' })
      .should('be.visible')
      .and('be.disabled');
  }
  cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' })
    .should('be.visible')
    .and('be.enabled');
}

function fillAzureStackForm({ nameValue, hostValue }) {
  cy.getFormSelectFieldById({ selectId: 'type' }).select(
    PROVIDER_TYPE_AZURE_STACK
  );
  cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type(nameValue);
  cy.getFormSelectFieldById({ selectId: 'zone_id' }).select(
    ZONE_OPTION_DEFAULT
  );
  cy.getFormInputFieldByIdAndType({ inputId: 'uid_ems' }).type(TENANT_ID_VALUE);
  cy.getFormInputFieldByIdAndType({ inputId: 'subscription' }).type(
    SUBSCRIPTION_ID_VALUE
  );
  cy.getFormSelectFieldById({ selectId: 'api_version' }).select(
    API_VERSION_TYPE_2017
  );
  cy.getFormSelectFieldById({
    selectId: 'endpoints.default.security_protocol',
  }).select(SECURITY_PROTOCOL_SSL);
  cy.getFormInputFieldByIdAndType({
    inputId: 'endpoints.default.hostname',
  }).type(hostValue);
  cy.getFormInputFieldByIdAndType({
    inputId: 'endpoints.default.port',
    inputType: 'number',
  }).type(PORT_VALUE);
  cy.getFormInputFieldByIdAndType({
    inputId: 'authentications.default.userid',
  }).type(USERNAME_VALUE);
  cy.getFormInputFieldByIdAndType({
    inputId: 'authentications.default.password',
    inputType: 'password',
  }).type(PASSWORD_VALUE);
}

function addAzureStackProviderAndOpenEditForm({ nameValue, hostValue }) {
  fillAzureStackForm({
    nameValue,
    hostValue,
  });
  validate({
    stubErrorResponse: false,
  });
  cy.interceptApi({
    alias: 'addAzureStackProviderApi',
    urlPattern: '/api/providers',
    triggerFn: () =>
      cy
        .getFormFooterButtonByTypeWithText({
          buttonText: 'Add',
          buttonType: 'submit',
        })
        .click(),
    responseInterceptor: (req) => {
      // Let the request go through to the server and then override the response statusCode
      // to 200, server will return internal_server_error(500) since we are using mock values
      // for fields like host, port, etc.
      req.continue((res) => {
        res.send(200);
      });
    },
  });
  selectCreatedProvider(nameValue);
  // TODO: Switch to cy.interceptApi once its enhanced to support multiple api intercepts from a single event
  cy.intercept(
    'GET',
    /\/api\/providers\/(\d+)\?attributes=endpoints,authentications/,
    (req) => {
      const providerId = req.url.match(/\/api\/providers\/(\d+)\?/)[1];
      // Let the request go through to the server and then override the response statusCode to 200 and override the
      // response body with the form input values, as these will be used to populate edit form in the UI. The "type"
      // field value from the response will be used to hit to OPTIONS - /api/providers?type API -
      // (like /api/providers?type=ManageIQ::Providers::AzureStack::CloudManager).
      // If not overridden, server will return internal_server_error(500) since we are using mock values for
      // fields like host, port, etc.
      req.continue((res) => {
        res.send(200, {
          id: providerId,
          type: 'ManageIQ::Providers::AzureStack::CloudManager',
          name: nameValue,
          zone_id: '2',
          uid_ems: TENANT_ID_VALUE,
          subscription: SUBSCRIPTION_ID_VALUE,
          api_version: API_VERSION_TYPE_2017,
          endpoints: [
            {
              role: 'default', // role is required to populate host & port
              hostname: hostValue,
              port: PORT_VALUE,
              security_protocol: 'ssl-with-validation',
            },
          ],
          authentications: [
            {
              authtype: 'default', // authtype is required to populate host & port
              userid: USERNAME_VALUE,
            },
          ],
        });
      });
    }
  ).as('getProviderFieldValuesApi');
  // TODO: Switch to cy.interceptApi once its enhanced to support multiple api intercepts from a single event
  cy.intercept(
    'GET',
    '/api/zones?expand=resources&attributes=id,name,visible&filter[]=visible!=false&sort_by=name', // allow to hit server
    (req) => {
      req.continue((res) => {
        res.send(200, {
          name: 'zones',
          count: 2,
          subcount: 1,
          subquery_count: 1,
          pages: 1,
          resources: [
            {
              href: 'http://localhost:3000/api/zones/2',
              id: '2',
              name: ZONE_OPTION_DEFAULT,
              visible: true,
            },
          ],
        });
      });
    }
  ).as('getZoneDropdownOptionsApi');
  cy.toolbar(CONFIG_TOOLBAR_BUTTON, EDIT_PROVIDER_CONFIG_OPTION);
  cy.wait('@getProviderFieldValuesApi');
  cy.wait('@getZoneDropdownOptionsApi');
}

// Methods for Azure
function validateAzureFormFields(isEdit) {
  cy.getFormLabelByForAttribute({ forValue: 'type' })
    .should('be.visible')
    .and('contain.text', TYPE_FIELD_LABEL);
  if (isEdit) {
    cy.getFormSelectFieldById({ selectId: 'type' })
      .should('be.visible')
      .and('be.disabled')
      .find('option:selected')
      .should('have.text', PROVIDER_TYPE_AZURE);
  } else {
    cy.getFormSelectFieldById({ selectId: 'type' })
      .should('be.visible')
      .and('be.enabled')
      .select(PROVIDER_TYPE_AZURE);
  }
  cy.getFormLabelByForAttribute({ forValue: 'name' })
    .should('be.visible')
    .and('contain.text', NAME_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'name' })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({ forValue: 'zone_id' })
    .should('be.visible')
    .and('contain.text', ZONE_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'zone_id' })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({ forValue: 'provider_region' })
    .should('be.visible')
    .and('contain.text', REGION_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'provider_region' })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({ forValue: 'uid_ems' })
    .should('be.visible')
    .and('contain.text', TENANT_ID_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'uid_ems' })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({ forValue: 'subscription' })
    .should('be.visible')
    .and('contain.text', SUBSCRIPTION_ID_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'subscription' })
    .should('be.visible')
    .and('be.enabled');
  cy.contains('h3', 'Endpoint').should('be.visible');
  cy.getFormLabelByForAttribute({ forValue: 'endpoints.default.url' })
    .should('be.visible')
    .and('contain.text', ENDPOINT_URL_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'endpoints.default.url' })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({
    forValue: 'authentications.default.userid',
  })
    .should('be.visible')
    .and('contain.text', CLIENT_ID_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({
    inputId: 'authentications.default.userid',
  })
    .scrollIntoView()
    .should('be.visible')
    .and('be.enabled');
  if (isEdit) {
    cy.contains('.bx--fieldset legend.bx--label', CLIENT_KEY_FIELD_LABEL);
  } else {
    cy.getFormLabelByForAttribute({
      forValue: 'authentications.default.password',
    })
      .should('be.visible')
      .and('contain.text', CLIENT_KEY_FIELD_LABEL);
  }
  if (isEdit) {
    cy.getFormInputFieldByIdAndType({
      inputId: 'authentications.default.password-password-placeholder',
      inputType: 'password',
    })
      .should('be.visible')
      .and('be.disabled');
  } else {
    cy.getFormInputFieldByIdAndType({
      inputId: 'authentications.default.password',
      inputType: 'password',
    })
      .should('be.visible')
      .and('be.enabled');
  }
  cy.contains('button', 'Validate').should('be.visible').and('be.disabled');
  cy.getFormFooterButtonByTypeWithText({
    buttonText: isEdit ? 'Save' : 'Add',
    buttonType: 'submit',
  })
    .should('be.visible')
    .and('be.disabled');
  if (isEdit) {
    cy.getFormFooterButtonByTypeWithText({ buttonText: 'Reset' })
      .should('be.visible')
      .and('be.disabled');
  }
  cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' })
    .should('be.visible')
    .and('be.enabled');
}

function fillAzureForm({ nameValue }) {
  cy.getFormSelectFieldById({ selectId: 'type' }).select(PROVIDER_TYPE_AZURE);
  cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type(nameValue);
  cy.getFormSelectFieldById({ selectId: 'zone_id' }).select(
    ZONE_OPTION_DEFAULT
  );
  cy.getFormSelectFieldById({ selectId: 'provider_region' }).select(
    REGION_OPTION_CENTRAL_INDIA
  );
  cy.getFormInputFieldByIdAndType({ inputId: 'uid_ems' }).type(TENANT_ID_VALUE);
  cy.getFormInputFieldByIdAndType({ inputId: 'subscription' }).type(
    SUBSCRIPTION_ID_VALUE
  );
  cy.getFormInputFieldByIdAndType({
    inputId: 'endpoints.default.url',
  }).type(ENDPOINT_URL_VALUE);
  cy.getFormInputFieldByIdAndType({
    inputId: 'authentications.default.userid',
  }).type(CLIENT_ID_VALUE);
  cy.getFormInputFieldByIdAndType({
    inputId: 'authentications.default.password',
    inputType: 'password',
  }).type(CLIENT_KEY_VALUE);
}

function addAzureProviderAndOpenEditForm({ nameValue }) {
  fillAzureForm({
    nameValue,
  });
  validate({
    stubErrorResponse: false,
  });
  cy.getFormFooterButtonByTypeWithText({
    buttonText: 'Add',
    buttonType: 'submit',
  }).click();
  selectCreatedProvider(nameValue);
  cy.toolbar(CONFIG_TOOLBAR_BUTTON, EDIT_PROVIDER_CONFIG_OPTION);
}

// Methods for Amazon EC2
function validateAmazonEC2FormFields(isEdit) {
  cy.getFormLabelByForAttribute({ forValue: 'type' })
    .should('be.visible')
    .and('contain.text', TYPE_FIELD_LABEL);
  if (isEdit) {
    cy.getFormSelectFieldById({ selectId: 'type' })
      .should('be.visible')
      .and('be.disabled')
      .find('option:selected')
      .should('have.text', PROVIDER_TYPE_AMAZON_EC2);
  } else {
    cy.getFormSelectFieldById({ selectId: 'type' })
      .should('be.visible')
      .and('be.enabled')
      .select(PROVIDER_TYPE_AMAZON_EC2);
  }
  cy.getFormLabelByForAttribute({ forValue: 'name' })
    .should('be.visible')
    .and('contain.text', NAME_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'name' })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({ forValue: 'zone_id' })
    .should('be.visible')
    .and('contain.text', ZONE_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'zone_id' })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({ forValue: 'provider_region' })
    .should('be.visible')
    .and('contain.text', REGION_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'provider_region' })
    .should('be.visible')
    .and('be.enabled');
  cy.contains('h3', 'Endpoints').should('be.visible');
  cy.getFormLabelByForAttribute({ forValue: 'endpoints.default.url' })
    .should('be.visible')
    .and('contain.text', ENDPOINT_URL_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'endpoints.default.url' })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({
    forValue: 'authentications.default.service_account',
  })
    .should('be.visible')
    .and('contain.text', ASSUME_ROLE_ARN_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({
    inputId: 'authentications.default.service_account',
  })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({
    forValue: 'authentications.default.userid',
  })
    .should('be.visible')
    .and('contain.text', ACCESS_KEY_ID_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({
    inputId: 'authentications.default.userid',
  })
    .should('be.visible')
    .and('be.enabled');
  if (isEdit) {
    cy.contains(
      '.bx--fieldset legend.bx--label',
      SECRET_ACCESS_KEY_FIELD_LABEL
    );
  } else {
    cy.getFormLabelByForAttribute({
      forValue: 'authentications.default.password',
    })
      .scrollIntoView()
      .should('be.visible')
      .and('contain.text', SECRET_ACCESS_KEY_FIELD_LABEL);
  }
  if (isEdit) {
    cy.getFormInputFieldByIdAndType({
      inputId: 'authentications.default.password-password-placeholder',
      inputType: 'password',
    })
      .scrollIntoView()
      .should('be.visible')
      .and('be.disabled');
  } else {
    cy.getFormInputFieldByIdAndType({
      inputId: 'authentications.default.password',
      inputType: 'password',
    })
      .should('be.visible')
      .and('be.enabled');
  }
  cy.contains('button', 'Validate').should('be.visible').and('be.disabled');
  cy.tabs({ tabLabel: SMARTSTATE_DOCKER_TAB_LABEL });
  cy.getFormLabelByForAttribute({
    forValue: 'authentications.smartstate_docker.userid',
  })
    .should('be.visible')
    .and('contain.text', USERNAME_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({
    inputId: 'authentications.smartstate_docker.userid',
  })
    .should('be.visible')
    .and('be.enabled');
  if (isEdit) {
    cy.contains('.bx--fieldset legend.bx--label', PASSWORD_FIELD_LABEL);
  } else {
    cy.getFormLabelByForAttribute({
      forValue: 'authentications.smartstate_docker.password',
    })
      .should('be.visible')
      .and('contain.text', PASSWORD_FIELD_LABEL);
  }
  if (isEdit) {
    cy.getFormInputFieldByIdAndType({
      inputId:
        'authentications.smartstate_docker.password-password-placeholder',
      inputType: 'password',
    })
      .should('be.visible')
      .and('be.disabled');
  } else {
    cy.getFormInputFieldByIdAndType({
      inputId: 'authentications.smartstate_docker.password',
      inputType: 'password',
    })
      .should('be.visible')
      .and('be.enabled');
  }
  cy.getFormFooterButtonByTypeWithText({
    buttonText: isEdit ? 'Save' : 'Add',
    buttonType: 'submit',
  })
    .should('be.visible')
    .and('be.disabled');
  if (isEdit) {
    cy.getFormFooterButtonByTypeWithText({ buttonText: 'Reset' })
      .should('be.visible')
      .and('be.disabled');
  }
  cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' })
    .should('be.visible')
    .and('be.enabled');
}

function fillAmazonEC2Form({ nameValue }) {
  cy.getFormSelectFieldById({ selectId: 'type' }).select(
    PROVIDER_TYPE_AMAZON_EC2
  );
  cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type(nameValue);
  cy.getFormSelectFieldById({ selectId: 'zone_id' }).select(
    ZONE_OPTION_DEFAULT
  );
  cy.getFormSelectFieldById({ selectId: 'provider_region' }).select(
    REGION_OPTION_CANADA
  );
  cy.getFormInputFieldByIdAndType({ inputId: 'endpoints.default.url' }).type(
    ENDPOINT_URL_VALUE
  );
  cy.getFormInputFieldByIdAndType({
    inputId: 'authentications.default.service_account',
  }).type(ASSUME_ROLE_VALUE);
  cy.getFormInputFieldByIdAndType({
    inputId: 'authentications.default.userid',
  }).type(ACCESS_KEY_ID_VALUE);
  cy.getFormInputFieldByIdAndType({
    inputId: 'authentications.default.password',
    inputType: 'password',
  }).type(SECRET_ACCESS_KEY_VALUE);
}

function addAmazonEC2ProviderAndOpenEditForm({ nameValue }) {
  fillAmazonEC2Form({
    nameValue,
  });
  validate({
    stubErrorResponse: false,
  });
  cy.getFormFooterButtonByTypeWithText({
    buttonText: 'Add',
    buttonType: 'submit',
  }).click();
  selectCreatedProvider(nameValue);
  cy.toolbar(CONFIG_TOOLBAR_BUTTON, EDIT_PROVIDER_CONFIG_OPTION);
}

// Methods for IBM PowerVC
function validateIbmPowerVcFormFields(isEdit) {
  cy.getFormLabelByForAttribute({ forValue: 'type' })
    .should('be.visible')
    .and('contain.text', TYPE_FIELD_LABEL);
  if (isEdit) {
    cy.getFormSelectFieldById({ selectId: 'type' })
      .should('be.visible')
      .and('be.disabled')
      .find('option:selected')
      .should('have.text', PROVIDER_TYPE_IBM_POWERVC);
  } else {
    cy.getFormSelectFieldById({ selectId: 'type' })
      .should('be.visible')
      .and('be.enabled')
      .select(PROVIDER_TYPE_IBM_POWERVC);
  }
  cy.getFormLabelByForAttribute({ forValue: 'name' })
    .should('be.visible')
    .and('contain.text', NAME_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'name' })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({ forValue: 'zone_id' })
    .should('be.visible')
    .and('contain.text', ZONE_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'zone_id' })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({ forValue: 'provider_region' })
    .should('be.visible')
    .and('contain.text', PROVIDER_REGION_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'provider_region' })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({ forValue: 'tenant_mapping_enabled' })
    .should('be.visible')
    .and('contain.text', TENANT_MAPPING_ENABLED_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({
    inputId: 'tenant_mapping_enabled',
    inputType: 'checkbox',
  })
    .should('be.visible')
    .and('be.enabled');
  cy.contains('h3', 'Endpoints').should('be.visible');
  cy.getFormLabelByForAttribute({
    forValue: 'endpoints.default.security_protocol',
  })
    .should('be.visible')
    .and('contain.text', SECURITY_PROTOCOL_FIELD_LABEL);
  cy.getFormSelectFieldById({
    selectId: 'endpoints.default.security_protocol',
  })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({ forValue: 'endpoints.default.hostname' })
    .scrollIntoView()
    .should('be.visible')
    .and('contain.text', POWERVC_API_ENDPOINT_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'endpoints.default.hostname' })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({ forValue: 'endpoints.default.port' })
    .should('be.visible')
    .and('contain.text', API_PORT_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({
    inputId: 'endpoints.default.port',
    inputType: 'number',
  })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({
    forValue: 'authentications.default.userid',
  })
    .should('be.visible')
    .and('contain.text', API_USERNAME_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({
    inputId: 'authentications.default.userid',
  })
    .should('be.visible')
    .and('be.enabled');
  if (isEdit) {
    cy.contains('.bx--fieldset legend.bx--label', API_PASSWORD_FIELD_LABEL);
  } else {
    cy.getFormLabelByForAttribute({
      forValue: 'authentications.default.password',
    })
      .should('be.visible')
      .and('contain.text', API_PASSWORD_FIELD_LABEL);
  }
  if (isEdit) {
    cy.getFormInputFieldByIdAndType({
      inputId: 'authentications.default.password-password-placeholder',
      inputType: 'password',
    })
      .should('be.visible')
      .and('be.disabled');
  } else {
    cy.getFormInputFieldByIdAndType({
      inputId: 'authentications.default.password',
      inputType: 'password',
    })
      .should('be.visible')
      .and('be.enabled');
  }
  cy.contains('button', 'Validate').should('be.visible').and('be.disabled');
  cy.tabs({ tabLabel: EVENTS_TAB_LABEL });
  cy.getFormLabelByForAttribute({ forValue: 'event_stream_selection' })
    .should('be.visible')
    .and('contain.text', TYPE_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'event_stream_selection' })
    .should('be.visible')
    .and('be.enabled');
  cy.tabs({ tabLabel: RSA_KEY_PAIR_TAB_LABEL });
  cy.getFormLabelByForAttribute({
    forValue: 'authentications.ssh_keypair.userid',
  })
    .should('be.visible')
    .and('contain.text', USERNAME_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({
    inputId: 'authentications.ssh_keypair.userid',
  })
    .should('be.visible')
    .and('be.enabled');
  if (isEdit) {
    cy.contains('.bx--fieldset legend.bx--label', PRIVATE_KEY_FIELD_LABEL);
  } else {
    cy.getFormLabelByForAttribute({
      forValue: 'authentications.ssh_keypair.auth_key',
    })
      .should('be.visible')
      .and('contain.text', PRIVATE_KEY_FIELD_LABEL);
  }
  if (isEdit) {
    cy.getFormInputFieldByIdAndType({
      inputId: 'authentications.ssh_keypair.auth_key-password-placeholder',
      inputType: 'password',
    })
      .should('be.visible')
      .and('be.disabled');
  } else {
    cy.getFormTextareaById({
      textareaId: 'authentications.ssh_keypair.auth_key',
    })
      .should('be.visible')
      .and('be.enabled');
  }
  cy.tabs({ tabLabel: IMAGE_EXPORT_TAB_LABEL });
  cy.getFormLabelByForAttribute({
    forValue: 'authentications.node.userid',
  })
    .should('be.visible')
    .and('contain.text', POWERVC_COMMON_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({
    inputId: 'authentications.node.userid',
  })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({
    forValue: 'authentications.node.options',
  })
    .should('be.visible')
    .and('contain.text', ANSIBLE_ACCESS_METHOD_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'authentications.node.options' })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({
    forValue: 'authentications.node.auth_key_password',
  })
    .should('be.visible')
    .and('contain.text', POWERVC_COMMON_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({
    inputId: 'authentications.node.auth_key_password',
    inputType: 'password',
  })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({
    forValue: 'authentications.node.auth_key',
  })
    .should('be.visible')
    .and('contain.text', POWERVC_COMMON_FIELD_LABEL);
  cy.getFormTextareaById({
    textareaId: 'authentications.node.auth_key',
  })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormFooterButtonByTypeWithText({
    buttonText: isEdit ? 'Save' : 'Add',
    buttonType: 'submit',
  })
    .scrollIntoView()
    .should('be.visible')
    .and('be.disabled');
  if (isEdit) {
    cy.getFormFooterButtonByTypeWithText({ buttonText: 'Reset' })
      .should('be.visible')
      .and('be.disabled');
  }
  cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' })
    .should('be.visible')
    .and('be.enabled');
}

function fillIbmPowerVcForm({ nameValue, hostValue }) {
  cy.getFormSelectFieldById({ selectId: 'type' }).select(
    PROVIDER_TYPE_IBM_POWERVC
  );
  cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type(nameValue);
  cy.getFormSelectFieldById({ selectId: 'zone_id' }).select(
    ZONE_OPTION_DEFAULT
  );
  cy.getFormInputFieldByIdAndType({ inputId: 'uid_ems' })
    .clear()
    .type(DOMAIN_ID_DEFAULT_VALUE);
  cy.getFormSelectFieldById({
    selectId: 'endpoints.default.security_protocol',
  }).select(SECURITY_PROTOCOL_SSL);
  cy.getFormInputFieldByIdAndType({
    inputId: 'endpoints.default.hostname',
  }).type(hostValue);
  cy.getFormInputFieldByIdAndType({
    inputId: 'endpoints.default.port',
    inputType: 'number',
  })
    .clear()
    .type(PORT_VALUE);
  cy.getFormInputFieldByIdAndType({
    inputId: 'authentications.default.userid',
  }).type(USERNAME_VALUE);
  cy.getFormInputFieldByIdAndType({
    inputId: 'authentications.default.password',
    inputType: 'password',
  }).type(PASSWORD_VALUE);
}

function addIbmPowerVcProviderAndOpenEditForm({ nameValue, hostValue }) {
  fillIbmPowerVcForm({
    nameValue,
    hostValue,
  });
  validate({
    stubErrorResponse: false,
  });
  cy.getFormFooterButtonByTypeWithText({
    buttonText: 'Add',
    buttonType: 'submit',
  }).click();
  selectCreatedProvider(nameValue);
  cy.toolbar(CONFIG_TOOLBAR_BUTTON, EDIT_PROVIDER_CONFIG_OPTION);
}

// Methods for IBM Cloud Infrastructure Center
function validateIbmCloudInfrastructureCenterFormFields(isEdit) {
  cy.getFormLabelByForAttribute({ forValue: 'type' })
    .should('be.visible')
    .and('contain.text', TYPE_FIELD_LABEL);
  if (isEdit) {
    cy.getFormSelectFieldById({ selectId: 'type' })
      .should('be.visible')
      .and('be.disabled')
      .find('option:selected')
      .should('have.text', PROVIDER_TYPE_IBM_CIC);
  } else {
    cy.getFormSelectFieldById({ selectId: 'type' })
      .should('be.visible')
      .and('be.enabled')
      .select(PROVIDER_TYPE_IBM_CIC);
  }
  cy.getFormLabelByForAttribute({ forValue: 'name' })
    .should('be.visible')
    .and('contain.text', NAME_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'name' })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({ forValue: 'zone_id' })
    .should('be.visible')
    .and('contain.text', ZONE_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'zone_id' })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({ forValue: 'provider_region' })
    .should('be.visible')
    .and('contain.text', PROVIDER_REGION_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'provider_region' })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({ forValue: 'api_version' })
    .should('be.visible')
    .and('contain.text', API_VERSION_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'api_version' })
    .should('be.visible')
    .and('be.enabled')
    .select(API_VERSION_TYPE_V3);
  cy.getFormLabelByForAttribute({ forValue: 'uid_ems' })
    .should('be.visible')
    .and('contain.text', DOMAIN_ID_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'uid_ems' })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({ forValue: 'tenant_mapping_enabled' })
    .should('be.visible')
    .and('contain.text', TENANT_MAPPING_ENABLED_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({
    inputId: 'tenant_mapping_enabled',
    inputType: 'checkbox',
  })
    .should('be.visible')
    .and('be.enabled');
  cy.contains('h3', 'Endpoints').should('be.visible');
  cy.contains('h3', 'Default').should('be.visible');
  cy.getFormLabelByForAttribute({
    forValue: 'endpoints.default.security_protocol',
  })
    .should('be.visible')
    .and('contain.text', SECURITY_PROTOCOL_FIELD_LABEL);
  cy.getFormSelectFieldById({
    selectId: 'endpoints.default.security_protocol',
  })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({
    forValue: 'endpoints.default.hostname',
  }).should('be.visible');
  cy.getFormInputFieldByIdAndType({ inputId: 'endpoints.default.hostname' })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({ forValue: 'endpoints.default.port' })
    .should('be.visible')
    .and('contain.text', API_PORT_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({
    inputId: 'endpoints.default.port',
    inputType: 'number',
  })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({
    forValue: 'authentications.default.userid',
  }).should('be.visible');
  cy.getFormInputFieldByIdAndType({
    inputId: 'authentications.default.userid',
  })
    .should('be.visible')
    .and('be.enabled');
  if (isEdit) {
    cy.contains('.bx--fieldset legend.bx--label', PASSWORD_FIELD_LABEL);
  } else {
    cy.getFormLabelByForAttribute({
      forValue: 'authentications.default.password',
    })
      .should('be.visible')
      .and('contain.text', PASSWORD_FIELD_LABEL);
  }
  if (isEdit) {
    cy.getFormInputFieldByIdAndType({
      inputId: 'authentications.default.password-password-placeholder',
      inputType: 'password',
    })
      .should('be.visible')
      .and('be.disabled');
  } else {
    cy.getFormInputFieldByIdAndType({
      inputId: 'authentications.default.password',
      inputType: 'password',
    })
      .should('be.visible')
      .and('be.enabled');
  }
  cy.contains('h3', 'Events').scrollIntoView().should('be.visible');
  cy.getFormLabelByForAttribute({ forValue: 'event_stream_selection' })
    .should('be.visible')
    .and('contain.text', TYPE_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'event_stream_selection' })
    .should('be.visible')
    .and('be.enabled')
    .select(EVENT_STREAM_TYPE_STF);
  cy.getFormLabelByForAttribute({
    forValue: 'endpoints.stf.security_protocol',
  })
    .should('be.visible')
    .and('contain.text', SECURITY_PROTOCOL_FIELD_LABEL);
  cy.getFormSelectFieldById({
    selectId: 'endpoints.stf.security_protocol',
  })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({
    forValue: 'endpoints.stf.hostname',
  }).should('be.visible');
  cy.getFormInputFieldByIdAndType({ inputId: 'endpoints.stf.hostname' })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({ forValue: 'endpoints.stf.port' })
    .should('be.visible')
    .and('contain.text', API_PORT_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({
    inputId: 'endpoints.stf.port',
    inputType: 'number',
  })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormSelectFieldById({ selectId: 'event_stream_selection' }).select(
    EVENT_STREAM_TYPE_AMQP
  );
  cy.getFormLabelByForAttribute({
    forValue: 'endpoints.amqp.hostname',
  }).should('be.visible');
  cy.getFormInputFieldByIdAndType({ inputId: 'endpoints.amqp.hostname' })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({ forValue: 'endpoints.amqp.port' })
    .should('be.visible')
    .and('contain.text', API_PORT_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({
    inputId: 'endpoints.amqp.port',
    inputType: 'number',
  })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({
    forValue: 'authentications.amqp.userid',
  })
    .should('be.visible')
    .and('contain.text', USERNAME_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({
    inputId: 'authentications.amqp.userid',
  })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({
    forValue: 'authentications.amqp.password',
  })
    .should('be.visible')
    .and('contain.text', PASSWORD_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({
    inputId: 'authentications.amqp.password',
    inputType: 'password',
  })
    .should('be.visible')
    .and('be.enabled');
  cy.contains('button', 'Validate').should('be.visible').and('be.disabled');
  cy.getFormLabelByForAttribute({
    forValue: 'authentications.ssh_keypair.userid',
  })
    .should('be.visible')
    .and('contain.text', USERNAME_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({
    inputId: 'authentications.ssh_keypair.userid',
  })
    .should('be.visible')
    .and('be.enabled');
  if (isEdit) {
    cy.contains('.bx--fieldset legend.bx--label', PRIVATE_KEY_FIELD_LABEL);
  } else {
    cy.getFormLabelByForAttribute({
      forValue: 'authentications.ssh_keypair.auth_key',
    })
      .should('be.visible')
      .and('contain.text', PRIVATE_KEY_FIELD_LABEL);
  }
  if (isEdit) {
    cy.getFormInputFieldByIdAndType({
      inputId: 'authentications.ssh_keypair.auth_key-password-placeholder',
      inputType: 'password',
    })
      .should('be.visible')
      .and('be.disabled');
  } else {
    cy.getFormTextareaById({
      textareaId: 'authentications.ssh_keypair.auth_key',
    })
      .should('be.visible')
      .and('be.enabled');
  }
  cy.getFormFooterButtonByTypeWithText({
    buttonText: isEdit ? 'Save' : 'Add',
    buttonType: 'submit',
  })
    .scrollIntoView()
    .should('be.visible')
    .and('be.disabled');
  if (isEdit) {
    cy.getFormFooterButtonByTypeWithText({ buttonText: 'Reset' })
      .should('be.visible')
      .and('be.enabled');
  }
  cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' })
    .should('be.visible')
    .and('be.enabled');
}

function fillIbmCloudInfrastructureCenterForm({ nameValue, hostValue }) {
  cy.getFormSelectFieldById({ selectId: 'type' }).select(PROVIDER_TYPE_IBM_CIC);
  cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type(nameValue);
  cy.getFormSelectFieldById({ selectId: 'zone_id' }).select(
    ZONE_OPTION_DEFAULT
  );
  cy.getFormInputFieldByIdAndType({ inputId: 'provider_region' }).type(
    PROVIDER_REGION_VALUE
  );
  cy.getFormSelectFieldById({ selectId: 'api_version' }).select(
    API_VERSION_TYPE_V3
  );
  cy.getFormInputFieldByIdAndType({ inputId: 'uid_ems' }).type(
    DOMAIN_ID_DEFAULT_VALUE
  );
  cy.getFormInputFieldByIdAndType({
    inputId: 'endpoints.default.hostname',
  }).type(hostValue);
  cy.getFormInputFieldByIdAndType({
    inputId: 'endpoints.default.port',
    inputType: 'number',
  })
    .clear()
    .type(PORT_VALUE);
  cy.getFormInputFieldByIdAndType({
    inputId: 'authentications.default.userid',
  }).type(USERNAME_VALUE);
  cy.getFormInputFieldByIdAndType({
    inputId: 'authentications.default.password',
    inputType: 'password',
  }).type(PASSWORD_VALUE);
}

function addIbmCloudInfrastructureCenterProviderAndOpenEditForm({
  nameValue,
  hostValue,
}) {
  fillIbmCloudInfrastructureCenterForm({
    nameValue,
    hostValue,
  });
  validate({
    stubErrorResponse: false,
  });
  cy.getFormFooterButtonByTypeWithText({
    buttonText: 'Add',
    buttonType: 'submit',
  }).click();
  selectCreatedProvider(nameValue);
  cy.toolbar(CONFIG_TOOLBAR_BUTTON, EDIT_PROVIDER_CONFIG_OPTION);
}

// Methods for OpenStack
function validateOpenstackFormFields(isEdit) {
  cy.getFormLabelByForAttribute({ forValue: 'type' })
    .should('be.visible')
    .and('contain.text', TYPE_FIELD_LABEL);
  if (isEdit) {
    cy.getFormSelectFieldById({ selectId: 'type' })
      .should('be.visible')
      .and('be.disabled')
      .find('option:selected')
      .should('have.text', PROVIDER_TYPE_OPENSTACK);
  } else {
    cy.getFormSelectFieldById({ selectId: 'type' })
      .should('be.visible')
      .and('be.enabled')
      .select(PROVIDER_TYPE_OPENSTACK);
  }
  cy.getFormLabelByForAttribute({ forValue: 'name' })
    .should('be.visible')
    .and('contain.text', NAME_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'name' })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({ forValue: 'zone_id' })
    .should('be.visible')
    .and('contain.text', ZONE_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'zone_id' })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({ forValue: 'provider_region' })
    .should('be.visible')
    .and('contain.text', PROVIDER_REGION_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'provider_region' })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({ forValue: 'provider_id' })
    .should('be.visible')
    .and('contain.text', OPENSTACK_INFRA_PROVIDER_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'provider_id' })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({ forValue: 'api_version' })
    .should('be.visible')
    .and('contain.text', API_VERSION_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'api_version' })
    .should('be.visible')
    .and('be.enabled')
    .select(API_VERSION_TYPE_V3);
  cy.getFormLabelByForAttribute({ forValue: 'uid_ems' })
    .should('be.visible')
    .and('contain.text', DOMAIN_ID_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'uid_ems' })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({ forValue: 'tenant_mapping_enabled' })
    .should('be.visible')
    .and('contain.text', TENANT_MAPPING_ENABLED_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({
    inputId: 'tenant_mapping_enabled',
    inputType: 'checkbox',
  })
    .should('be.visible')
    .and('be.enabled');
  cy.contains('h3', 'Endpoints').should('be.visible');
  cy.contains('h3', 'Default').should('be.visible');
  cy.getFormLabelByForAttribute({
    forValue: 'endpoints.default.security_protocol',
  })
    .should('be.visible')
    .and('contain.text', SECURITY_PROTOCOL_FIELD_LABEL);
  cy.getFormSelectFieldById({
    selectId: 'endpoints.default.security_protocol',
  })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({
    forValue: 'endpoints.default.hostname',
  }).should('be.visible');
  cy.getFormInputFieldByIdAndType({ inputId: 'endpoints.default.hostname' })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({ forValue: 'endpoints.default.port' })
    .should('be.visible')
    .and('contain.text', API_PORT_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({
    inputId: 'endpoints.default.port',
    inputType: 'number',
  })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({
    forValue: 'authentications.default.userid',
  }).should('be.visible');
  cy.getFormInputFieldByIdAndType({
    inputId: 'authentications.default.userid',
  })
    .should('be.visible')
    .and('be.enabled');
  if (isEdit) {
    cy.contains('.bx--fieldset legend.bx--label', PASSWORD_FIELD_LABEL);
  } else {
    cy.getFormLabelByForAttribute({
      forValue: 'authentications.default.password',
    })
      .should('be.visible')
      .and('contain.text', PASSWORD_FIELD_LABEL);
  }
  if (isEdit) {
    cy.getFormInputFieldByIdAndType({
      inputId: 'authentications.default.password-password-placeholder',
      inputType: 'password',
    })
      .should('be.visible')
      .and('be.disabled');
  } else {
    cy.getFormInputFieldByIdAndType({
      inputId: 'authentications.default.password',
      inputType: 'password',
    })
      .should('be.visible')
      .and('be.enabled');
  }
  cy.contains('h3', 'Events').scrollIntoView().should('be.visible');
  cy.getFormLabelByForAttribute({ forValue: 'event_stream_selection' })
    .should('be.visible')
    .and('contain.text', TYPE_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'event_stream_selection' })
    .should('be.visible')
    .and('be.enabled')
    .select(EVENT_STREAM_TYPE_STF);
  cy.getFormLabelByForAttribute({
    forValue: 'endpoints.stf.security_protocol',
  })
    .should('be.visible')
    .and('contain.text', SECURITY_PROTOCOL_FIELD_LABEL);
  cy.getFormSelectFieldById({
    selectId: 'endpoints.stf.security_protocol',
  })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({
    forValue: 'endpoints.stf.hostname',
  }).should('be.visible');
  cy.getFormInputFieldByIdAndType({ inputId: 'endpoints.stf.hostname' })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({ forValue: 'endpoints.stf.port' })
    .should('be.visible')
    .and('contain.text', API_PORT_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({
    inputId: 'endpoints.stf.port',
    inputType: 'number',
  })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormSelectFieldById({ selectId: 'event_stream_selection' }).select(
    EVENT_STREAM_TYPE_AMQP
  );
  cy.getFormLabelByForAttribute({
    forValue: 'endpoints.amqp.hostname',
  }).should('be.visible');
  cy.getFormInputFieldByIdAndType({ inputId: 'endpoints.amqp.hostname' })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({ forValue: 'endpoints.amqp.port' })
    .should('be.visible')
    .and('contain.text', API_PORT_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({
    inputId: 'endpoints.amqp.port',
    inputType: 'number',
  })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({
    forValue: 'authentications.amqp.userid',
  })
    .should('be.visible')
    .and('contain.text', USERNAME_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({
    inputId: 'authentications.amqp.userid',
  })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({
    forValue: 'authentications.amqp.password',
  })
    .should('be.visible')
    .and('contain.text', PASSWORD_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({
    inputId: 'authentications.amqp.password',
    inputType: 'password',
  })
    .should('be.visible')
    .and('be.enabled');
  cy.contains('button', 'Validate').should('be.visible').and('be.disabled');
  cy.getFormLabelByForAttribute({
    forValue: 'authentications.ssh_keypair.userid',
  })
    .should('be.visible')
    .and('contain.text', USERNAME_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({
    inputId: 'authentications.ssh_keypair.userid',
  })
    .should('be.visible')
    .and('be.enabled');
  if (isEdit) {
    cy.contains('.bx--fieldset legend.bx--label', PRIVATE_KEY_FIELD_LABEL);
  } else {
    cy.getFormLabelByForAttribute({
      forValue: 'authentications.ssh_keypair.auth_key',
    })
      .should('be.visible')
      .and('contain.text', PRIVATE_KEY_FIELD_LABEL);
  }
  if (isEdit) {
    cy.getFormInputFieldByIdAndType({
      inputId: 'authentications.ssh_keypair.auth_key-password-placeholder',
      inputType: 'password',
    })
      .should('be.visible')
      .and('be.disabled');
  } else {
    cy.getFormTextareaById({
      textareaId: 'authentications.ssh_keypair.auth_key',
    })
      .should('be.visible')
      .and('be.enabled');
  }
  cy.getFormFooterButtonByTypeWithText({
    buttonText: isEdit ? 'Save' : 'Add',
    buttonType: 'submit',
  })
    .scrollIntoView()
    .should('be.visible')
    .and('be.disabled');
  if (isEdit) {
    cy.getFormFooterButtonByTypeWithText({ buttonText: 'Reset' })
      .should('be.visible')
      .and('be.enabled');
  }
  cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' })
    .should('be.visible')
    .and('be.enabled');
}

function fillOpenstackForm({ nameValue, hostValue }) {
  cy.getFormSelectFieldById({ selectId: 'type' }).select(
    PROVIDER_TYPE_OPENSTACK
  );
  cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type(nameValue);
  cy.getFormSelectFieldById({ selectId: 'zone_id' }).select(
    ZONE_OPTION_DEFAULT
  );
  cy.getFormInputFieldByIdAndType({ inputId: 'provider_region' }).type(
    PROVIDER_REGION_VALUE
  );
  cy.getFormSelectFieldById({ selectId: 'api_version' }).select(
    API_VERSION_TYPE_V3
  );
  cy.getFormInputFieldByIdAndType({ inputId: 'uid_ems' }).type(
    DOMAIN_ID_DEFAULT_VALUE
  );
  cy.getFormSelectFieldById({
    selectId: 'endpoints.default.security_protocol',
  }).select(SECURITY_PROTOCOL_SSL);
  cy.getFormInputFieldByIdAndType({
    inputId: 'endpoints.default.hostname',
  }).type(hostValue);
  cy.getFormInputFieldByIdAndType({
    inputId: 'endpoints.default.port',
    inputType: 'number',
  })
    .clear()
    .type(PORT_VALUE);
  cy.getFormInputFieldByIdAndType({
    inputId: 'authentications.default.userid',
  }).type(USERNAME_VALUE);
  cy.getFormInputFieldByIdAndType({
    inputId: 'authentications.default.password',
    inputType: 'password',
  }).type(PASSWORD_VALUE);
}

function addOpenstackProviderAndOpenEditForm({ nameValue, hostValue }) {
  fillOpenstackForm({
    nameValue,
    hostValue,
  });
  validate({
    stubErrorResponse: false,
  });
  cy.getFormFooterButtonByTypeWithText({
    buttonText: 'Add',
    buttonType: 'submit',
  }).click();
  selectCreatedProvider(nameValue);
  cy.toolbar(CONFIG_TOOLBAR_BUTTON, EDIT_PROVIDER_CONFIG_OPTION);
}

// Other common methods
function selectCreatedProvider(providerName) {
  // Set pagination to 200 items per page to include the target provider despite pending deletions
  // The test will create up to 55 records in total
  cy.get(
    '.miq-fieldset-content .miq-pagination select#bx-pagination-select-1'
  ).select('200');
  cy.get('.miq-data-table table tbody tr').each((row) => {
    if (
      row.find('td').filter((_ind, el) => el.innerText.trim() === providerName)
        .length
    ) {
      if (!row.hasClass('bx--data-table--selected')) {
        cy.wrap(row)
          .find('.bx--checkbox--inline label.bx--checkbox-label')
          .click();
      }
      // Exit loop
      return false;
    }
    // Returning null to get rid of eslint warning, has no impact
    return null;
  });
}

function assertValidationFailureMessage() {
  cy.contains(
    '.ddorg__carbon-error-helper-text',
    VALIDATION_FAILED_COMMON_ERROR
  );
}

function assertValidationSuccessMessage() {
  cy.contains('.bx--form__helper-text', VALIDATION_SUCCESSFUL_COMMON_MESSAGE);
}

function assertNameAlreadyExistsError() {
  cy.contains('#name-error-msg', NAME_ALRADY_EXISTS_ERROR);
}

function validate({ stubErrorResponse, errorMessage }) {
  let response = { state: 'Finished', status: 'Error' };
  if (stubErrorResponse) {
    response = {
      ...response,
      message: errorMessage,
    };
  } else {
    response = { ...response, status: 'Ok', task_results: {} };
  }
  // not using cy.interceptApi because each validate call requires a fresh alias registration
  // reusing the same intercept callback results in it returning the first response object
  cy.intercept('GET', '/api/tasks/*?attributes=task_results', response).as(
    'validateApi'
  );
  cy.contains('button', 'Validate').click();
  cy.wait('@validateApi');
}

function selectProviderAndDeleteWithOptionalFlashMessageCheck({
  createdProviderName,
  assertDeleteFlashMessage,
}) {
  selectCreatedProvider(createdProviderName);
  cy.interceptApi({
    alias: 'deleteProviderApi',
    urlPattern: '/ems_cloud/button?pressed=ems_cloud_delete',
    triggerFn: () =>
      cy.expect_browser_confirm_with_text({
        confirmTriggerFn: () =>
          cy.toolbar(CONFIG_TOOLBAR_BUTTON, REMOVE_PROVIDER_CONFIG_OPTION),
        containsText: REMOVE_PROVIDER_BROWSER_ALERT_MESSAGE,
      }),
    onApiResponse: () => {
      if (assertDeleteFlashMessage) {
        cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_DELETE_OPERATION);
      }
    },
  });
}

function cleanUp({ createdProviderName }) {
  cy.url()
    .then((url) => {
      // Navigate to cloud providers table view
      if (!url.endsWith(CLOUD_PROVIDERS_LIST_URL)) {
        cy.visit(CLOUD_PROVIDERS_LIST_URL);
      }
    })
    .then(() => {
      selectProviderAndDeleteWithOptionalFlashMessageCheck({
        createdProviderName,
        assertDeleteFlashMessage: false,
      });
    });
}

describe('Automate Cloud Provider form operations: Compute > Clouds > Providers > Configuration > Add a New Cloud Provider', () => {
  beforeEach(() => {
    cy.login();
    cy.menu(
      COMPUTE_MENU_OPTION,
      CLOUDS_AUTOMATION_MENU_OPTION,
      PROVIDERS_MENU_OPTION
    );
    cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_PROVIDER_CONFIG_OPTION);
  });

  describe('Validate cloud provider type: VMware vCloud', () => {
    describe('Validate add form', () => {
      it('Validate visibility of elements', () => {
        validateVmwareVcloudFormFields(false);
      });

      it('Should show the error message from the task_results API upon validation failure and validate cancel button behavior', () => {
        fillVmwareVcloudForm({
          nameValue: `${VMWARE_VCLOUD_NAME_VALUE} - Verify add form validation error`,
          hostValue: 'vmware-vcloud.verify-add-form-validation-error.com',
        });
        validate({
          stubErrorResponse: true,
          errorMessage: VMWARE_VCLOUD_VALIDATION_ERROR,
        });
        assertValidationFailureMessage();
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' }).click();
        cy.expect_flash(
          flashClassMap.success,
          FLASH_MESSAGE_OPERATION_CANCELLED
        );
      });

      it('Verify successful validate + add/refresh/delete operations', () => {
        const nameFieldValue = `${VMWARE_VCLOUD_NAME_VALUE} - Verify validate/add/refresh/delete operations`;
        fillVmwareVcloudForm({
          nameValue: nameFieldValue,
          hostValue:
            'vmware-vcloud.verify-validate-add-refresh-delete-operations.com',
        });
        validate({
          stubErrorResponse: false,
        });
        assertValidationSuccessMessage();
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Add',
          buttonType: 'submit',
        })
          .should('be.enabled')
          .click();
        cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_OPERATION_SAVED);
        selectCreatedProvider(nameFieldValue);
        cy.expect_browser_confirm_with_text({
          confirmTriggerFn: () =>
            cy.toolbar(CONFIG_TOOLBAR_BUTTON, REFRESH_CONFIG_OPTION),
          containsText: REFRESH_OPERATION_MESSAGE,
        });
        cy.expect_flash(flashClassMap.success, REFRESH_OPERATION_MESSAGE);

        // FIXME: remove this block once bug is fixed
        // Bug: After refresh, config option other than add remains disabled and requires any action to be performed to enable it back
        /* ==================================================================== */
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_PROVIDER_CONFIG_OPTION);
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' }).click();
        /* ==================================================================== */

        selectProviderAndDeleteWithOptionalFlashMessageCheck({
          createdProviderName: nameFieldValue,
          assertDeleteFlashMessage: true,
        });
      });
    });

    describe('Validate edit form', () => {
      /**
       * The provider name is set in this variable at the start of each test,
       * allowing afterEach to identify it for deletion.
       */
      let nameFieldValue;

      it('Validate visibility of elements', () => {
        nameFieldValue = `${VMWARE_VCLOUD_NAME_VALUE} - Verify edit form elements`;
        addVmwareVcloudProviderAndOpenEditForm({
          nameValue: nameFieldValue,
          hostValue: 'vmware-vcloud.verify-edit-form-elements.com',
        });

        validateVmwareVcloudFormFields(true);
      });

      it("Should show the error message from the task_results API upon validation failure and validate reset & cancel buttons' behavior", () => {
        nameFieldValue = `${VMWARE_VCLOUD_NAME_VALUE} - Verify edit form validation error`;
        addVmwareVcloudProviderAndOpenEditForm({
          nameValue: nameFieldValue,
          hostValue: 'vmware-vcloud.verify-edit-form-validation-error.com',
        });

        cy.getFormSelectFieldById({ selectId: 'api_version' }).select(
          API_VERSION_TYPE_V9
        );
        validate({
          stubErrorResponse: true,
          errorMessage: VMWARE_VCLOUD_VALIDATION_ERROR,
        });
        assertValidationFailureMessage();
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Reset' })
          .should('be.enabled')
          .click();
        cy.getFormSelectFieldById({ selectId: 'api_version' })
          .find('option:selected')
          .should('have.text', API_VERSION_TYPE_V5);
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Cancel',
        }).click();
        cy.expect_flash(
          flashClassMap.success,
          FLASH_MESSAGE_OPERATION_CANCELLED
        );
      });

      it('Verify successful validate + edit operation', () => {
        nameFieldValue = `${VMWARE_VCLOUD_NAME_VALUE} - Verify validate/edit operations`;
        addVmwareVcloudProviderAndOpenEditForm({
          nameValue: nameFieldValue,
          hostValue: 'vmware-vcloud.verify-validate-edit-operations.com',
        });

        cy.getFormSelectFieldById({ selectId: 'api_version' }).select(
          API_VERSION_TYPE_V9
        );
        validate({
          stubErrorResponse: false,
        });
        assertValidationSuccessMessage();
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Save',
          buttonType: 'submit',
        })
          .should('be.enabled')
          .click();
        cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_OPERATION_SAVED);
      });

      afterEach(() => {
        // TODO: add better clean up approach
        cleanUp({ createdProviderName: nameFieldValue });
      });
    });

    describe('Provider name uniqueness validation', () => {
      const nameFieldValue = `${VMWARE_VCLOUD_NAME_VALUE} - Verify duplicate restriction`;

      beforeEach(() => {
        fillVmwareVcloudForm({
          nameValue: nameFieldValue,
          hostValue: 'vmware-vcloud.verify-duplicate-restriction.com',
        });
        validate({
          stubErrorResponse: false,
        });
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Add',
          buttonType: 'submit',
        }).click();
      });

      it('Should display error on duplicate name usage', () => {
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_PROVIDER_CONFIG_OPTION);
        fillVmwareVcloudForm({
          nameValue: nameFieldValue,
          hostValue: 'vmware-vcloud.verify-duplicate-restriction.com',
        });
        assertNameAlreadyExistsError();
      });

      afterEach(() => {
        // TODO: add better clean up approach
        cleanUp({ createdProviderName: nameFieldValue });
      });
    });
  });

  describe('Validate cloud provider type: Oracle Cloud', () => {
    describe('Validate add form', () => {
      it('Validate visibility of elements', () => {
        validateOracleCloudFormFields(false);
      });

      it('Should show the error message from the task_results API upon validation failure and validate cancel button behavior', () => {
        fillOracleCloudForm({
          nameValue: `${ORACLE_CLOUD_NAME_VALUE} - Verify add form validation error`,
        });
        validate({
          stubErrorResponse: true,
          errorMessage: ORACLE_CLOUD_VALIDATION_ERROR,
        });
        assertValidationFailureMessage();
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' }).click();
        cy.expect_flash(
          flashClassMap.success,
          FLASH_MESSAGE_OPERATION_CANCELLED
        );
      });

      it('Verify successful validate + add/refresh/delete operations', () => {
        const nameValue = `${ORACLE_CLOUD_NAME_VALUE} - Verify validate/add/refresh/delete operations`;
        fillOracleCloudForm({
          nameValue,
        });
        validate({
          stubErrorResponse: false,
        });
        assertValidationSuccessMessage();
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Add',
          buttonType: 'submit',
        })
          .should('be.enabled')
          .click();
        cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_OPERATION_SAVED);
        selectCreatedProvider(nameValue);
        cy.expect_browser_confirm_with_text({
          confirmTriggerFn: () =>
            cy.toolbar(CONFIG_TOOLBAR_BUTTON, REFRESH_CONFIG_OPTION),
          containsText: REFRESH_OPERATION_MESSAGE,
        });
        cy.expect_flash(flashClassMap.success, REFRESH_OPERATION_MESSAGE);

        // FIXME: remove this block once bug is fixed
        // Bug: After refresh, config option other than add remains disabled and requires any action to be performed to enable it back
        /* ==================================================================== */
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_PROVIDER_CONFIG_OPTION);
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' }).click();
        /* ==================================================================== */

        selectProviderAndDeleteWithOptionalFlashMessageCheck({
          createdProviderName: nameValue,
          assertDeleteFlashMessage: true,
        });
      });
    });

    describe('Validate edit form', () => {
      /**
       * The provider name is set in this variable at the start of each test,
       * allowing afterEach to identify it for deletion.
       */
      let nameFieldValue;

      it('Validate visibility of elements', () => {
        nameFieldValue = `${ORACLE_CLOUD_NAME_VALUE} - Verify edit form elements`;
        addOracleCloudProviderAndOpenEditForm({
          nameValue: nameFieldValue,
        });

        validateOracleCloudFormFields(true);
      });

      it("Should show the error message from the task_results API upon validation failure and validate reset & cancel buttons' behavior", () => {
        nameFieldValue = `${ORACLE_CLOUD_NAME_VALUE} - Verify edit form validation error`;
        addOracleCloudProviderAndOpenEditForm({
          nameValue: nameFieldValue,
        });

        cy.getFormSelectFieldById({ selectId: 'provider_region' }).select(
          REGION_OPTION_MELBOURNE
        );
        validate({
          stubErrorResponse: true,
          errorMessage: ORACLE_CLOUD_VALIDATION_ERROR,
        });
        assertValidationFailureMessage();
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Reset' })
          .should('be.enabled')
          .click();
        cy.getFormSelectFieldById({ selectId: 'provider_region' })
          .find('option:selected')
          .should('have.text', REGION_OPTION_HYDERABAD);
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Cancel',
        }).click();
        cy.expect_flash(
          flashClassMap.success,
          FLASH_MESSAGE_OPERATION_CANCELLED
        );
      });

      it('Verify successful validate + edit operation', () => {
        nameFieldValue = `${ORACLE_CLOUD_NAME_VALUE} - Verify validate/edit operations`;
        addOracleCloudProviderAndOpenEditForm({
          nameValue: nameFieldValue,
        });

        cy.getFormSelectFieldById({ selectId: 'provider_region' }).select(
          REGION_OPTION_MELBOURNE
        );
        validate({
          stubErrorResponse: false,
        });
        assertValidationSuccessMessage();
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Save',
          buttonType: 'submit',
        })
          .should('be.enabled')
          .click();
        cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_OPERATION_SAVED);
      });

      afterEach(() => {
        // TODO: add better clean up approach
        cleanUp({ createdProviderName: nameFieldValue });
      });
    });

    describe('Provider name uniqueness validation', () => {
      const nameFieldValue = `${ORACLE_CLOUD_NAME_VALUE} - Verify duplicate restriction`;

      beforeEach(() => {
        fillOracleCloudForm({
          nameValue: nameFieldValue,
        });
        validate({
          stubErrorResponse: false,
        });
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Add',
          buttonType: 'submit',
        }).click();
      });

      it('Should display error on duplicate name usage', () => {
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_PROVIDER_CONFIG_OPTION);
        fillOracleCloudForm({
          nameValue: nameFieldValue,
        });
        assertNameAlreadyExistsError();
      });

      afterEach(() => {
        // TODO: add better clean up approach
        cleanUp({ createdProviderName: nameFieldValue });
      });
    });
  });

  describe('Validate cloud provider type: IBM Cloud VPC', () => {
    describe('Validate add form', () => {
      it('Validate visibility of elements', () => {
        validateIbmCloudVpcFormFields(false);
      });

      it('Should show the error message from the task_results API upon validation failure and validate cancel button behavior', () => {
        fillIbmCloudVpcForm({
          nameValue: `${IBM_CLOUD_VPC_NAME_VALUE} - Verify add form validation error`,
        });
        validate({
          stubErrorResponse: true,
          errorMessage: IBM_CLOUD_VPC_VALIDATION_ERROR,
        });
        assertValidationFailureMessage();
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' }).click();
        cy.expect_flash(
          flashClassMap.success,
          FLASH_MESSAGE_OPERATION_CANCELLED
        );
      });

      it('Verify successful validate + add/refresh/delete operations', () => {
        const nameValue = `${IBM_CLOUD_VPC_NAME_VALUE} - Verify validate/add/refresh/delete operations`;
        fillIbmCloudVpcForm({
          nameValue,
        });
        validate({
          stubErrorResponse: false,
        });
        assertValidationSuccessMessage();
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Add',
          buttonType: 'submit',
        })
          .should('be.enabled')
          .click();
        cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_OPERATION_SAVED);
        selectCreatedProvider(nameValue);
        cy.expect_browser_confirm_with_text({
          confirmTriggerFn: () =>
            cy.toolbar(CONFIG_TOOLBAR_BUTTON, REFRESH_CONFIG_OPTION),
          containsText: REFRESH_OPERATION_MESSAGE,
        });
        cy.expect_flash(flashClassMap.success, REFRESH_OPERATION_MESSAGE);

        // FIXME: remove this block once bug is fixed
        // Bug: After refresh, config option other than add remains disabled and requires any action to be performed to enable it back
        /* ==================================================================== */
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_PROVIDER_CONFIG_OPTION);
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' }).click();
        /* ==================================================================== */

        selectProviderAndDeleteWithOptionalFlashMessageCheck({
          createdProviderName: nameValue,
          assertDeleteFlashMessage: true,
        });
      });
    });

    describe('Validate edit form', () => {
      /**
       * The provider name is set in this variable at the start of each test,
       * allowing afterEach to identify it for deletion.
       */
      let nameFieldValue;

      it('Validate visibility of elements', () => {
        nameFieldValue = `${IBM_CLOUD_VPC_NAME_VALUE} - Verify edit form elements`;
        addIbmCloudVpcProviderAndOpenEditForm({
          nameValue: nameFieldValue,
        });

        validateIbmCloudVpcFormFields(true);
      });

      it("Should show the error message from the task_results API upon validation failure and validate reset & cancel buttons' behavior", () => {
        nameFieldValue = `${IBM_CLOUD_VPC_NAME_VALUE} - Verify edit form validation error`;
        addIbmCloudVpcProviderAndOpenEditForm({
          nameValue: nameFieldValue,
        });

        cy.getFormSelectFieldById({ selectId: 'provider_region' }).select(
          REGION_OPTION_SPAIN
        );
        validate({
          stubErrorResponse: true,
          errorMessage: IBM_CLOUD_VPC_VALIDATION_ERROR,
        });
        assertValidationFailureMessage();
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Reset' })
          .should('be.enabled')
          .click();
        cy.getFormSelectFieldById({ selectId: 'provider_region' })
          .find('option:selected')
          .should('have.text', REGION_OPTION_AUSTRALIA);
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Cancel',
        }).click();
        cy.expect_flash(
          flashClassMap.success,
          FLASH_MESSAGE_OPERATION_CANCELLED
        );
      });

      it('Verify successful validate + edit operation', () => {
        nameFieldValue = `${IBM_CLOUD_VPC_NAME_VALUE} - Verify validate/edit operations`;
        addIbmCloudVpcProviderAndOpenEditForm({
          nameValue: nameFieldValue,
        });

        cy.getFormSelectFieldById({ selectId: 'provider_region' }).select(
          REGION_OPTION_SPAIN
        );
        validate({
          stubErrorResponse: false,
        });
        assertValidationSuccessMessage();
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Save',
          buttonType: 'submit',
        })
          .should('be.enabled')
          .click();
        cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_OPERATION_SAVED);
      });

      afterEach(() => {
        // TODO: add better clean up approach
        cleanUp({ createdProviderName: nameFieldValue });
      });
    });

    describe('Provider name uniqueness validation', () => {
      const nameFieldValue = `${IBM_CLOUD_VPC_NAME_VALUE} - Verify duplicate restriction`;

      beforeEach(() => {
        fillIbmCloudVpcForm({
          nameValue: nameFieldValue,
        });
        validate({
          stubErrorResponse: false,
        });
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Add',
          buttonType: 'submit',
        }).click();
      });

      it('Should display error on duplicate name usage', () => {
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_PROVIDER_CONFIG_OPTION);
        fillIbmCloudVpcForm({
          nameValue: nameFieldValue,
        });
        assertNameAlreadyExistsError();
      });

      afterEach(() => {
        // TODO: add better clean up approach
        cleanUp({ createdProviderName: nameFieldValue });
      });
    });
  });

  describe('Validate cloud provider type: IBM Power Systems Virtual Servers', () => {
    describe('Validate add form', () => {
      it('Validate visibility of elements', () => {
        validateIbmPowerSystemsVirtualServersFormFields(false);
      });

      it('Should show the error message from the task_results API upon validation failure and validate cancel button behavior', () => {
        fillIbmPowerSystemsVirtualServersForm({
          nameValue: `${IBM_POWER_SYSTEMS_VIRTUAL_SERVERS_NAME_VALUE} - Verify add form validation error`,
        });
        validate({
          stubErrorResponse: true,
          errorMessage: IBM_POWER_SYSTEMS_VIRTUAL_SERVERS_VALIDATION_ERROR,
        });
        assertValidationFailureMessage();
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' }).click();
        cy.expect_flash(
          flashClassMap.success,
          FLASH_MESSAGE_OPERATION_CANCELLED
        );
      });

      it('Verify successful validate + add/refresh/delete operations', () => {
        const nameValue = `${IBM_POWER_SYSTEMS_VIRTUAL_SERVERS_NAME_VALUE} - Verify validate/add/refresh/delete operations`;
        fillIbmPowerSystemsVirtualServersForm({
          nameValue,
        });
        validate({
          stubErrorResponse: false,
        });
        assertValidationSuccessMessage();
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Add',
          buttonType: 'submit',
        })
          .should('be.enabled')
          .click();
        cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_OPERATION_SAVED);
        selectCreatedProvider(nameValue);
        cy.expect_browser_confirm_with_text({
          confirmTriggerFn: () =>
            cy.toolbar(CONFIG_TOOLBAR_BUTTON, REFRESH_CONFIG_OPTION),
          containsText: REFRESH_OPERATION_MESSAGE,
        });
        cy.expect_flash(flashClassMap.success, REFRESH_OPERATION_MESSAGE);

        // FIXME: remove this block once bug is fixed
        // Bug: After refresh, config option other than add remains disabled and requires any action to be performed to enable it back
        /* ==================================================================== */
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_PROVIDER_CONFIG_OPTION);
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' }).click();
        /* ==================================================================== */

        selectProviderAndDeleteWithOptionalFlashMessageCheck({
          createdProviderName: nameValue,
          assertDeleteFlashMessage: true,
        });
      });
    });

    describe('Validate edit form', () => {
      /**
       * The provider name is set in this variable at the start of each test,
       * allowing afterEach to identify it for deletion.
       */
      let nameFieldValue;

      it('Validate visibility of elements', () => {
        nameFieldValue = `${IBM_POWER_SYSTEMS_VIRTUAL_SERVERS_NAME_VALUE} - Verify edit form elements`;
        addIbmPowerSystemsVirtualServersProviderAndOpenEditForm({
          nameValue: nameFieldValue,
        });

        validateIbmPowerSystemsVirtualServersFormFields(true);
      });

      it("Should show the error message from the task_results API upon validation failure and validate reset & cancel buttons' behavior", () => {
        nameFieldValue = `${IBM_POWER_SYSTEMS_VIRTUAL_SERVERS_NAME_VALUE} - Verify edit form validation error`;
        addIbmPowerSystemsVirtualServersProviderAndOpenEditForm({
          nameValue: nameFieldValue,
        });

        cy.getFormInputFieldByIdAndType({ inputId: 'uid_ems' }).type('-xr4q');
        validate({
          stubErrorResponse: true,
          errorMessage: IBM_POWER_SYSTEMS_VIRTUAL_SERVERS_VALIDATION_ERROR,
        });
        assertValidationFailureMessage();
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Reset' })
          .should('be.enabled')
          .click();
        cy.getFormInputFieldByIdAndType({ inputId: 'uid_ems' }).should(
          'have.value',
          GUID_VALUE
        );
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Cancel',
        }).click();
        cy.expect_flash(
          flashClassMap.success,
          FLASH_MESSAGE_OPERATION_CANCELLED
        );
      });

      it('Verify successful validate + edit operation', () => {
        nameFieldValue = `${IBM_POWER_SYSTEMS_VIRTUAL_SERVERS_NAME_VALUE} - Verify validate/edit operations`;
        addIbmPowerSystemsVirtualServersProviderAndOpenEditForm({
          nameValue: nameFieldValue,
        });

        cy.getFormInputFieldByIdAndType({ inputId: 'uid_ems' }).type('-xr4q');
        validate({
          stubErrorResponse: false,
        });
        assertValidationSuccessMessage();
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Save',
          buttonType: 'submit',
        })
          .should('be.enabled')
          .click();
        cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_OPERATION_SAVED);
      });

      afterEach(() => {
        // TODO: add better clean up approach
        cleanUp({
          createdProviderName: nameFieldValue,
        });
      });
    });

    describe('Provider name uniqueness validation', () => {
      const nameFieldValue = `${IBM_POWER_SYSTEMS_VIRTUAL_SERVERS_NAME_VALUE} - Verify duplicate restriction`;

      beforeEach(() => {
        fillIbmPowerSystemsVirtualServersForm({
          nameValue: nameFieldValue,
        });
        validate({
          stubErrorResponse: false,
        });
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Add',
          buttonType: 'submit',
        }).click();
      });

      it('Should display error on duplicate name usage', () => {
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_PROVIDER_CONFIG_OPTION);
        fillIbmPowerSystemsVirtualServersForm({
          nameValue: nameFieldValue,
        });
        assertNameAlreadyExistsError();
      });

      afterEach(() => {
        // TODO: add better clean up approach
        cleanUp({
          createdProviderName: nameFieldValue,
        });
      });
    });
  });

  describe('Validate cloud provider type: Google Compute Engine', () => {
    describe('Validate add form', () => {
      it('Validate visibility of elements', () => {
        validateGoogleComputeEngineFormFields(false);
      });

      it('Should show the error message from the task_results API upon validation failure and validate cancel button behavior', () => {
        fillGoogleComputeEngineForm({
          nameValue: `${GOOGLE_COMPUTE_ENGINE_NAME_VALUE} - Verify add form validation error`,
        });
        validate({
          stubErrorResponse: true,
          errorMessage: GOOGLE_COMPUTE_ENGINE_VALIDATION_ERROR,
        });
        assertValidationFailureMessage();
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' }).click();
        cy.expect_flash(
          flashClassMap.success,
          FLASH_MESSAGE_OPERATION_CANCELLED
        );
      });

      it('Verify successful validate + add/refresh/delete operations', () => {
        const nameFieldValue = `${GOOGLE_COMPUTE_ENGINE_NAME_VALUE} - Verify validate/add/refresh/delete operations`;
        fillGoogleComputeEngineForm({
          nameValue: nameFieldValue,
        });
        validate({
          stubErrorResponse: false,
        });
        assertValidationSuccessMessage();
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Add',
          buttonType: 'submit',
        })
          .should('be.enabled')
          .click();
        cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_OPERATION_SAVED);
        selectCreatedProvider(nameFieldValue);
        cy.expect_browser_confirm_with_text({
          confirmTriggerFn: () =>
            cy.toolbar(CONFIG_TOOLBAR_BUTTON, REFRESH_CONFIG_OPTION),
          containsText: REFRESH_OPERATION_MESSAGE,
        });
        cy.expect_flash(flashClassMap.success, REFRESH_OPERATION_MESSAGE);

        // FIXME: remove this block once bug is fixed
        // Bug: After refresh, config option other than add remains disabled and requires any action to be performed to enable it back
        /* ==================================================================== */
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_PROVIDER_CONFIG_OPTION);
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' }).click();
        /* ==================================================================== */

        selectProviderAndDeleteWithOptionalFlashMessageCheck({
          createdProviderName: nameFieldValue,
          assertDeleteFlashMessage: true,
        });
      });
    });

    describe('Validate edit form', () => {
      /**
       * The provider name is set in this variable at the start of each test,
       * allowing afterEach to identify it for deletion.
       */
      let nameFieldValue;

      it('Validate visibility of elements', () => {
        nameFieldValue = `${GOOGLE_COMPUTE_ENGINE_NAME_VALUE} - Verify edit form elements`;
        addGoogleComputeEngineProviderAndOpenEditForm({
          nameValue: nameFieldValue,
        });

        validateGoogleComputeEngineFormFields(true);
      });

      it("Should show the error message from the task_results API upon validation failure and validate reset & cancel buttons' behavior", () => {
        nameFieldValue = `${GOOGLE_COMPUTE_ENGINE_NAME_VALUE} - Verify edit form validation error`;
        addGoogleComputeEngineProviderAndOpenEditForm({
          nameValue: nameFieldValue,
        });

        cy.getFormInputFieldByIdAndType({ inputId: 'project' }).type('-76g1');
        validate({
          stubErrorResponse: true,
          errorMessage: GOOGLE_COMPUTE_ENGINE_VALIDATION_ERROR,
        });
        assertValidationFailureMessage();
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Reset' })
          .should('be.enabled')
          .click();
        cy.getFormInputFieldByIdAndType({ inputId: 'project' }).should(
          'have.value',
          PROJECT_ID_VALUE
        );
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Cancel',
        }).click();
        cy.expect_flash(
          flashClassMap.success,
          FLASH_MESSAGE_OPERATION_CANCELLED
        );
      });

      it('Verify successful validate + edit operation', () => {
        nameFieldValue = `${GOOGLE_COMPUTE_ENGINE_NAME_VALUE} - Verify validate/edit operations`;
        addGoogleComputeEngineProviderAndOpenEditForm({
          nameValue: nameFieldValue,
        });

        cy.getFormInputFieldByIdAndType({ inputId: 'project' }).type('-76g1');
        validate({
          stubErrorResponse: false,
        });
        assertValidationSuccessMessage();
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Save',
          buttonType: 'submit',
        })
          .should('be.enabled')
          .click();
        cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_OPERATION_SAVED);
      });

      afterEach(() => {
        // TODO: add better clean up approach
        cleanUp({ createdProviderName: nameFieldValue });
      });
    });

    describe('Provider name uniqueness validation', () => {
      const nameFieldValue = `${GOOGLE_COMPUTE_ENGINE_NAME_VALUE} - Verify duplicate restriction`;

      beforeEach(() => {
        fillGoogleComputeEngineForm({
          nameValue: nameFieldValue,
        });
        validate({
          stubErrorResponse: false,
        });
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Add',
          buttonType: 'submit',
        }).click();
      });

      it('Should display error on duplicate name usage', () => {
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_PROVIDER_CONFIG_OPTION);
        fillGoogleComputeEngineForm({
          nameValue: nameFieldValue,
        });
        assertNameAlreadyExistsError();
      });

      afterEach(() => {
        // TODO: add better clean up approach
        cleanUp({ createdProviderName: nameFieldValue });
      });
    });
  });

  describe('Validate cloud provider type: Azure Stack', () => {
    describe('Validate add form', () => {
      it('Validate visibility of elements', () => {
        validateAzureStackFormFields(false);
      });

      it('Should show the error message from the task_results API upon validation failure and validate cancel button behavior', () => {
        fillAzureStackForm({
          nameValue: `${AZURE_STACK_NAME_VALUE} - Verify add form validation error`,
          hostValue: 'azure-stack.verify-add-form-validation-error.com',
        });
        validate({
          stubErrorResponse: true,
          errorMessage: AZURE_STACK_VALIDATION_ERROR,
        });
        assertValidationFailureMessage();
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' }).click();
        cy.expect_flash(
          flashClassMap.success,
          FLASH_MESSAGE_OPERATION_CANCELLED
        );
      });

      it('Verify successful validate + add/refresh/delete operations', () => {
        const nameFieldValue = `${AZURE_STACK_NAME_VALUE} - Verify validate/add/refresh/delete operations`;
        fillAzureStackForm({
          nameValue: nameFieldValue,
          hostValue:
            'azure-stack.verify-validate-add-refresh-delete-operations.com',
        });
        validate({
          stubErrorResponse: false,
        });
        assertValidationSuccessMessage();
        cy.interceptApi({
          alias: 'addAzureStackProviderApi',
          urlPattern: '/api/providers',
          triggerFn: () =>
            cy
              .getFormFooterButtonByTypeWithText({
                buttonText: 'Add',
                buttonType: 'submit',
              })
              .should('be.enabled')
              .click(),
          responseInterceptor: (req) => {
            // Let the request go through to the server(so that the data is created) and then override
            // the response statusCode to 200, server will return internal_server_error(500) since we are
            // using mock values for fields like host, port, etc.
            req.continue((res) => {
              res.send(200);
            });
          },
        });
        cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_OPERATION_SAVED);
        selectCreatedProvider(nameFieldValue);
        cy.expect_browser_confirm_with_text({
          confirmTriggerFn: () =>
            cy.toolbar(CONFIG_TOOLBAR_BUTTON, REFRESH_CONFIG_OPTION),
          containsText: REFRESH_OPERATION_MESSAGE,
        });
        cy.expect_flash(flashClassMap.success, REFRESH_OPERATION_MESSAGE);

        // FIXME: Remove this block once bug is fixed
        // Bug: After refresh, config option other than add remains disabled and requires any action to be performed to enable it back
        /* ==================================================================== */
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_PROVIDER_CONFIG_OPTION);
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' }).click();
        /* ==================================================================== */

        selectProviderAndDeleteWithOptionalFlashMessageCheck({
          createdProviderName: nameFieldValue,
          assertDeleteFlashMessage: true,
        });
      });
    });

    describe('Validate edit form', () => {
      /**
       * The provider name is set in this variable at the start of each test,
       * allowing afterEach to identify it for deletion.
       */
      let nameFieldValue;

      it('Validate visibility of elements', () => {
        nameFieldValue = `${AZURE_STACK_NAME_VALUE} - Verify edit form elements`;
        addAzureStackProviderAndOpenEditForm({
          nameValue: nameFieldValue,
          hostValue: 'azure-stack.verify-edit-form-elements.com',
        });

        validateAzureStackFormFields(true);
      });

      it("Should show the error message from the task_results API upon validation failure and validate reset & cancel buttons' behavior", () => {
        nameFieldValue = `${AZURE_STACK_NAME_VALUE} - Verify edit form validation error`;
        addAzureStackProviderAndOpenEditForm({
          nameValue: nameFieldValue,
          hostValue: 'azure-stack.verify-edit-form-validation-error.com',
        });

        cy.getFormSelectFieldById({
          selectId: 'endpoints.default.security_protocol',
        }).select(SECURITY_PROTOCOL_NON_SSL);
        validate({
          stubErrorResponse: true,
          errorMessage: AZURE_STACK_VALIDATION_ERROR,
        });
        assertValidationFailureMessage();
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Reset' })
          .should('be.enabled')
          .click();
        cy.getFormSelectFieldById({
          selectId: 'endpoints.default.security_protocol',
        })
          .find('option:selected')
          .should('have.text', SECURITY_PROTOCOL_SSL);
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Cancel',
        }).click();
        cy.expect_flash(
          flashClassMap.success,
          FLASH_MESSAGE_OPERATION_CANCELLED
        );
      });

      it('Verify successful validate + edit operation', () => {
        nameFieldValue = `${AZURE_STACK_NAME_VALUE} - Verify validate/edit operations`;
        addAzureStackProviderAndOpenEditForm({
          nameValue: nameFieldValue,
          hostValue: 'azure-stack.verify-validate-edit-operations.com',
        });

        cy.getFormSelectFieldById({
          selectId: 'endpoints.default.security_protocol',
        }).select(SECURITY_PROTOCOL_NON_SSL);
        validate({
          stubErrorResponse: false,
        });
        assertValidationSuccessMessage();
        cy.interceptApi({
          method: 'PATCH',
          alias: 'editAzureStackProviderApi',
          urlPattern: /\/api\/providers\/\d+/,
          triggerFn: () =>
            cy
              .getFormFooterButtonByTypeWithText({
                buttonText: 'Save',
                buttonType: 'submit',
              })
              .should('be.enabled')
              .click(),
          responseInterceptor: (req) => {
            // Let the request go through to the server(so that the data is updated) and then override
            // the response statusCode to 200, server will return internal_server_error(500) since we are
            // using mock values for fields like host, port, etc.
            req.continue((res) => {
              res.send(200);
            });
          },
        });
        cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_OPERATION_SAVED);
      });

      afterEach(() => {
        // TODO: add better clean up approach
        cleanUp({ createdProviderName: nameFieldValue });
      });
    });

    describe('Provider name uniqueness validation', () => {
      const nameFieldValue = `${AZURE_STACK_NAME_VALUE} - Verify duplicate restriction`;

      beforeEach(() => {
        fillAzureStackForm({
          nameValue: nameFieldValue,
          hostValue: 'azure-stack.verify-duplicate-restriction.com',
        });
        validate({
          stubErrorResponse: false,
        });
        cy.interceptApi({
          alias: 'addAzureStackProviderApi',
          urlPattern: '/api/providers',
          triggerFn: () =>
            cy
              .getFormFooterButtonByTypeWithText({
                buttonText: 'Add',
                buttonType: 'submit',
              })
              .click(),
          responseInterceptor: (req) => {
            // Let the request go through to the server(so that the data is created) and then override
            // the response statusCode to 200, server will return internal_server_error(500) since we are
            // using mock values for fields like host, port, etc.
            req.continue((res) => {
              res.send(200);
            });
          },
        });
      });

      it('Should display error on duplicate name usage', () => {
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_PROVIDER_CONFIG_OPTION);
        fillAzureStackForm({
          nameValue: nameFieldValue,
          hostValue: 'azure-stack.verify-duplicate-restriction.com',
        });
        assertNameAlreadyExistsError();
      });

      afterEach(() => {
        // TODO: add better clean up approach
        cleanUp({ createdProviderName: nameFieldValue });
      });
    });
  });

  describe('Validate cloud provider type: Azure', () => {
    describe('Validate add form', () => {
      it('Validate visibility of elements', () => {
        validateAzureFormFields(false);
      });

      it('Should show the error message from the task_results API upon validation failure and validate cancel button behavior', () => {
        fillAzureForm({
          nameValue: `${AZURE_NAME_VALUE} - Verify add form validation error`,
        });
        validate({
          stubErrorResponse: true,
          errorMessage: AZURE_VALIDATION_ERROR,
        });
        assertValidationFailureMessage();

        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' }).click();
        cy.expect_flash(
          flashClassMap.success,
          FLASH_MESSAGE_OPERATION_CANCELLED
        );
      });

      it('Verify successful validate + add/refresh/delete operations', () => {
        const nameFieldValue = `${AZURE_NAME_VALUE} - Verify validate/add/refresh/delete operations`;
        fillAzureForm({
          nameValue: nameFieldValue,
        });
        validate({
          stubErrorResponse: false,
        });
        assertValidationSuccessMessage();
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Add',
          buttonType: 'submit',
        })
          .should('be.enabled')
          .click();
        cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_OPERATION_SAVED);
        selectCreatedProvider(nameFieldValue);
        cy.expect_browser_confirm_with_text({
          confirmTriggerFn: () =>
            cy.toolbar(CONFIG_TOOLBAR_BUTTON, REFRESH_CONFIG_OPTION),
          containsText: REFRESH_OPERATION_MESSAGE,
        });
        cy.expect_flash(flashClassMap.success, REFRESH_OPERATION_MESSAGE);

        // TODO: remove this block once bug is fixed
        // Bug: After refresh, config option other than add remains disabled and requires any action to be performed to enable it back
        /* ==================================================================== */
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_PROVIDER_CONFIG_OPTION);
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' }).click();
        /* ==================================================================== */

        selectProviderAndDeleteWithOptionalFlashMessageCheck({
          createdProviderName: nameFieldValue,
          assertDeleteFlashMessage: true,
        });
      });
    });

    describe('Validate edit form', () => {
      /**
       * The provider name is set in this variable at the start of each test,
       * allowing afterEach to identify it for deletion.
       */
      let nameFieldValue;

      it('Validate visibility of elements', () => {
        nameFieldValue = `${AZURE_NAME_VALUE} - Verify edit form elements`;
        addAzureProviderAndOpenEditForm({
          nameValue: nameFieldValue,
        });

        validateAzureFormFields(true);
      });

      it("Should show the error message from the task_results API upon validation failure and validate reset & cancel buttons' behavior", () => {
        nameFieldValue = `${AZURE_NAME_VALUE} - Verify edit form validation error`;
        addAzureProviderAndOpenEditForm({
          nameValue: nameFieldValue,
        });

        cy.getFormSelectFieldById({ selectId: 'provider_region' }).select(
          REGION_OPTION_CENTRAL_US
        );
        validate({
          stubErrorResponse: true,
          errorMessage: AZURE_VALIDATION_ERROR,
        });
        assertValidationFailureMessage();
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Reset' })
          .should('be.enabled')
          .click();
        cy.getFormSelectFieldById({ selectId: 'provider_region' })
          .find('option:selected')
          .should('have.text', REGION_OPTION_CENTRAL_INDIA);
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' }).click();
        cy.expect_flash(
          flashClassMap.success,
          FLASH_MESSAGE_OPERATION_CANCELLED
        );
      });

      it('Verify successful validate + edit operation', () => {
        nameFieldValue = `${AZURE_NAME_VALUE} - Verify validate/edit operations`;
        addAzureProviderAndOpenEditForm({
          nameValue: nameFieldValue,
        });

        cy.getFormSelectFieldById({ selectId: 'provider_region' }).select(
          REGION_OPTION_CENTRAL_US
        );
        validate({
          stubErrorResponse: false,
        });
        assertValidationSuccessMessage();
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Save',
          buttonType: 'submit',
        })
          .should('be.enabled')
          .click();
        cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_OPERATION_SAVED);
      });

      afterEach(() => {
        // TODO: add better clean up approach
        cleanUp({ createdProviderName: nameFieldValue });
      });
    });

    describe('Provider name uniqueness validation', () => {
      const nameFieldValue = `${AZURE_NAME_VALUE} - Verify duplicate restriction`;

      beforeEach(() => {
        fillAzureForm({
          nameValue: nameFieldValue,
        });
        validate({
          stubErrorResponse: false,
        });
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Add',
          buttonType: 'submit',
        }).click();
      });

      it('Should display error on duplicate name usage', () => {
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_PROVIDER_CONFIG_OPTION);
        fillAzureForm({
          nameValue: nameFieldValue,
        });
        assertNameAlreadyExistsError();
      });

      afterEach(() => {
        // TODO: add better clean up approach
        cleanUp({ createdProviderName: nameFieldValue });
      });
    });
  });

  describe('Validate cloud provider type: Amazon EC2', () => {
    describe('Validate add form', () => {
      it('Validate visibility of elements', () => {
        validateAmazonEC2FormFields(false);
      });

      it('Should show the error message from the task_results API upon validation failure and validate cancel button behavior', () => {
        fillAmazonEC2Form({
          nameValue: `${AMAZON_EC2_NAME_VALUE} - Verify add form validation error`,
        });
        validate({
          stubErrorResponse: true,
          errorMessage: AMAZON_EC2_VALIDATION_ERROR,
        });
        assertValidationFailureMessage();

        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' }).click();
        cy.expect_flash(
          flashClassMap.success,
          FLASH_MESSAGE_OPERATION_CANCELLED
        );
      });

      it('Verify successful validate + add/refresh/delete operations', () => {
        const nameFieldValue = `${AMAZON_EC2_NAME_VALUE} - Verify validate/add/refresh/delete operations`;
        fillAmazonEC2Form({
          nameValue: nameFieldValue,
        });
        validate({
          stubErrorResponse: false,
        });
        assertValidationSuccessMessage();
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Add',
          buttonType: 'submit',
        })
          .should('be.enabled')
          .click();
        cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_OPERATION_SAVED);
        selectCreatedProvider(nameFieldValue);
        cy.expect_browser_confirm_with_text({
          confirmTriggerFn: () =>
            cy.toolbar(CONFIG_TOOLBAR_BUTTON, REFRESH_CONFIG_OPTION),
          containsText: REFRESH_OPERATION_MESSAGE,
        });
        cy.expect_flash(flashClassMap.success, REFRESH_OPERATION_MESSAGE);

        // TODO: remove this block once bug is fixed
        // Bug: After refresh, config option other than add remains disabled and requires any action to be performed to enable it back
        /* ==================================================================== */
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_PROVIDER_CONFIG_OPTION);
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' }).click();
        /* ==================================================================== */

        selectProviderAndDeleteWithOptionalFlashMessageCheck({
          createdProviderName: nameFieldValue,
          assertDeleteFlashMessage: true,
        });
      });
    });

    describe('Validate edit form', () => {
      /**
       * The provider name is set in this variable at the start of each test,
       * allowing afterEach to identify it for deletion.
       */
      let nameFieldValue;

      it('Validate visibility of elements', () => {
        nameFieldValue = `${AMAZON_EC2_NAME_VALUE} - Verify edit form elements`;
        addAmazonEC2ProviderAndOpenEditForm({
          nameValue: nameFieldValue,
        });

        validateAmazonEC2FormFields(true);
      });

      it("Should show the error message from the task_results API upon validation failure and validate reset & cancel buttons' behavior", () => {
        nameFieldValue = `${AMAZON_EC2_NAME_VALUE} - Verify edit form validation error`;
        addAmazonEC2ProviderAndOpenEditForm({
          nameValue: nameFieldValue,
        });

        cy.getFormSelectFieldById({ selectId: 'provider_region' }).select(
          REGION_OPTION_ASIA_PACIFIC
        );
        validate({
          stubErrorResponse: true,
          errorMessage: AMAZON_EC2_VALIDATION_ERROR,
        });
        assertValidationFailureMessage();
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Reset' })
          .should('be.enabled')
          .click();
        cy.getFormSelectFieldById({ selectId: 'provider_region' })
          .find('option:selected')
          .should('have.text', REGION_OPTION_CANADA);
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' }).click();
        cy.expect_flash(
          flashClassMap.success,
          FLASH_MESSAGE_OPERATION_CANCELLED
        );
      });

      it('Verify successful validate + edit operation', () => {
        nameFieldValue = `${AMAZON_EC2_NAME_VALUE} - Verify validate/edit operations`;
        addAmazonEC2ProviderAndOpenEditForm({
          nameValue: nameFieldValue,
        });

        cy.getFormSelectFieldById({ selectId: 'provider_region' }).select(
          REGION_OPTION_ASIA_PACIFIC
        );
        validate({
          stubErrorResponse: false,
        });
        assertValidationSuccessMessage();
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Save',
          buttonType: 'submit',
        })
          .should('be.enabled')
          .click();
        cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_OPERATION_SAVED);
      });

      afterEach(() => {
        // TODO: add better clean up approach
        cleanUp({ createdProviderName: nameFieldValue });
      });
    });

    describe('Provider name uniqueness validation', () => {
      const nameFieldValue = `${AMAZON_EC2_NAME_VALUE} - Verify duplicate restriction`;

      beforeEach(() => {
        fillAmazonEC2Form({
          nameValue: nameFieldValue,
        });
        validate({
          stubErrorResponse: false,
        });
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Add',
          buttonType: 'submit',
        }).click();
      });

      it('Should display error on duplicate name usage', () => {
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_PROVIDER_CONFIG_OPTION);
        fillAmazonEC2Form({
          nameValue: nameFieldValue,
        });
        assertNameAlreadyExistsError();
      });

      afterEach(() => {
        // TODO: add better clean up approach
        cleanUp({ createdProviderName: nameFieldValue });
      });
    });
  });

  describe('Validate cloud provider type: IBM PowerVC', () => {
    describe('Validate add form', () => {
      it('Validate visibility of elements', () => {
        validateIbmPowerVcFormFields(false);
      });

      it('Should show the error message from the task_results API upon validation failure and validate cancel button behavior', () => {
        fillIbmPowerVcForm({
          nameValue: `${IBM_POWERVC_NAME_VALUE} - Verify add form validation error`,
          hostValue: 'ibm-powervc.verify-add-form-validation-error.com',
        });
        validate({
          stubErrorResponse: true,
          errorMessage: IBM_POWERVC_VALIDATION_ERROR,
        });
        assertValidationFailureMessage();

        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' }).click();
        cy.expect_flash(
          flashClassMap.success,
          FLASH_MESSAGE_OPERATION_CANCELLED
        );
      });

      it('Verify successful validate + add/refresh/delete operations', () => {
        const nameFieldValue = `${IBM_POWERVC_NAME_VALUE} - Verify validate/add/refresh/delete operations`;
        fillIbmPowerVcForm({
          nameValue: nameFieldValue,
          hostValue:
            'ibm-powervc.verify-validate-add-refresh-delete-operations.com',
        });
        validate({
          stubErrorResponse: false,
        });
        assertValidationSuccessMessage();
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Add',
          buttonType: 'submit',
        })
          .should('be.enabled')
          .click();
        cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_OPERATION_SAVED);
        selectCreatedProvider(nameFieldValue);
        cy.expect_browser_confirm_with_text({
          confirmTriggerFn: () =>
            cy.toolbar(CONFIG_TOOLBAR_BUTTON, REFRESH_CONFIG_OPTION),
          containsText: REFRESH_OPERATION_MESSAGE,
        });
        cy.expect_flash(flashClassMap.success, REFRESH_OPERATION_MESSAGE);

        // TODO: remove this block once bug is fixed
        // Bug: After refresh, config option other than add remains disabled and requires any action to be performed to enable it back
        /* ==================================================================== */
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_PROVIDER_CONFIG_OPTION);
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' }).click();
        /* ==================================================================== */

        selectProviderAndDeleteWithOptionalFlashMessageCheck({
          createdProviderName: nameFieldValue,
          assertDeleteFlashMessage: true,
        });
      });
    });

    describe('Validate edit form', () => {
      /**
       * The provider name is set in this variable at the start of each test,
       * allowing afterEach to identify it for deletion.
       */
      let nameFieldValue;

      it('Validate visibility of elements', () => {
        nameFieldValue = `${IBM_POWERVC_NAME_VALUE} - Verify edit form elements`;
        addIbmPowerVcProviderAndOpenEditForm({
          nameValue: nameFieldValue,
          hostValue: 'ibm-powervc.verify-edit-form-elements.com',
        });

        validateIbmPowerVcFormFields(true);
      });

      it("Should show the error message from the task_results API upon validation failure and validate reset & cancel buttons' behavior", () => {
        nameFieldValue = `${IBM_POWERVC_NAME_VALUE} - Verify edit form validation error`;
        addIbmPowerVcProviderAndOpenEditForm({
          nameValue: nameFieldValue,
          hostValue: 'ibm-powervc.verify-edit-form-validation-error.com',
        });

        cy.getFormSelectFieldById({
          selectId: 'endpoints.default.security_protocol',
        }).select(SECURITY_PROTOCOL_NON_SSL);
        validate({
          stubErrorResponse: true,
          errorMessage: IBM_POWERVC_VALIDATION_ERROR,
        });
        assertValidationFailureMessage();
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Reset' })
          .should('be.enabled')
          .click();
        cy.getFormSelectFieldById({
          selectId: 'endpoints.default.security_protocol',
        })
          .find('option:selected')
          .should('have.text', SECURITY_PROTOCOL_SSL);
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' }).click();
        cy.expect_flash(
          flashClassMap.success,
          FLASH_MESSAGE_OPERATION_CANCELLED
        );
      });

      it('Verify successful validate + edit operation', () => {
        nameFieldValue = `${IBM_POWERVC_NAME_VALUE} - Verify validate/edit operations`;
        addIbmPowerVcProviderAndOpenEditForm({
          nameValue: nameFieldValue,
          hostValue: 'ibm-powervc.verify-validate-edit-operations.com',
        });

        cy.getFormSelectFieldById({
          selectId: 'endpoints.default.security_protocol',
        }).select(SECURITY_PROTOCOL_NON_SSL);
        validate({
          stubErrorResponse: false,
        });
        assertValidationSuccessMessage();
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Save',
          buttonType: 'submit',
        })
          .should('be.enabled')
          .click();
        cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_OPERATION_SAVED);
      });

      afterEach(() => {
        // TODO: add better clean up approach
        cleanUp({ createdProviderName: nameFieldValue });
      });
    });

    describe('Provider name uniqueness validation', () => {
      const nameFieldValue = `${IBM_POWERVC_NAME_VALUE} - Verify duplicate restriction`;

      beforeEach(() => {
        fillIbmPowerVcForm({
          nameValue: nameFieldValue,
          hostValue: 'ibm-powervc.verify-duplicate-restriction.com',
        });
        validate({
          stubErrorResponse: false,
        });
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Add',
          buttonType: 'submit',
        }).click();
      });

      it('Should display error on duplicate name usage', () => {
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_PROVIDER_CONFIG_OPTION);
        fillIbmPowerVcForm({
          nameValue: nameFieldValue,
          hostValue: 'ibm-powervc.verify-duplicate-restriction.com',
        });
        assertNameAlreadyExistsError();
      });

      afterEach(() => {
        // TODO: add better clean up approach
        cleanUp({ createdProviderName: nameFieldValue });
      });
    });
  });

  describe('Validate cloud provider type: IBM Cloud Infrastructure Center', () => {
    describe('Validate add form', () => {
      it('Validate visibility of elements', () => {
        validateIbmCloudInfrastructureCenterFormFields(false);
      });

      it('Should show the error message from the task_results API upon validation failure and validate cancel button behavior', () => {
        fillIbmCloudInfrastructureCenterForm({
          nameValue: `${IBM_CIC_NAME_VALUE} - Verify add form validation error`,
          hostValue: 'ibm-cic.verify-add-form-validation-error.com',
        });
        validate({
          stubErrorResponse: true,
          errorMessage: IBM_CIC_VALIDATION_ERROR,
        });
        assertValidationFailureMessage();

        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' }).click();
        cy.expect_flash(
          flashClassMap.success,
          FLASH_MESSAGE_OPERATION_CANCELLED
        );
      });

      it('Verify successful validate + add/refresh/delete operations', () => {
        const nameFieldValue = `${IBM_CIC_NAME_VALUE} - Verify validate/add/refresh/delete operations`;
        fillIbmCloudInfrastructureCenterForm({
          nameValue: nameFieldValue,
          hostValue:
            'ibm-cic.verify-validate-add-refresh-delete-operations.com',
        });
        validate({
          stubErrorResponse: false,
        });
        assertValidationSuccessMessage();
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Add',
          buttonType: 'submit',
        })
          .should('be.enabled')
          .click();
        cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_OPERATION_SAVED);
        selectCreatedProvider(nameFieldValue);
        cy.expect_browser_confirm_with_text({
          confirmTriggerFn: () =>
            cy.toolbar(CONFIG_TOOLBAR_BUTTON, REFRESH_CONFIG_OPTION),
          containsText: REFRESH_OPERATION_MESSAGE,
        });
        cy.expect_flash(flashClassMap.success, REFRESH_OPERATION_MESSAGE);

        // TODO: remove this block once bug is fixed
        // Bug: After refresh, config option other than add remains disabled and requires any action to be performed to enable it back
        /* ==================================================================== */
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_PROVIDER_CONFIG_OPTION);
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' }).click();
        /* ==================================================================== */

        selectProviderAndDeleteWithOptionalFlashMessageCheck({
          createdProviderName: nameFieldValue,
          assertDeleteFlashMessage: true,
        });
      });
    });

    describe('Validate edit form', () => {
      /**
       * The provider name is set in this variable at the start of each test,
       * allowing afterEach to identify it for deletion.
       */
      let nameFieldValue;

      it('Validate visibility of elements', () => {
        nameFieldValue = `${IBM_CIC_NAME_VALUE} - Verify edit form elements`;
        addIbmCloudInfrastructureCenterProviderAndOpenEditForm({
          nameValue: nameFieldValue,
          hostValue: 'ibm-cic.verify-edit-form-elements.com',
        });

        validateIbmCloudInfrastructureCenterFormFields(true);
      });

      it("Should show the error message from the task_results API upon validation failure and validate reset & cancel buttons' behavior", () => {
        nameFieldValue = `${IBM_CIC_NAME_VALUE} - Verify edit form validation error`;
        addIbmCloudInfrastructureCenterProviderAndOpenEditForm({
          nameValue: nameFieldValue,
          hostValue: 'ibm-cic.verify-edit-form-validation-error.com',
        });

        cy.getFormSelectFieldById({
          selectId: 'endpoints.default.security_protocol',
        }).select(SECURITY_PROTOCOL_NON_SSL);
        validate({
          stubErrorResponse: true,
          errorMessage: IBM_CIC_VALIDATION_ERROR,
        });
        assertValidationFailureMessage();
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Reset' })
          .should('be.enabled')
          .click();
        cy.getFormSelectFieldById({
          selectId: 'endpoints.default.security_protocol',
        })
          .find('option:selected')
          .should('have.text', SECURITY_PROTOCOL_SSL);
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' }).click();
        cy.expect_flash(
          flashClassMap.success,
          FLASH_MESSAGE_OPERATION_CANCELLED
        );
      });

      it('Verify successful validate + edit operation', () => {
        nameFieldValue = `${IBM_CIC_NAME_VALUE} - Verify validate/edit operations`;
        addIbmCloudInfrastructureCenterProviderAndOpenEditForm({
          nameValue: nameFieldValue,
          hostValue: 'ibm-cic.verify-validate-edit-operations.com',
        });

        cy.getFormSelectFieldById({
          selectId: 'endpoints.default.security_protocol',
        }).select(SECURITY_PROTOCOL_NON_SSL);
        validate({
          stubErrorResponse: false,
        });
        assertValidationSuccessMessage();
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Save',
          buttonType: 'submit',
        })
          .should('be.enabled')
          .click();
        cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_OPERATION_SAVED);
      });

      afterEach(() => {
        // TODO: add better clean up approach
        cleanUp({ createdProviderName: nameFieldValue });
      });
    });

    describe('Provider name uniqueness validation', () => {
      const nameFieldValue = `${IBM_CIC_NAME_VALUE} - Verify duplicate restriction`;

      beforeEach(() => {
        fillIbmCloudInfrastructureCenterForm({
          nameValue: nameFieldValue,
          hostValue: 'ibm-cic.verify-duplicate-restriction.com',
        });
        validate({
          stubErrorResponse: false,
        });
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Add',
          buttonType: 'submit',
        }).click();
      });

      it('Should display error on duplicate name usage', () => {
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_PROVIDER_CONFIG_OPTION);
        fillIbmCloudInfrastructureCenterForm({
          nameValue: nameFieldValue,
          hostValue: 'ibm-cic.verify-duplicate-restriction.com',
        });
        assertNameAlreadyExistsError();
      });

      afterEach(() => {
        // TODO: add better clean up approach
        cleanUp({ createdProviderName: nameFieldValue });
      });
    });
  });

  describe('Validate cloud provider type: Openstack', () => {
    describe('Validate add form', () => {
      it('Validate visibility of elements', () => {
        validateOpenstackFormFields(false);
      });

      it('Should show the error message from the task_results API upon validation failure and validate cancel button behavior', () => {
        fillOpenstackForm({
          nameValue: `${OPENSTACK_NAME_VALUE} - Verify add form validation error`,
          hostValue: 'openstack.verify-add-form-validation-error.com',
        });
        validate({
          stubErrorResponse: true,
          errorMessage: OPENSTACK_VALIDATION_ERROR,
        });
        assertValidationFailureMessage();

        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' }).click();
        cy.expect_flash(
          flashClassMap.success,
          FLASH_MESSAGE_OPERATION_CANCELLED
        );
      });

      it('Verify successful validate + add/refresh/delete operations', () => {
        const nameFieldValue = `${OPENSTACK_NAME_VALUE} - Verify validate/add/refresh/delete operations`;
        fillOpenstackForm({
          nameValue: nameFieldValue,
          hostValue:
            'openstack.verify-validate-add-refresh-delete-operations.com',
        });
        validate({
          stubErrorResponse: false,
        });
        assertValidationSuccessMessage();
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Add',
          buttonType: 'submit',
        })
          .should('be.enabled')
          .click();
        cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_OPERATION_SAVED);
        selectCreatedProvider(nameFieldValue);
        cy.expect_browser_confirm_with_text({
          confirmTriggerFn: () =>
            cy.toolbar(CONFIG_TOOLBAR_BUTTON, REFRESH_CONFIG_OPTION),
          containsText: REFRESH_OPERATION_MESSAGE,
        });
        cy.expect_flash(flashClassMap.success, REFRESH_OPERATION_MESSAGE);

        // TODO: remove this block once bug is fixed
        // Bug: After refresh, config option other than add remains disabled and requires any action to be performed to enable it back
        /* ==================================================================== */
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_PROVIDER_CONFIG_OPTION);
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' }).click();
        /* ==================================================================== */

        selectProviderAndDeleteWithOptionalFlashMessageCheck({
          createdProviderName: nameFieldValue,
          assertDeleteFlashMessage: true,
        });
      });
    });

    describe('Validate edit form', () => {
      /**
       * The provider name is set in this variable at the start of each test,
       * allowing afterEach to identify it for deletion.
       */
      let nameFieldValue;

      it('Validate visibility of elements', () => {
        nameFieldValue = `${OPENSTACK_NAME_VALUE} - Verify edit form elements`;
        addOpenstackProviderAndOpenEditForm({
          nameValue: nameFieldValue,
          hostValue: 'openstack.verify-edit-form-elements.com',
        });

        validateOpenstackFormFields(true);
      });

      it("Should show the error message from the task_results API upon validation failure and validate reset & cancel buttons' behavior", () => {
        nameFieldValue = `${OPENSTACK_NAME_VALUE} - Verify edit form validation error`;
        addOpenstackProviderAndOpenEditForm({
          nameValue: nameFieldValue,
          hostValue: 'openstack.verify-edit-form-validation-error.com',
        });

        cy.getFormSelectFieldById({
          selectId: 'endpoints.default.security_protocol',
        }).select(SECURITY_PROTOCOL_NON_SSL);
        validate({
          stubErrorResponse: true,
          errorMessage: OPENSTACK_VALIDATION_ERROR,
        });
        assertValidationFailureMessage();
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Reset' })
          .should('be.enabled')
          .click();
        cy.getFormSelectFieldById({
          selectId: 'endpoints.default.security_protocol',
        })
          .find('option:selected')
          .should('have.text', SECURITY_PROTOCOL_SSL);
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' }).click();
        cy.expect_flash(
          flashClassMap.success,
          FLASH_MESSAGE_OPERATION_CANCELLED
        );
      });

      it('Verify successful validate + edit operation', () => {
        nameFieldValue = `${OPENSTACK_NAME_VALUE} - Verify validate/edit operations`;
        addOpenstackProviderAndOpenEditForm({
          nameValue: nameFieldValue,
          hostValue: 'openstack.verify-validate-edit-operations.com',
        });

        cy.getFormSelectFieldById({
          selectId: 'endpoints.default.security_protocol',
        }).select(SECURITY_PROTOCOL_NON_SSL);
        validate({
          stubErrorResponse: false,
        });
        assertValidationSuccessMessage();
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Save',
          buttonType: 'submit',
        })
          .should('be.enabled')
          .click();
        cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_OPERATION_SAVED);
      });

      afterEach(() => {
        // TODO: add better clean up approach
        cleanUp({ createdProviderName: nameFieldValue });
      });
    });

    describe('Provider name uniqueness validation', () => {
      const nameFieldValue = `${OPENSTACK_NAME_VALUE} - Verify duplicate restriction`;

      beforeEach(() => {
        fillOpenstackForm({
          nameValue: nameFieldValue,
          hostValue: 'openstack.verify-duplicate-restriction.com',
        });
        validate({
          stubErrorResponse: false,
        });
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Add',
          buttonType: 'submit',
        }).click();
      });

      it('Should display error on duplicate name usage', () => {
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_PROVIDER_CONFIG_OPTION);
        fillOpenstackForm({
          nameValue: nameFieldValue,
          hostValue: 'openstack.verify-duplicate-restriction.com',
        });
        assertNameAlreadyExistsError();
      });

      afterEach(() => {
        // TODO: add better clean up approach
        cleanUp({ createdProviderName: nameFieldValue });
      });
    });
  });
});
