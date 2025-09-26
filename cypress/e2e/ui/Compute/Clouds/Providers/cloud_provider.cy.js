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
    // On edit form assert type dropdown is visible & disabled and then check it has value as "VMware vCloud"
    cy.getFormSelectFieldById({ selectId: 'type' })
      .should('be.visible')
      .and('be.disabled')
      .find('option:selected')
      .should('have.text', PROVIDER_TYPE_VMWARE_VCLOUD);
  } else {
    // On add form assert type dropdown is visible & enabled and then select "VMware vCloud" option
    cy.getFormSelectFieldById({ selectId: 'type' })
      .should('be.visible')
      .and('be.enabled')
      .select(PROVIDER_TYPE_VMWARE_VCLOUD);
  }
  // Assert name text field is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'name' })
    .should('be.visible')
    .and('contain.text', NAME_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'name' })
    .should('be.visible')
    .and('be.enabled');
  // Assert zone dropdown is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'zone_id' })
    .should('be.visible')
    .and('contain.text', ZONE_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'zone_id' })
    .should('be.visible')
    .and('be.enabled');
  // Assert API Version dropdown is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'api_version' })
    .should('be.visible')
    .and('contain.text', API_VERSION_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'api_version' })
    .should('be.visible')
    .and('be.enabled');
  // Assert Endpoints sub header is visible
  cy.contains('h3', 'Endpoints').should('be.visible');
  /* Verify Default tab fields */
  // Assert host name text field is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'endpoints.default.hostname' })
    .should('be.visible')
    .and('contain.text', HOSTNAME_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'endpoints.default.hostname' })
    .should('be.visible')
    .and('be.enabled');
  // Assert port dropdown is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'endpoints.default.port' })
    .should('be.visible')
    .and('contain.text', API_PORT_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({
    inputId: 'endpoints.default.port',
    inputType: 'number',
  })
    .should('be.visible')
    .and('be.enabled');
  // Assert username text field is visible and enabled
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
  // Assert password text field is visible & enabled on add form, and then disabled on edit form
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
  // Assert Validate button is visible and disabled
  cy.contains('#default-tab__panel button', 'Validate')
    .should('be.visible')
    .and('be.disabled');
  // Switch to Events tab
  cy.tabs({ tabLabel: EVENTS_TAB_LABEL });
  /* Verify Events tab fields */
  // Assert events type dropdown is visible & enabled and then select "AMQP" option
  cy.getFormLabelByForAttribute({ forValue: 'event_stream_selection' })
    .should('be.visible')
    .and('contain.text', TYPE_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'event_stream_selection' })
    .should('be.visible')
    .and('be.enabled')
    .select(EVENT_STREAM_TYPE_AMQP);
  /* Verify AMQP specific fields are visible */
  // Assert security protocol dropdown is visible and enabled
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
  // Assert hostname text field is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'endpoints.amqp.hostname' })
    .should('be.visible')
    .and('contain.text', HOSTNAME_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'endpoints.amqp.hostname' })
    .should('be.visible')
    .and('be.enabled');
  // Assert port dropdown is visible and enabled
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
  // Assert username text field is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'authentications.amqp.userid' })
    .should('be.visible')
    .and('contain.text', USERNAME_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({
    inputId: 'authentications.amqp.userid',
  })
    .should('be.visible')
    .and('be.enabled');
  // Assert password text field is visible & enabled on add form, and then disabled on edit form
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
  // Assert Validate button is visible and disabled
  cy.contains('#events-tab__panel button', 'Validate')
    .should('be.visible')
    .and('be.disabled');
  // Assert add/save button is visible and disabled
  cy.getFormFooterButtonByTypeWithText({
    buttonText: isEdit ? 'Save' : 'Add',
    buttonType: 'submit',
  })
    .should('be.visible')
    .and('be.disabled');
  if (isEdit) {
    // Assert reset button is visible and enabled on edit form
    cy.getFormFooterButtonByTypeWithText({ buttonText: 'Reset' })
      .should('be.visible')
      .and('be.enabled');
  }
  // Assert cancel button is visible and enabled
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
  // Select the created provider
  selectCreatedProvider(nameValue);
  // Open edit form
  cy.toolbar(CONFIG_TOOLBAR_BUTTON, EDIT_PROVIDER_CONFIG_OPTION);
}

// Methods for Oracle Cloud
function validateOracleCloudFormFields(isEdit) {
  cy.getFormLabelByForAttribute({ forValue: 'type' })
    .should('be.visible')
    .and('contain.text', TYPE_FIELD_LABEL);
  if (isEdit) {
    // On edit form assert type dropdown is visible & disabled and then check it has value as "Oracle Cloud"
    cy.getFormSelectFieldById({ selectId: 'type' })
      .should('be.visible')
      .and('be.disabled')
      .find('option:selected')
      .should('have.text', PROVIDER_TYPE_ORACLE_CLOUD);
  } else {
    // On add form assert type dropdown is visible & enabled and then select "Oracle Cloud" option
    cy.getFormSelectFieldById({ selectId: 'type' })
      .should('be.visible')
      .and('be.enabled')
      .select(PROVIDER_TYPE_ORACLE_CLOUD);
  }
  // Assert name text field is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'name' })
    .should('be.visible')
    .and('contain.text', NAME_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'name' })
    .should('be.visible')
    .and('be.enabled');
  // Assert zone dropdown is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'zone_id' })
    .should('be.visible')
    .and('contain.text', ZONE_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'zone_id' })
    .should('be.visible')
    .and('be.enabled');
  // Assert region dropdown is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'provider_region' })
    .should('be.visible')
    .and('contain.text', REGION_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'provider_region' })
    .should('be.visible')
    .and('be.enabled');
  // Assert tenant-id text field is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'uid_ems' })
    .should('be.visible')
    .and('contain.text', TENANT_ID_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'uid_ems' })
    .should('be.visible')
    .and('be.enabled');
  // Assert Endpoints sub header is visible
  cy.contains('h3', 'Endpoints').should('be.visible');
  // Assert user-id text field is visible and enabled
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
  // Assert private key text area is visible and enabled on add form, and then disabled on edit form
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
  // Assert public key text area is visible and enabled
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
  // Assert Validate button is visible and disabled
  cy.contains('button', 'Validate').should('be.visible').and('be.disabled');
  // Assert add/save button is visible and disabled
  cy.getFormFooterButtonByTypeWithText({
    buttonText: isEdit ? 'Save' : 'Add',
    buttonType: 'submit',
  })
    .should('be.visible')
    .and('be.disabled');
  if (isEdit) {
    // Assert reset button is visible and disabled on edit form
    cy.getFormFooterButtonByTypeWithText({ buttonText: 'Reset' })
      .should('be.visible')
      .and('be.disabled');
  }
  // Assert cancel button is visible and enabled
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
  // Select the created provider
  selectCreatedProvider(nameValue);
  // Open edit form
  cy.toolbar(CONFIG_TOOLBAR_BUTTON, EDIT_PROVIDER_CONFIG_OPTION);
}

// Methods for IBM Cloud VPC
function validateIbmCloudVpcFormFields(isEdit) {
  cy.getFormLabelByForAttribute({ forValue: 'type' })
    .should('be.visible')
    .and('contain.text', TYPE_FIELD_LABEL);
  if (isEdit) {
    // On edit form assert type dropdown is visible & disabled and then check it has value as "IBM Cloud VPC"
    cy.getFormSelectFieldById({ selectId: 'type' })
      .should('be.visible')
      .and('be.disabled')
      .find('option:selected')
      .should('have.text', PROVIDER_TYPE_IBM_CLOUD_VPC);
  } else {
    // On add form assert type dropdown is visible & enabled and then select "IBM Cloud VPC" option
    cy.getFormSelectFieldById({ selectId: 'type' })
      .should('be.visible')
      .and('be.enabled')
      .select(PROVIDER_TYPE_IBM_CLOUD_VPC);
  }
  // Assert name text field is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'name' })
    .should('be.visible')
    .and('contain.text', NAME_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'name' })
    .should('be.visible')
    .and('be.enabled');
  // Assert zone dropdown is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'zone_id' })
    .should('be.visible')
    .and('contain.text', ZONE_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'zone_id' })
    .should('be.visible')
    .and('be.enabled');
  // Assert region dropdown is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'provider_region' })
    .should('be.visible')
    .and('contain.text', REGION_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'provider_region' })
    .should('be.visible')
    .and('be.enabled');
  // Assert Endpoint header is visible
  cy.contains('h3', 'Endpoint').should('be.visible');
  // Assert IBM cloud API key text field is visible & enabled on add form, and then disabled on edit form
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
  // Assert Validate button is visible and disabled
  cy.contains('button', 'Validate').should('be.visible').and('be.disabled');
  // Switch to Metrics tab
  cy.tabs({ tabLabel: METRICS_TAB_LABEL });
  // Assert metrics type dropdown is visible & enabled and then select "Enabled" option for metrics
  cy.getFormLabelByForAttribute({ forValue: 'metrics_selection' })
    .should('be.visible')
    .and('contain.text', TYPE_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'metrics_selection' })
    .should('be.visible')
    .and('be.enabled')
    .select(ENABLED_SELECT_OPTION);
  // Assert IBM cloud monitoring instance GUID text field is visible and enabled
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
  // Switch to Events tab
  cy.tabs({ tabLabel: EVENTS_TAB_LABEL });
  // Assert events type dropdown is visible & enabled
  cy.getFormLabelByForAttribute({ forValue: 'events_selection' })
    .should('be.visible')
    .and('contain.text', TYPE_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'events_selection' })
    .should('be.visible')
    .and('be.enabled')
    .select(ENABLED_SELECT_OPTION);
  // Assert IBM cloud activity tracker instance service key text field is visible and enabled
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
  // Assert add/save button is visible & disabled on add form and enabled on edit form
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
    // Assert reset button is visible and enabled on edit form
    cy.getFormFooterButtonByTypeWithText({ buttonText: 'Reset' })
      .should('be.visible')
      .and('be.enabled');
  }
  // Assert cancel button is visible and enabled
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
  // Select the created provider
  selectCreatedProvider(nameValue);
  // Open edit form
  cy.toolbar(CONFIG_TOOLBAR_BUTTON, EDIT_PROVIDER_CONFIG_OPTION);
}

// Methods for IBM Power Systems Virtual Servers
function validateIbmPowerSystemsVirtualServersFormFields(isEdit) {
  cy.getFormLabelByForAttribute({ forValue: 'type' })
    .should('be.visible')
    .and('contain.text', TYPE_FIELD_LABEL);
  if (isEdit) {
    // On edit form assert type dropdown is visible & disabled and then check it has value as "IBM Power Systems Virtual Servers"
    cy.getFormSelectFieldById({ selectId: 'type' })
      .should('be.visible')
      .and('be.disabled')
      .find('option:selected')
      .should('have.text', PROVIDER_TYPE_IBM_POWER_SYSTEMS);
  } else {
    // On add form assert type dropdown is visible & enabled and then select "IBM Power Systems Virtual Servers" option
    cy.getFormSelectFieldById({ selectId: 'type' })
      .should('be.visible')
      .and('be.enabled')
      .select(PROVIDER_TYPE_IBM_POWER_SYSTEMS);
  }
  // Assert name text field is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'name' })
    .should('be.visible')
    .and('contain.text', NAME_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'name' })
    .should('be.visible')
    .and('be.enabled');
  // Assert zone dropdown is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'zone_id' })
    .should('be.visible')
    .and('contain.text', ZONE_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'zone_id' })
    .should('be.visible')
    .and('be.enabled');
  // Assert Endpoints sub header is visible
  cy.contains('h3', 'Endpoints').should('be.visible');
  // Assert IBM cloud API key text field is visible & enabled on add form, and then disabled on edit form
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
  // Assert PowerVS service GUID text field is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'uid_ems' })
    .should('be.visible')
    .and('contain.text', SERVICE_COMMON_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'uid_ems' })
    .should('be.visible')
    .and('be.enabled');
  // Assert validate button is visible and disabled
  cy.contains('button', 'Validate').should('be.visible').and('be.disabled');
  // Assert add/save button is visible and disabled
  cy.getFormFooterButtonByTypeWithText({
    buttonText: isEdit ? 'Save' : 'Add',
    buttonType: 'submit',
  })
    .scrollIntoView()
    .should('be.visible')
    .and('be.disabled');
  if (isEdit) {
    // Assert reset button is visible and disabled on edit form
    cy.getFormFooterButtonByTypeWithText({ buttonText: 'Reset' })
      .should('be.visible')
      .and('be.disabled');
  }
  // Assert cancel button is visible and enabled
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
  // Select the created provider
  selectCreatedProvider(nameValue);
  // Open edit form
  cy.toolbar(CONFIG_TOOLBAR_BUTTON, EDIT_PROVIDER_CONFIG_OPTION);
}

// Methods for Google Compute Engine
function validateGoogleComputeEngineFormFields(isEdit) {
  cy.getFormLabelByForAttribute({ forValue: 'type' })
    .should('be.visible')
    .and('contain.text', TYPE_FIELD_LABEL);
  if (isEdit) {
    // On edit form assert type dropdown is visible & disabled and then check it has value as "Google Compute Engine"
    cy.getFormSelectFieldById({ selectId: 'type' })
      .should('be.visible')
      .and('be.disabled')
      .find('option:selected')
      .should('have.text', PROVIDER_TYPE_GOOGLE_COMPUTE);
  } else {
    // On add form assert type dropdown is visible & enabled and then select "Google Compute Engine" option
    cy.getFormSelectFieldById({ selectId: 'type' })
      .should('be.visible')
      .and('be.enabled')
      .select(PROVIDER_TYPE_GOOGLE_COMPUTE);
  }
  // Assert name text field is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'name' })
    .should('be.visible')
    .and('contain.text', NAME_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'name' })
    .should('be.visible')
    .and('be.enabled');
  // Assert zone dropdown is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'zone_id' })
    .should('be.visible')
    .and('contain.text', ZONE_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'zone_id' })
    .should('be.visible')
    .and('be.enabled');
  // Assert Project ID text field is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'project' })
    .should('be.visible')
    .and('contain.text', PROJECT_ID_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'project' })
    .should('be.visible')
    .and('be.enabled');
  // Assert Endpoint header is visible
  cy.contains('h3', 'Endpoint').should('be.visible');
  // Assert Service account JSON textarea is visible and enabled on add form, and then disabled on edit form
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
  // Assert Validate button is visible and disabled
  cy.contains('button', 'Validate')
    .scrollIntoView()
    .should('be.visible')
    .and('be.disabled');
  // Assert add/save button is visible & disabled
  cy.getFormFooterButtonByTypeWithText({
    buttonText: isEdit ? 'Save' : 'Add',
    buttonType: 'submit',
  })
    .should('be.visible')
    .and('be.disabled');
  if (isEdit) {
    // Assert reset button is visible & disabled on edit form
    cy.getFormFooterButtonByTypeWithText({ buttonText: 'Reset' })
      .should('be.visible')
      .and('be.disabled');
  }
  // Assert cancel button is visible and enabled
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
  // Select the created provider
  selectCreatedProvider(nameValue);
  // Open edit form
  cy.toolbar(CONFIG_TOOLBAR_BUTTON, EDIT_PROVIDER_CONFIG_OPTION);
}

// Methods for Azure Stack
function validateAzureStackFormFields(isEdit) {
  cy.getFormLabelByForAttribute({ forValue: 'type' })
    .should('be.visible')
    .and('contain.text', TYPE_FIELD_LABEL);
  if (isEdit) {
    // On edit form assert type dropdown is visible & disabled and then check it has value as "Azure Stack"
    cy.getFormSelectFieldById({ selectId: 'type' })
      .should('be.visible')
      .and('be.disabled')
      .find('option:selected')
      .should('have.text', PROVIDER_TYPE_AZURE_STACK);
  } else {
    // On add form assert type dropdown is visible & enabled and then select "Azure Stack" option
    cy.getFormSelectFieldById({ selectId: 'type' })
      .should('be.visible')
      .and('be.enabled')
      .select(PROVIDER_TYPE_AZURE_STACK);
  }
  // Assert name text field is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'name' })
    .should('be.visible')
    .and('contain.text', NAME_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'name' })
    .should('be.visible')
    .and('be.enabled');
  // Assert zone dropdown is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'zone_id' })
    .should('be.visible')
    .and('contain.text', ZONE_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'zone_id' })
    .should('be.visible')
    .and('be.enabled');
  // Assert tenant ID text field is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'uid_ems' })
    .should('be.visible')
    .and('contain.text', TENANT_ID_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'uid_ems' })
    .should('be.visible')
    .and('be.enabled');
  // Assert subscription ID text field is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'subscription' })
    .should('be.visible')
    .and('contain.text', SUBSCRIPTION_ID_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'subscription' })
    .should('be.visible')
    .and('be.enabled');
  // Assert API Version dropdown is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'api_version' })
    .should('be.visible')
    .and('contain.text', API_VERSION_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'api_version' })
    .should('be.visible')
    .and('be.enabled');
  // Assert Endpoint header is visible
  cy.contains('h3', 'Endpoint').should('be.visible');
  // Assert security protocol dropdown is visible and enabled
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
  // Assert hostname text field is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'endpoints.default.hostname' })
    .should('be.visible')
    .and('contain.text', HOSTNAME_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'endpoints.default.hostname' })
    .scrollIntoView()
    .should('be.visible')
    .and('be.enabled');
  // Assert port input field is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'endpoints.default.port' })
    .should('be.visible')
    .and('contain.text', API_PORT_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({
    inputId: 'endpoints.default.port',
    inputType: 'number',
  })
    .should('be.visible')
    .and('be.enabled');
  // Assert username text field is visible and enabled
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
  // Assert password field is visible and enabled on add form, and then disabled on edit form
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
  // Assert Validate button is visible and disabled
  cy.contains('button', 'Validate').should('be.visible').and('be.disabled');
  // Assert add/save button is visible & disabled
  cy.getFormFooterButtonByTypeWithText({
    buttonText: isEdit ? 'Save' : 'Add',
    buttonType: 'submit',
  })
    .should('be.visible')
    .and('be.disabled');
  if (isEdit) {
    // Assert reset button is visible & disabled on edit form
    cy.getFormFooterButtonByTypeWithText({ buttonText: 'Reset' })
      .should('be.visible')
      .and('be.disabled');
  }
  // Assert cancel button is visible and enabled
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
  // TODO: Switch to cy.interceptApi once controlled wait becomes optional, as it’s not needed in this case
  // and supports response stubbing.
  cy.intercept('POST', '/api/providers', (req) => {
    // Let the request go through to the server and then override the response statusCode
    // to 200, server will return internal_server_error(500) since we are using mock values
    // for fields like host, port, etc.
    req.continue((res) => {
      res.send(200);
    });
  }).as('addAzureStackProviderApi');
  cy.getFormFooterButtonByTypeWithText({
    buttonText: 'Add',
    buttonType: 'submit',
  }).click();
  cy.wait('@addAzureStackProviderApi');
  // Select the created provider
  selectCreatedProvider(nameValue);
  // Opening edit form:
  // TODO: Switch to cy.interceptApi once controlled wait becomes optional, as it’s not needed in this case
  // and supports response stubbing.
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
  // TODO: Switch to cy.interceptApi once controlled wait becomes optional, as it’s not needed in this case
  // and supports response stubbing.
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
    // On edit form assert type dropdown is visible & disabled and then check it has value as "Azure"
    cy.getFormSelectFieldById({ selectId: 'type' })
      .should('be.visible')
      .and('be.disabled')
      .find('option:selected')
      .should('have.text', PROVIDER_TYPE_AZURE);
  } else {
    // On add form assert type dropdown is visible & enabled and then select "Azure" option
    cy.getFormSelectFieldById({ selectId: 'type' })
      .should('be.visible')
      .and('be.enabled')
      .select(PROVIDER_TYPE_AZURE);
  }
  // Assert name text field is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'name' })
    .should('be.visible')
    .and('contain.text', NAME_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'name' })
    .should('be.visible')
    .and('be.enabled');
  // Assert zone dropdown is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'zone_id' })
    .should('be.visible')
    .and('contain.text', ZONE_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'zone_id' })
    .should('be.visible')
    .and('be.enabled');
  // Assert region dropdown is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'provider_region' })
    .should('be.visible')
    .and('contain.text', REGION_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'provider_region' })
    .should('be.visible')
    .and('be.enabled');
  // Assert tenant ID text field is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'uid_ems' })
    .should('be.visible')
    .and('contain.text', TENANT_ID_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'uid_ems' })
    .should('be.visible')
    .and('be.enabled');
  // Assert subscription ID text field is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'subscription' })
    .should('be.visible')
    .and('contain.text', SUBSCRIPTION_ID_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'subscription' })
    .should('be.visible')
    .and('be.enabled');
  // Assert Endpoint header is visible
  cy.contains('h3', 'Endpoint').should('be.visible');
  // Assert endpoint URL text field is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'endpoints.default.url' })
    .should('be.visible')
    .and('contain.text', ENDPOINT_URL_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'endpoints.default.url' })
    .should('be.visible')
    .and('be.enabled');
  // Assert client ID text field is visible and enabled
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
  // Assert client key text field is visible and enabled on add form, and then disabled on edit form
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
  // Assert Validate button is visible and disabled
  cy.contains('button', 'Validate').should('be.visible').and('be.disabled');
  // Assert add/save button is visible and disabled
  cy.getFormFooterButtonByTypeWithText({
    buttonText: isEdit ? 'Save' : 'Add',
    buttonType: 'submit',
  })
    .should('be.visible')
    .and('be.disabled');
  if (isEdit) {
    // Assert reset button is visible and disabled on edit form
    cy.getFormFooterButtonByTypeWithText({ buttonText: 'Reset' })
      .should('be.visible')
      .and('be.disabled');
  }
  // Assert cancel button is visible and enabled
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
  // Select the created provider
  selectCreatedProvider(nameValue);
  // Open edit form
  cy.toolbar(CONFIG_TOOLBAR_BUTTON, EDIT_PROVIDER_CONFIG_OPTION);
}

// Methods for Amazon EC2
function validateAmazonEC2FormFields(isEdit) {
  cy.getFormLabelByForAttribute({ forValue: 'type' })
    .should('be.visible')
    .and('contain.text', TYPE_FIELD_LABEL);
  if (isEdit) {
    // On edit form assert type dropdown is visible & disabled and then check it has value as "Amazon EC2"
    cy.getFormSelectFieldById({ selectId: 'type' })
      .should('be.visible')
      .and('be.disabled')
      .find('option:selected')
      .should('have.text', PROVIDER_TYPE_AMAZON_EC2);
  } else {
    // On add form assert type dropdown is visible & enabled and then select "Amazon EC2" option
    cy.getFormSelectFieldById({ selectId: 'type' })
      .should('be.visible')
      .and('be.enabled')
      .select(PROVIDER_TYPE_AMAZON_EC2);
  }
  // Assert name text field is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'name' })
    .should('be.visible')
    .and('contain.text', NAME_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'name' })
    .should('be.visible')
    .and('be.enabled');
  // Assert zone dropdown is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'zone_id' })
    .should('be.visible')
    .and('contain.text', ZONE_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'zone_id' })
    .should('be.visible')
    .and('be.enabled');
  // Assert region dropdown is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'provider_region' })
    .should('be.visible')
    .and('contain.text', REGION_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'provider_region' })
    .should('be.visible')
    .and('be.enabled');
  // Assert Endpoints header is visible
  cy.contains('h3', 'Endpoints').should('be.visible');
  // Assert endpoint URL text field is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'endpoints.default.url' })
    .should('be.visible')
    .and('contain.text', ENDPOINT_URL_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'endpoints.default.url' })
    .should('be.visible')
    .and('be.enabled');
  // Assert assume role ARN text field is visible and enabled
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
  // Assert access key ID text field is visible and enabled
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
  // Assert secret access key text field is visible & enabled on add form, and then disabled on edit form
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
  // Assert Validate button is visible and disabled
  cy.contains('button', 'Validate').should('be.visible').and('be.disabled');
  // Switch to SmartState Docker tab
  cy.tabs({ tabLabel: SMARTSTATE_DOCKER_TAB_LABEL });
  // Assert SmartState docker username field is visible and enabled
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
  // Assert SmartState docker password field is visible and enabled on add form, and then disabled on edit form
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
  // Assert add/save button is visible & disabled
  cy.getFormFooterButtonByTypeWithText({
    buttonText: isEdit ? 'Save' : 'Add',
    buttonType: 'submit',
  })
    .should('be.visible')
    .and('be.disabled');
  if (isEdit) {
    // Assert reset button is visible & disabled on edit form
    cy.getFormFooterButtonByTypeWithText({ buttonText: 'Reset' })
      .should('be.visible')
      .and('be.disabled');
  }
  // Assert cancel button is visible and enabled
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
  // Fill in the access key ID
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
  // Select the created provider
  selectCreatedProvider(nameValue);
  // Open edit form
  cy.toolbar(CONFIG_TOOLBAR_BUTTON, EDIT_PROVIDER_CONFIG_OPTION);
}

// Methods for IBM PowerVC
function validateIbmPowerVcFormFields(isEdit) {
  cy.getFormLabelByForAttribute({ forValue: 'type' })
    .should('be.visible')
    .and('contain.text', TYPE_FIELD_LABEL);
  if (isEdit) {
    // On edit form assert type dropdown is visible & disabled and then check it has value as "IBM PowerVC"
    cy.getFormSelectFieldById({ selectId: 'type' })
      .should('be.visible')
      .and('be.disabled')
      .find('option:selected')
      .should('have.text', PROVIDER_TYPE_IBM_POWERVC);
  } else {
    // On add form assert type dropdown is visible & enabled and then select "IBM PowerVC" option
    cy.getFormSelectFieldById({ selectId: 'type' })
      .should('be.visible')
      .and('be.enabled')
      .select(PROVIDER_TYPE_IBM_POWERVC);
  }
  // Assert name text field is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'name' })
    .should('be.visible')
    .and('contain.text', NAME_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'name' })
    .should('be.visible')
    .and('be.enabled');
  // Assert zone dropdown is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'zone_id' })
    .should('be.visible')
    .and('contain.text', ZONE_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'zone_id' })
    .should('be.visible')
    .and('be.enabled');
  // Assert provider region text field is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'provider_region' })
    .should('be.visible')
    .and('contain.text', PROVIDER_REGION_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'provider_region' })
    .should('be.visible')
    .and('be.enabled');
  // Assert tenant mapping enabled radio field is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'tenant_mapping_enabled' })
    .should('be.visible')
    .and('contain.text', TENANT_MAPPING_ENABLED_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({
    inputId: 'tenant_mapping_enabled',
    inputType: 'checkbox',
  })
    .should('be.visible')
    .and('be.enabled');
  // Assert Endpoints sub header is visible
  cy.contains('h3', 'Endpoints').should('be.visible');
  // Assert security protocol dropdown is visible and enabled
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
  // Assert PowerVC API endpoint text field is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'endpoints.default.hostname' })
    .scrollIntoView()
    .should('be.visible')
    .and('contain.text', POWERVC_API_ENDPOINT_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'endpoints.default.hostname' })
    .should('be.visible')
    .and('be.enabled');
  // Assert API port text field is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'endpoints.default.port' })
    .should('be.visible')
    .and('contain.text', API_PORT_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({
    inputId: 'endpoints.default.port',
    inputType: 'number',
  })
    .should('be.visible')
    .and('be.enabled');
  // Assert API username text field is visible and enabled
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
  // Assert API password text field is visible and enabled on add form, and then disabled on edit form
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
  // Assert Validate button is visible and disabled
  cy.contains('button', 'Validate').should('be.visible').and('be.disabled');
  // Switch to Events tab
  cy.tabs({ tabLabel: EVENTS_TAB_LABEL });
  // Assert events type dropdown is visible & enabled
  cy.getFormLabelByForAttribute({ forValue: 'event_stream_selection' })
    .should('be.visible')
    .and('contain.text', TYPE_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'event_stream_selection' })
    .should('be.visible')
    .and('be.enabled');
  // Switch to RSA key pair tab
  cy.tabs({ tabLabel: RSA_KEY_PAIR_TAB_LABEL });
  // Assert username text field is visible and enabled
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
  // Assert private key textarea is visible and enabled on add form and
  // private key text field is visible and disabled on edit form
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
  // Switch to Image Export tab
  cy.tabs({ tabLabel: IMAGE_EXPORT_TAB_LABEL });
  // Assert PowerVC server username text field is visible and enabled
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
  // Assert ansible access method dropdown is visible & enabled
  cy.getFormLabelByForAttribute({
    forValue: 'authentications.node.options',
  })
    .should('be.visible')
    .and('contain.text', ANSIBLE_ACCESS_METHOD_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'authentications.node.options' })
    .should('be.visible')
    .and('be.enabled');
  // Assert PowerVC server SSH private key passphrase text field is visible and enabled
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
  // Assert PowerVC server SSH private key textarea field is visible and enabled
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
  // Assert add/save button is visible & disabled
  cy.getFormFooterButtonByTypeWithText({
    buttonText: isEdit ? 'Save' : 'Add',
    buttonType: 'submit',
  })
    .scrollIntoView()
    .should('be.visible')
    .and('be.disabled');
  if (isEdit) {
    // Assert reset button is visible & disabled on edit form
    cy.getFormFooterButtonByTypeWithText({ buttonText: 'Reset' })
      .should('be.visible')
      .and('be.disabled');
  }
  // Assert cancel button is visible and enabled
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
  // Select the created provider
  selectCreatedProvider(nameValue);
  // Open edit form
  cy.toolbar(CONFIG_TOOLBAR_BUTTON, EDIT_PROVIDER_CONFIG_OPTION);
}

// Methods for IBM Cloud Infrastructure Center
function validateIbmCloudInfrastructureCenterFormFields(isEdit) {
  cy.getFormLabelByForAttribute({ forValue: 'type' })
    .should('be.visible')
    .and('contain.text', TYPE_FIELD_LABEL);
  if (isEdit) {
    // On edit form assert type dropdown is visible & disabled and then check it has value as "IBM Cloud Infrastructure Center"
    cy.getFormSelectFieldById({ selectId: 'type' })
      .should('be.visible')
      .and('be.disabled')
      .find('option:selected')
      .should('have.text', PROVIDER_TYPE_IBM_CIC);
  } else {
    // On add form assert type dropdown is visible & enabled and then select "IBM Cloud Infrastructure Center" option
    cy.getFormSelectFieldById({ selectId: 'type' })
      .should('be.visible')
      .and('be.enabled')
      .select(PROVIDER_TYPE_IBM_CIC);
  }
  // Assert name text field is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'name' })
    .should('be.visible')
    .and('contain.text', NAME_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'name' })
    .should('be.visible')
    .and('be.enabled');
  // Assert zone dropdown is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'zone_id' })
    .should('be.visible')
    .and('contain.text', ZONE_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'zone_id' })
    .should('be.visible')
    .and('be.enabled');
  // Assert provider region text field is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'provider_region' })
    .should('be.visible')
    .and('contain.text', PROVIDER_REGION_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'provider_region' })
    .should('be.visible')
    .and('be.enabled');
  // Assert API Version dropdown is visible & enabled and then select option "Keystone V3"
  cy.getFormLabelByForAttribute({ forValue: 'api_version' })
    .should('be.visible')
    .and('contain.text', API_VERSION_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'api_version' })
    .should('be.visible')
    .and('be.enabled')
    .select(API_VERSION_TYPE_V3);
  // Assert domain-id text field is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'uid_ems' })
    .should('be.visible')
    .and('contain.text', DOMAIN_ID_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'uid_ems' })
    .should('be.visible')
    .and('be.enabled');
  // Assert tenant mapping enabled radio field is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'tenant_mapping_enabled' })
    .should('be.visible')
    .and('contain.text', TENANT_MAPPING_ENABLED_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({
    inputId: 'tenant_mapping_enabled',
    inputType: 'checkbox',
  })
    .should('be.visible')
    .and('be.enabled');
  // Assert Endpoints sub header is visible
  cy.contains('h3', 'Endpoints').should('be.visible');
  // Assert Default sub header is visible
  cy.contains('h3', 'Default').should('be.visible');
  // Assert security protocol dropdown is visible and enabled
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
  // Assert hostname text field is visible and enabled
  cy.getFormLabelByForAttribute({
    forValue: 'endpoints.default.hostname',
  }).should('be.visible');
  cy.getFormInputFieldByIdAndType({ inputId: 'endpoints.default.hostname' })
    .should('be.visible')
    .and('be.enabled');
  // Assert API port text field is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'endpoints.default.port' })
    .should('be.visible')
    .and('contain.text', API_PORT_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({
    inputId: 'endpoints.default.port',
    inputType: 'number',
  })
    .should('be.visible')
    .and('be.enabled');
  // Assert username field is visible and enabled
  cy.getFormLabelByForAttribute({
    forValue: 'authentications.default.userid',
  }).should('be.visible');
  cy.getFormInputFieldByIdAndType({
    inputId: 'authentications.default.userid',
  })
    .should('be.visible')
    .and('be.enabled');
  // Assert password field is visible and enabled on add form, and then disabled on edit form
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
  // Assert Events sub header is visible
  cy.contains('h3', 'Events').scrollIntoView().should('be.visible');
  // Assert events type dropdown is visible & enabled and then select "STF" option
  cy.getFormLabelByForAttribute({ forValue: 'event_stream_selection' })
    .should('be.visible')
    .and('contain.text', TYPE_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'event_stream_selection' })
    .should('be.visible')
    .and('be.enabled')
    .select(EVENT_STREAM_TYPE_STF);
  // Assert STF security protocol dropdown is visible and enabled
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
  // Assert STF hostname text field is visible and enabled
  cy.getFormLabelByForAttribute({
    forValue: 'endpoints.stf.hostname',
  }).should('be.visible');
  cy.getFormInputFieldByIdAndType({ inputId: 'endpoints.stf.hostname' })
    .should('be.visible')
    .and('be.enabled');
  // Assert STF API port text field is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'endpoints.stf.port' })
    .should('be.visible')
    .and('contain.text', API_PORT_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({
    inputId: 'endpoints.stf.port',
    inputType: 'number',
  })
    .should('be.visible')
    .and('be.enabled');
  // select "AMQP" option from event stream type select field
  cy.getFormSelectFieldById({ selectId: 'event_stream_selection' }).select(
    EVENT_STREAM_TYPE_AMQP
  );
  // Assert AMQP hostname text field is visible and enabled
  cy.getFormLabelByForAttribute({
    forValue: 'endpoints.amqp.hostname',
  }).should('be.visible');
  cy.getFormInputFieldByIdAndType({ inputId: 'endpoints.amqp.hostname' })
    .should('be.visible')
    .and('be.enabled');
  // Assert AMQP API port text field is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'endpoints.amqp.port' })
    .should('be.visible')
    .and('contain.text', API_PORT_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({
    inputId: 'endpoints.amqp.port',
    inputType: 'number',
  })
    .should('be.visible')
    .and('be.enabled');
  // Assert AMQP username text field is visible and enabled
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
  // Assert AMQP password text field is visible and enabled
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
  // Assert Validate button is visible and disabled
  cy.contains('button', 'Validate').should('be.visible').and('be.disabled');
  // Assert SSH username text field is visible and enabled
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
  // Assert SSH private key textarea is visible and enabled on add form and
  // private key text field is visible and disabled on edit form
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
  // Assert add/save button is visible & disabled
  cy.getFormFooterButtonByTypeWithText({
    buttonText: isEdit ? 'Save' : 'Add',
    buttonType: 'submit',
  })
    .scrollIntoView()
    .should('be.visible')
    .and('be.disabled');
  if (isEdit) {
    // Assert reset button is visible & enabled on edit form
    cy.getFormFooterButtonByTypeWithText({ buttonText: 'Reset' })
      .should('be.visible')
      .and('be.enabled');
  }
  // Assert cancel button is visible and enabled
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
  // Select the created provider
  selectCreatedProvider(nameValue);
  // Open edit form
  cy.toolbar(CONFIG_TOOLBAR_BUTTON, EDIT_PROVIDER_CONFIG_OPTION);
}

// Methods for OpenStack
function validateOpenstackFormFields(isEdit) {
  cy.getFormLabelByForAttribute({ forValue: 'type' })
    .should('be.visible')
    .and('contain.text', TYPE_FIELD_LABEL);
  if (isEdit) {
    // On edit form assert type dropdown is visible & disabled and then check it has value as "OpenStack"
    cy.getFormSelectFieldById({ selectId: 'type' })
      .should('be.visible')
      .and('be.disabled')
      .find('option:selected')
      .should('have.text', PROVIDER_TYPE_OPENSTACK);
  } else {
    // On add form assert type dropdown is visible & enabled and then select "OpenStack" option
    cy.getFormSelectFieldById({ selectId: 'type' })
      .should('be.visible')
      .and('be.enabled')
      .select(PROVIDER_TYPE_OPENSTACK);
  }
  // Assert name text field is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'name' })
    .should('be.visible')
    .and('contain.text', NAME_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'name' })
    .should('be.visible')
    .and('be.enabled');
  // Assert zone dropdown is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'zone_id' })
    .should('be.visible')
    .and('contain.text', ZONE_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'zone_id' })
    .should('be.visible')
    .and('be.enabled');
  // Assert provider region text field is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'provider_region' })
    .should('be.visible')
    .and('contain.text', PROVIDER_REGION_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'provider_region' })
    .should('be.visible')
    .and('be.enabled');
  // Assert openstack infra provider dropdown is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'provider_id' })
    .should('be.visible')
    .and('contain.text', OPENSTACK_INFRA_PROVIDER_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'provider_id' })
    .should('be.visible')
    .and('be.enabled');
  // Assert API version dropdown is visible & enabled and then select option "Keystone V3"
  cy.getFormLabelByForAttribute({ forValue: 'api_version' })
    .should('be.visible')
    .and('contain.text', API_VERSION_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'api_version' })
    .should('be.visible')
    .and('be.enabled')
    .select(API_VERSION_TYPE_V3);
  // Assert domain-id text field is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'uid_ems' })
    .should('be.visible')
    .and('contain.text', DOMAIN_ID_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'uid_ems' })
    .should('be.visible')
    .and('be.enabled');
  // Assert tenant mapping enabled radio field is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'tenant_mapping_enabled' })
    .should('be.visible')
    .and('contain.text', TENANT_MAPPING_ENABLED_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({
    inputId: 'tenant_mapping_enabled',
    inputType: 'checkbox',
  })
    .should('be.visible')
    .and('be.enabled');
  // Assert Endpoints sub header is visible
  cy.contains('h3', 'Endpoints').should('be.visible');
  // Assert Default sub header is visible
  cy.contains('h3', 'Default').should('be.visible');
  // Assert security protocol dropdown is visible and enabled
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
  // Assert hostname text field is visible and enabled
  cy.getFormLabelByForAttribute({
    forValue: 'endpoints.default.hostname',
  }).should('be.visible');
  cy.getFormInputFieldByIdAndType({ inputId: 'endpoints.default.hostname' })
    .should('be.visible')
    .and('be.enabled');
  // Assert API port text field is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'endpoints.default.port' })
    .should('be.visible')
    .and('contain.text', API_PORT_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({
    inputId: 'endpoints.default.port',
    inputType: 'number',
  })
    .should('be.visible')
    .and('be.enabled');
  // Assert username field is visible and enabled
  cy.getFormLabelByForAttribute({
    forValue: 'authentications.default.userid',
  }).should('be.visible');
  cy.getFormInputFieldByIdAndType({
    inputId: 'authentications.default.userid',
  })
    .should('be.visible')
    .and('be.enabled');
  // Assert password field is visible and enabled on add form, and then disabled on edit form
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
  // Assert Events sub header is visible
  cy.contains('h3', 'Events').scrollIntoView().should('be.visible');
  // Assert events type dropdown is visible & enabled and then select "STF" option
  cy.getFormLabelByForAttribute({ forValue: 'event_stream_selection' })
    .should('be.visible')
    .and('contain.text', TYPE_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'event_stream_selection' })
    .should('be.visible')
    .and('be.enabled')
    .select(EVENT_STREAM_TYPE_STF);
  // Assert STF security protocol dropdown is visible and enabled
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
  // Assert STF hostname text field is visible and enabled
  cy.getFormLabelByForAttribute({
    forValue: 'endpoints.stf.hostname',
  }).should('be.visible');
  cy.getFormInputFieldByIdAndType({ inputId: 'endpoints.stf.hostname' })
    .should('be.visible')
    .and('be.enabled');
  // Assert STF API port text field is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'endpoints.stf.port' })
    .should('be.visible')
    .and('contain.text', API_PORT_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({
    inputId: 'endpoints.stf.port',
    inputType: 'number',
  })
    .should('be.visible')
    .and('be.enabled');
  // select "AMQP" option from event stream type select field
  cy.getFormSelectFieldById({ selectId: 'event_stream_selection' }).select(
    EVENT_STREAM_TYPE_AMQP
  );
  // Assert AMQP hostname text field is visible and enabled
  cy.getFormLabelByForAttribute({
    forValue: 'endpoints.amqp.hostname',
  }).should('be.visible');
  cy.getFormInputFieldByIdAndType({ inputId: 'endpoints.amqp.hostname' })
    .should('be.visible')
    .and('be.enabled');
  // Assert AMQP API port text field is visible and enabled
  cy.getFormLabelByForAttribute({ forValue: 'endpoints.amqp.port' })
    .should('be.visible')
    .and('contain.text', API_PORT_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({
    inputId: 'endpoints.amqp.port',
    inputType: 'number',
  })
    .should('be.visible')
    .and('be.enabled');
  // Assert AMQP username text field is visible and enabled
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
  // Assert AMQP password text field is visible and enabled
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
  // Assert Validate button is visible and disabled
  cy.contains('button', 'Validate').should('be.visible').and('be.disabled');
  // Assert SSH username text field is visible and enabled
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
  // Assert SSH private key textarea is visible and enabled on add form and
  // private key text field is visible and disabled on edit form
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
  // Assert add/save button is visible & disabled
  cy.getFormFooterButtonByTypeWithText({
    buttonText: isEdit ? 'Save' : 'Add',
    buttonType: 'submit',
  })
    .scrollIntoView()
    .should('be.visible')
    .and('be.disabled');
  if (isEdit) {
    // Assert reset button is visible & enabled on edit form
    cy.getFormFooterButtonByTypeWithText({ buttonText: 'Reset' })
      .should('be.visible')
      .and('be.enabled');
  }
  // Assert cancel button is visible and enabled
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
  // Select the created provider
  selectCreatedProvider(nameValue);
  // Open edit form
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
      // If row is not selected, click the checkbox
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
  // TODO: Switch to cy.interceptApi once it supports waiting for multiple APIs & controlled wait becomes optional, as it’s not needed in this case
  // and supports response stubbing.
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
  // Select the created provider from the data table
  selectCreatedProvider(createdProviderName);
  // TODO: Switch to cy.interceptApi once controlled wait becomes optional, as it’s not needed in this case
  cy.intercept('POST', '/ems_cloud/button?pressed=ems_cloud_delete').as(
    'deleteProviderApi'
  );
  // Remove the created provider
  cy.expect_browser_confirm_with_text({
    confirmTriggerFn: () =>
      cy.toolbar(CONFIG_TOOLBAR_BUTTON, REMOVE_PROVIDER_CONFIG_OPTION),
    containsText: REMOVE_PROVIDER_BROWSER_ALERT_MESSAGE,
  });
  cy.wait('@deleteProviderApi').then(() => {
    if (assertDeleteFlashMessage) {
      cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_DELETE_OPERATION);
    }
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
    // Navigate to Compute -> Clouds -> Providers
    cy.menu(
      COMPUTE_MENU_OPTION,
      CLOUDS_AUTOMATION_MENU_OPTION,
      PROVIDERS_MENU_OPTION
    );
    // Open the add cloud-provider form
    cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_PROVIDER_CONFIG_OPTION);
  });

  describe('Validate cloud provider type: VMware vCloud', () => {
    describe('Validate add form', () => {
      it('Validate visibility of elements', () => {
        // Validate elements
        validateVmwareVcloudFormFields(false);
      });

      it('Should show the error message from the task_results API upon validation failure and validate cancel button behavior', () => {
        // Add all mandatory field values
        fillVmwareVcloudForm({
          nameValue: `${VMWARE_VCLOUD_NAME_VALUE} - Verify add form validation error`,
          hostValue: 'vmware-vcloud.verify-add-form-validation-error.com',
        });
        // Assert validation error message
        validate({
          stubErrorResponse: true,
          errorMessage: VMWARE_VCLOUD_VALIDATION_ERROR,
        });
        assertValidationFailureMessage();
        // Validate cancel button
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' }).click();
        // Validate cancellation flash message
        cy.expect_flash(
          flashClassMap.success,
          FLASH_MESSAGE_OPERATION_CANCELLED
        );
      });

      it('Verify successful validate + add/refresh/delete operations', () => {
        const nameFieldValue = `${VMWARE_VCLOUD_NAME_VALUE} - Verify validate/add/refresh/delete operations`;
        // Add all mandatory field values
        fillVmwareVcloudForm({
          nameValue: nameFieldValue,
          hostValue:
            'vmware-vcloud.verify-validate-add-refresh-delete-operations.com',
        });
        // Assert validation success message
        validate({
          stubErrorResponse: false,
        });
        assertValidationSuccessMessage();
        // Assert add button is now enabled and then perform add operation
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Add',
          buttonType: 'submit',
        })
          .should('be.enabled')
          .click();
        // Assert add operation success flash message
        cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_OPERATION_SAVED);
        // Select the created provider from the data table
        selectCreatedProvider(nameFieldValue);
        // Select refresh option and assert flash message
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

        // Delete the created provider & assert delete operation success flash message
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
        // Setting up data and opening edit form
        addVmwareVcloudProviderAndOpenEditForm({
          nameValue: nameFieldValue,
          hostValue: 'vmware-vcloud.verify-edit-form-elements.com',
        });

        // Validate elements
        validateVmwareVcloudFormFields(true);
      });

      it("Should show the error message from the task_results API upon validation failure and validate reset & cancel buttons' behavior", () => {
        nameFieldValue = `${VMWARE_VCLOUD_NAME_VALUE} - Verify edit form validation error`;
        // Setting up data and opening edit form
        addVmwareVcloudProviderAndOpenEditForm({
          nameValue: nameFieldValue,
          hostValue: 'vmware-vcloud.verify-edit-form-validation-error.com',
        });

        // Update API Version field
        cy.getFormSelectFieldById({ selectId: 'api_version' }).select(
          API_VERSION_TYPE_V9
        );
        // Assert validation error message
        validate({
          stubErrorResponse: true,
          errorMessage: VMWARE_VCLOUD_VALIDATION_ERROR,
        });
        assertValidationFailureMessage();
        // Assert reset button is now enabled and then perform reset operation
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Reset' })
          .should('be.enabled')
          .click();
        // Assert API Version field has the old value
        cy.getFormSelectFieldById({ selectId: 'api_version' })
          .find('option:selected')
          .should('have.text', API_VERSION_TYPE_V5);
        // Validate cancel button
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Cancel',
        }).click();
        // Validating cancellation flash message
        cy.expect_flash(
          flashClassMap.success,
          FLASH_MESSAGE_OPERATION_CANCELLED
        );
      });

      it('Verify successful validate + edit operation', () => {
        nameFieldValue = `${VMWARE_VCLOUD_NAME_VALUE} - Verify validate/edit operations`;
        // Setting up data and opening edit form
        addVmwareVcloudProviderAndOpenEditForm({
          nameValue: nameFieldValue,
          hostValue: 'vmware-vcloud.verify-validate-edit-operations.com',
        });

        // Update API Version field
        cy.getFormSelectFieldById({ selectId: 'api_version' }).select(
          API_VERSION_TYPE_V9
        );
        // Assert validation success message
        validate({
          stubErrorResponse: false,
        });
        assertValidationSuccessMessage();
        // Assert save button is now enabled and then perform save operation
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Save',
          buttonType: 'submit',
        })
          .should('be.enabled')
          .click();
        // Assert save operation success flash message
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
        // Add all mandatory field values
        fillVmwareVcloudForm({
          nameValue: nameFieldValue,
          hostValue: 'vmware-vcloud.verify-duplicate-restriction.com',
        });
        // Perform validation
        validate({
          stubErrorResponse: false,
        });
        // Perform add operation
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Add',
          buttonType: 'submit',
        }).click();
      });

      it('Should display error on duplicate name usage', () => {
        // Open the add cloud-provider form again
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_PROVIDER_CONFIG_OPTION);
        // Add same name as above
        fillVmwareVcloudForm({
          nameValue: nameFieldValue,
          hostValue: 'vmware-vcloud.verify-duplicate-restriction.com',
        });
        // Assert name already exists error message
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
        // Validate elements
        validateOracleCloudFormFields(false);
      });

      it('Should show the error message from the task_results API upon validation failure and validate cancel button behavior', () => {
        // Add all mandatory field values
        fillOracleCloudForm({
          nameValue: `${ORACLE_CLOUD_NAME_VALUE} - Verify add form validation error`,
        });
        // Assert validation error message
        validate({
          stubErrorResponse: true,
          errorMessage: ORACLE_CLOUD_VALIDATION_ERROR,
        });
        assertValidationFailureMessage();
        // Validate cancel button
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' }).click();
        // Validate cancellation flash message
        cy.expect_flash(
          flashClassMap.success,
          FLASH_MESSAGE_OPERATION_CANCELLED
        );
      });

      it('Verify successful validate + add/refresh/delete operations', () => {
        const nameValue = `${ORACLE_CLOUD_NAME_VALUE} - Verify validate/add/refresh/delete operations`;
        // Add all mandatory field values
        fillOracleCloudForm({
          nameValue,
        });
        // Assert validation success message
        validate({
          stubErrorResponse: false,
        });
        assertValidationSuccessMessage();
        // Assert add button is now enabled and then perform add operation
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Add',
          buttonType: 'submit',
        })
          .should('be.enabled')
          .click();
        // Assert add operation success flash message
        cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_OPERATION_SAVED);
        // Select the created provider from the data table
        selectCreatedProvider(nameValue);
        // Select refresh option and assert flash message
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

        // Delete the created provider & assert delete operation success flash message
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
        // Setting up data and opening edit form
        addOracleCloudProviderAndOpenEditForm({
          nameValue: nameFieldValue,
        });

        // Validate elements
        validateOracleCloudFormFields(true);
      });

      it("Should show the error message from the task_results API upon validation failure and validate reset & cancel buttons' behavior", () => {
        nameFieldValue = `${ORACLE_CLOUD_NAME_VALUE} - Verify edit form validation error`;
        // Setting up data and opening edit form
        addOracleCloudProviderAndOpenEditForm({
          nameValue: nameFieldValue,
        });

        // Update region field
        cy.getFormSelectFieldById({ selectId: 'provider_region' }).select(
          REGION_OPTION_MELBOURNE
        );
        // Assert validation error message
        validate({
          stubErrorResponse: true,
          errorMessage: ORACLE_CLOUD_VALIDATION_ERROR,
        });
        assertValidationFailureMessage();
        // Assert reset button is now enabled and then perform reset operation
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Reset' })
          .should('be.enabled')
          .click();
        // Assert region field has the old value
        cy.getFormSelectFieldById({ selectId: 'provider_region' })
          .find('option:selected')
          .should('have.text', REGION_OPTION_HYDERABAD);
        // Validate cancel button
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Cancel',
        }).click();
        // Validating cancellation flash message
        cy.expect_flash(
          flashClassMap.success,
          FLASH_MESSAGE_OPERATION_CANCELLED
        );
      });

      it('Verify successful validate + edit operation', () => {
        nameFieldValue = `${ORACLE_CLOUD_NAME_VALUE} - Verify validate/edit operations`;
        // Setting up data and opening edit form
        addOracleCloudProviderAndOpenEditForm({
          nameValue: nameFieldValue,
        });

        // Update region field
        cy.getFormSelectFieldById({ selectId: 'provider_region' }).select(
          REGION_OPTION_MELBOURNE
        );
        // Assert validation success message
        validate({
          stubErrorResponse: false,
        });
        assertValidationSuccessMessage();
        // Assert save button is now enabled and then perform save operation
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Save',
          buttonType: 'submit',
        })
          .should('be.enabled')
          .click();
        // Assert save operation success flash message
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
        // Add all mandatory field values
        fillOracleCloudForm({
          nameValue: nameFieldValue,
        });
        // Perform validation
        validate({
          stubErrorResponse: false,
        });
        // Perform add operation
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Add',
          buttonType: 'submit',
        }).click();
      });

      it('Should display error on duplicate name usage', () => {
        // Open the add cloud-provider form again
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_PROVIDER_CONFIG_OPTION);
        // Add same name as above
        fillOracleCloudForm({
          nameValue: nameFieldValue,
        });
        // Assert name already exists error message
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
        // Validate elements
        validateIbmCloudVpcFormFields(false);
      });

      it('Should show the error message from the task_results API upon validation failure and validate cancel button behavior', () => {
        // Add all mandatory field values
        fillIbmCloudVpcForm({
          nameValue: `${IBM_CLOUD_VPC_NAME_VALUE} - Verify add form validation error`,
        });
        // Assert validation error message
        validate({
          stubErrorResponse: true,
          errorMessage: IBM_CLOUD_VPC_VALIDATION_ERROR,
        });
        assertValidationFailureMessage();
        // Validate cancel button
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' }).click();
        // Validate cancellation flash message
        cy.expect_flash(
          flashClassMap.success,
          FLASH_MESSAGE_OPERATION_CANCELLED
        );
      });

      it('Verify successful validate + add/refresh/delete operations', () => {
        const nameValue = `${IBM_CLOUD_VPC_NAME_VALUE} - Verify validate/add/refresh/delete operations`;
        // Add all mandatory field values
        fillIbmCloudVpcForm({
          nameValue,
        });
        // Assert validation success message
        validate({
          stubErrorResponse: false,
        });
        assertValidationSuccessMessage();
        // Assert add button is now enabled and then perform add operation
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Add',
          buttonType: 'submit',
        })
          .should('be.enabled')
          .click();
        // Assert add operation success flash message
        cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_OPERATION_SAVED);
        // Select the created provider from the data table
        selectCreatedProvider(nameValue);
        // Select refresh option and assert flash message
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

        // Delete the created provider & assert delete operation success flash message
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
        // Setting up data and opening edit form
        addIbmCloudVpcProviderAndOpenEditForm({
          nameValue: nameFieldValue,
        });

        // Validate elements
        validateIbmCloudVpcFormFields(true);
      });

      it("Should show the error message from the task_results API upon validation failure and validate reset & cancel buttons' behavior", () => {
        nameFieldValue = `${IBM_CLOUD_VPC_NAME_VALUE} - Verify edit form validation error`;
        // Setting up data and opening edit form
        addIbmCloudVpcProviderAndOpenEditForm({
          nameValue: nameFieldValue,
        });

        // Update region field
        cy.getFormSelectFieldById({ selectId: 'provider_region' }).select(
          REGION_OPTION_SPAIN
        );
        // Assert validation error message
        validate({
          stubErrorResponse: true,
          errorMessage: IBM_CLOUD_VPC_VALIDATION_ERROR,
        });
        assertValidationFailureMessage();
        // Assert reset button is now enabled and then perform reset operation
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Reset' })
          .should('be.enabled')
          .click();
        // Assert region field has the old value
        cy.getFormSelectFieldById({ selectId: 'provider_region' })
          .find('option:selected')
          .should('have.text', REGION_OPTION_AUSTRALIA);
        // Validate cancel button
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Cancel',
        }).click();
        // Validating cancellation flash message
        cy.expect_flash(
          flashClassMap.success,
          FLASH_MESSAGE_OPERATION_CANCELLED
        );
      });

      it('Verify successful validate + edit operation', () => {
        nameFieldValue = `${IBM_CLOUD_VPC_NAME_VALUE} - Verify validate/edit operations`;
        // Setting up data and opening edit form
        addIbmCloudVpcProviderAndOpenEditForm({
          nameValue: nameFieldValue,
        });

        // Update region field
        cy.getFormSelectFieldById({ selectId: 'provider_region' }).select(
          REGION_OPTION_SPAIN
        );
        // Assert validation success message
        validate({
          stubErrorResponse: false,
        });
        assertValidationSuccessMessage();
        // Assert save button is now enabled and then perform save operation
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Save',
          buttonType: 'submit',
        })
          .should('be.enabled')
          .click();
        // Assert save operation success flash message
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
        // Add all mandatory field values
        fillIbmCloudVpcForm({
          nameValue: nameFieldValue,
        });
        // Perform validation
        validate({
          stubErrorResponse: false,
        });
        // Perform add operation
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Add',
          buttonType: 'submit',
        }).click();
      });

      it('Should display error on duplicate name usage', () => {
        // Open the add cloud-provider form again
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_PROVIDER_CONFIG_OPTION);
        // Add same name as above
        fillIbmCloudVpcForm({
          nameValue: nameFieldValue,
        });
        // Assert name already exists error message
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
        // Validate elements
        validateIbmPowerSystemsVirtualServersFormFields(false);
      });

      it('Should show the error message from the task_results API upon validation failure and validate cancel button behavior', () => {
        // Add all mandatory field values
        fillIbmPowerSystemsVirtualServersForm({
          nameValue: `${IBM_POWER_SYSTEMS_VIRTUAL_SERVERS_NAME_VALUE} - Verify add form validation error`,
        });
        // Assert validation error message
        validate({
          stubErrorResponse: true,
          errorMessage: IBM_POWER_SYSTEMS_VIRTUAL_SERVERS_VALIDATION_ERROR,
        });
        assertValidationFailureMessage();
        // Validate cancel button
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' }).click();
        // Validate cancellation flash message
        cy.expect_flash(
          flashClassMap.success,
          FLASH_MESSAGE_OPERATION_CANCELLED
        );
      });

      it('Verify successful validate + add/refresh/delete operations', () => {
        const nameValue = `${IBM_POWER_SYSTEMS_VIRTUAL_SERVERS_NAME_VALUE} - Verify validate/add/refresh/delete operations`;
        // Add all mandatory field values
        fillIbmPowerSystemsVirtualServersForm({
          nameValue,
        });
        // Assert validation success message
        validate({
          stubErrorResponse: false,
        });
        assertValidationSuccessMessage();
        // Assert add button is now enabled and then perform add operation
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Add',
          buttonType: 'submit',
        })
          .should('be.enabled')
          .click();
        // Assert add operation success flash message
        cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_OPERATION_SAVED);
        // Select the created provider from the data table
        selectCreatedProvider(nameValue);
        // Select refresh option and assert flash message
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

        // Delete the created provider & assert delete operation success flash message
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
        // Setting up data and opening edit form
        addIbmPowerSystemsVirtualServersProviderAndOpenEditForm({
          nameValue: nameFieldValue,
        });

        // Validate elements
        validateIbmPowerSystemsVirtualServersFormFields(true);
      });

      it("Should show the error message from the task_results API upon validation failure and validate reset & cancel buttons' behavior", () => {
        nameFieldValue = `${IBM_POWER_SYSTEMS_VIRTUAL_SERVERS_NAME_VALUE} - Verify edit form validation error`;
        // Setting up data and opening edit form
        addIbmPowerSystemsVirtualServersProviderAndOpenEditForm({
          nameValue: nameFieldValue,
        });

        // Update GUID field
        cy.getFormInputFieldByIdAndType({ inputId: 'uid_ems' }).type('-xr4q');
        // Assert validation error message
        validate({
          stubErrorResponse: true,
          errorMessage: IBM_POWER_SYSTEMS_VIRTUAL_SERVERS_VALIDATION_ERROR,
        });
        assertValidationFailureMessage();
        // Assert reset button is now enabled and then perform reset operation
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Reset' })
          .should('be.enabled')
          .click();
        // Assert GUID field has the old value
        cy.getFormInputFieldByIdAndType({ inputId: 'uid_ems' }).should(
          'have.value',
          GUID_VALUE
        );
        // Validate cancel button
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Cancel',
        }).click();
        // Validating cancellation flash message
        cy.expect_flash(
          flashClassMap.success,
          FLASH_MESSAGE_OPERATION_CANCELLED
        );
      });

      it('Verify successful validate + edit operation', () => {
        nameFieldValue = `${IBM_POWER_SYSTEMS_VIRTUAL_SERVERS_NAME_VALUE} - Verify validate/edit operations`;
        // Setting up data and opening edit form
        addIbmPowerSystemsVirtualServersProviderAndOpenEditForm({
          nameValue: nameFieldValue,
        });

        // Update GUID field
        cy.getFormInputFieldByIdAndType({ inputId: 'uid_ems' }).type('-xr4q');
        // Assert validation success message
        validate({
          stubErrorResponse: false,
        });
        assertValidationSuccessMessage();
        // Assert save button is now enabled and then perform save operation
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Save',
          buttonType: 'submit',
        })
          .should('be.enabled')
          .click();
        // Assert save operation success flash message
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
        // Add all mandatory field values
        fillIbmPowerSystemsVirtualServersForm({
          nameValue: nameFieldValue,
        });
        // Perform validation
        validate({
          stubErrorResponse: false,
        });
        // Perform add operation
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Add',
          buttonType: 'submit',
        }).click();
      });

      it('Should display error on duplicate name usage', () => {
        // Open the add cloud-provider form again
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_PROVIDER_CONFIG_OPTION);
        // Add same name as above
        fillIbmPowerSystemsVirtualServersForm({
          nameValue: nameFieldValue,
        });
        // Assert name already exists error message
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
        // Validate elements
        validateGoogleComputeEngineFormFields(false);
      });

      it('Should show the error message from the task_results API upon validation failure and validate cancel button behavior', () => {
        // Add all mandatory field values
        fillGoogleComputeEngineForm({
          nameValue: `${GOOGLE_COMPUTE_ENGINE_NAME_VALUE} - Verify add form validation error`,
        });
        // Assert validation error message
        validate({
          stubErrorResponse: true,
          errorMessage: GOOGLE_COMPUTE_ENGINE_VALIDATION_ERROR,
        });
        assertValidationFailureMessage();
        // Validate cancel button
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' }).click();
        // Validate cancellation flash message
        cy.expect_flash(
          flashClassMap.success,
          FLASH_MESSAGE_OPERATION_CANCELLED
        );
      });

      it('Verify successful validate + add/refresh/delete operations', () => {
        const nameFieldValue = `${GOOGLE_COMPUTE_ENGINE_NAME_VALUE} - Verify validate/add/refresh/delete operations`;
        // Add all mandatory field values
        fillGoogleComputeEngineForm({
          nameValue: nameFieldValue,
        });
        // Assert validation success message
        validate({
          stubErrorResponse: false,
        });
        assertValidationSuccessMessage();
        // Assert add button is now enabled and then perform add operation
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Add',
          buttonType: 'submit',
        })
          .should('be.enabled')
          .click();
        // Assert add operation success flash message
        cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_OPERATION_SAVED);
        // Select the created provider from the data table
        selectCreatedProvider(nameFieldValue);
        // Select refresh option and assert flash message
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

        // Delete the created provider & assert delete operation success flash message
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
        // Setting up data and opening edit form
        addGoogleComputeEngineProviderAndOpenEditForm({
          nameValue: nameFieldValue,
        });

        // Validate elements
        validateGoogleComputeEngineFormFields(true);
      });

      it("Should show the error message from the task_results API upon validation failure and validate reset & cancel buttons' behavior", () => {
        nameFieldValue = `${GOOGLE_COMPUTE_ENGINE_NAME_VALUE} - Verify edit form validation error`;
        // Setting up data and opening edit form
        addGoogleComputeEngineProviderAndOpenEditForm({
          nameValue: nameFieldValue,
        });

        // Update project ID field
        cy.getFormInputFieldByIdAndType({ inputId: 'project' }).type('-76g1');
        // Assert validation error message
        validate({
          stubErrorResponse: true,
          errorMessage: GOOGLE_COMPUTE_ENGINE_VALIDATION_ERROR,
        });
        assertValidationFailureMessage();
        // Assert reset button is now enabled and then perform reset operation
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Reset' })
          .should('be.enabled')
          .click();
        // Assert project ID field has the old value
        cy.getFormInputFieldByIdAndType({ inputId: 'project' }).should(
          'have.value',
          PROJECT_ID_VALUE
        );
        // Validate cancel button
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Cancel',
        }).click();
        // Validating cancellation flash message
        cy.expect_flash(
          flashClassMap.success,
          FLASH_MESSAGE_OPERATION_CANCELLED
        );
      });

      it('Verify successful validate + edit operation', () => {
        nameFieldValue = `${GOOGLE_COMPUTE_ENGINE_NAME_VALUE} - Verify validate/edit operations`;
        // Setting up data and opening edit form
        addGoogleComputeEngineProviderAndOpenEditForm({
          nameValue: nameFieldValue,
        });

        // Update project ID field
        cy.getFormInputFieldByIdAndType({ inputId: 'project' }).type('-76g1');
        // Assert validation success message
        validate({
          stubErrorResponse: false,
        });
        assertValidationSuccessMessage();
        // Assert save button is now enabled and then perform save operation
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Save',
          buttonType: 'submit',
        })
          .should('be.enabled')
          .click();
        // Assert save operation success flash message
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
        // Add all mandatory field values
        fillGoogleComputeEngineForm({
          nameValue: nameFieldValue,
        });
        // Perform validation
        validate({
          stubErrorResponse: false,
        });
        // Perform add operation
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Add',
          buttonType: 'submit',
        }).click();
      });

      it('Should display error on duplicate name usage', () => {
        // Open the add cloud-provider form again
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_PROVIDER_CONFIG_OPTION);
        // Add same name as above
        fillGoogleComputeEngineForm({
          nameValue: nameFieldValue,
        });
        // Assert name already exists error message
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
        // Validate elements
        validateAzureStackFormFields(false);
      });

      it('Should show the error message from the task_results API upon validation failure and validate cancel button behavior', () => {
        // Add all mandatory field values
        fillAzureStackForm({
          nameValue: `${AZURE_STACK_NAME_VALUE} - Verify add form validation error`,
          hostValue: 'azure-stack.verify-add-form-validation-error.com',
        });
        // Assert validation error message
        validate({
          stubErrorResponse: true,
          errorMessage: AZURE_STACK_VALIDATION_ERROR,
        });
        assertValidationFailureMessage();
        // Validate cancel button
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' }).click();
        // Validate cancellation flash message
        cy.expect_flash(
          flashClassMap.success,
          FLASH_MESSAGE_OPERATION_CANCELLED
        );
      });

      it('Verify successful validate + add/refresh/delete operations', () => {
        const nameFieldValue = `${AZURE_STACK_NAME_VALUE} - Verify validate/add/refresh/delete operations`;
        // Add all mandatory field values
        fillAzureStackForm({
          nameValue: nameFieldValue,
          hostValue:
            'azure-stack.verify-validate-add-refresh-delete-operations.com',
        });
        // Assert validation success message
        validate({
          stubErrorResponse: false,
        });
        assertValidationSuccessMessage();
        // Assert add button is now enabled and then perform add operation
        // TODO: Switch to cy.interceptApi once controlled wait becomes optional, as it's not needed in this case
        // and supports response stubbing.
        cy.intercept('POST', '/api/providers', (req) => {
          // Let the request go through to the server(so that the data is created) and then override
          // the response statusCode to 200, server will return internal_server_error(500) since we are
          // using mock values for fields like host, port, etc.
          req.continue((res) => {
            res.send(200);
          });
        }).as('addAzureStackProviderApi');
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Add',
          buttonType: 'submit',
        })
          .should('be.enabled')
          .click();
        cy.wait('@addAzureStackProviderApi');
        // Assert add operation success flash message
        cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_OPERATION_SAVED);
        // Select the created provider from the data table
        selectCreatedProvider(nameFieldValue);
        // Select refresh option and assert flash message
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

        // Delete the created provider & assert delete operation success flash message
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
        // Setting up data and opening edit form
        addAzureStackProviderAndOpenEditForm({
          nameValue: nameFieldValue,
          hostValue: 'azure-stack.verify-edit-form-elements.com',
        });

        // Validate elements
        validateAzureStackFormFields(true);
      });

      it("Should show the error message from the task_results API upon validation failure and validate reset & cancel buttons' behavior", () => {
        nameFieldValue = `${AZURE_STACK_NAME_VALUE} - Verify edit form validation error`;
        // Setting up data and opening edit form
        addAzureStackProviderAndOpenEditForm({
          nameValue: nameFieldValue,
          hostValue: 'azure-stack.verify-edit-form-validation-error.com',
        });

        // Update security protocol field
        cy.getFormSelectFieldById({
          selectId: 'endpoints.default.security_protocol',
        }).select(SECURITY_PROTOCOL_NON_SSL);
        // Assert validation error message
        validate({
          stubErrorResponse: true,
          errorMessage: AZURE_STACK_VALIDATION_ERROR,
        });
        assertValidationFailureMessage();
        // Assert reset button is now enabled and then perform reset operation
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Reset' })
          .should('be.enabled')
          .click();
        // Assert security protocol field has the old value
        cy.getFormSelectFieldById({
          selectId: 'endpoints.default.security_protocol',
        })
          .find('option:selected')
          .should('have.text', SECURITY_PROTOCOL_SSL);
        // Validate cancel button
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Cancel',
        }).click();
        // Validating cancellation flash message
        cy.expect_flash(
          flashClassMap.success,
          FLASH_MESSAGE_OPERATION_CANCELLED
        );
      });

      it('Verify successful validate + edit operation', () => {
        nameFieldValue = `${AZURE_STACK_NAME_VALUE} - Verify validate/edit operations`;
        // Setting up data and opening edit form
        addAzureStackProviderAndOpenEditForm({
          nameValue: nameFieldValue,
          hostValue: 'azure-stack.verify-validate-edit-operations.com',
        });

        // Update security protocol field
        cy.getFormSelectFieldById({
          selectId: 'endpoints.default.security_protocol',
        }).select(SECURITY_PROTOCOL_NON_SSL);
        // Assert validation success message
        validate({
          stubErrorResponse: false,
        });
        assertValidationSuccessMessage();
        // Assert save button is now enabled and then perform save operation
        // TODO: Switch to cy.interceptApi once controlled wait becomes optional, as it's not needed in this case
        // and supports response stubbing.
        cy.intercept('PATCH', /\/api\/providers\/\d+/, (req) => {
          req.continue((res) => {
            res.send(200);
          });
        }).as('editAzureStackProviderApi');
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Save',
          buttonType: 'submit',
        })
          .should('be.enabled')
          .click();
        cy.wait('@editAzureStackProviderApi');
        // Assert save operation success flash message
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
        // Add all mandatory field values
        fillAzureStackForm({
          nameValue: nameFieldValue,
          hostValue: 'azure-stack.verify-duplicate-restriction.com',
        });
        // Perform validation
        validate({
          stubErrorResponse: false,
        });
        // Perform add operation
        // TODO: Switch to cy.interceptApi once controlled wait becomes optional, as it's not needed in this case
        // and supports response stubbing.
        cy.intercept('POST', '/api/providers', (req) => {
          // Let the request go through to the server(so that the data is created) and then override
          // the response statusCode to 200, server will return internal_server_error(500) since we are
          // using mock values for fields like host, port, etc.
          req.continue((res) => {
            res.send(200);
          });
        }).as('addAzureStackProviderApi');
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Add',
          buttonType: 'submit',
        }).click();
        cy.wait('@addAzureStackProviderApi');
      });

      it('Should display error on duplicate name usage', () => {
        // Open the add cloud-provider form again
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_PROVIDER_CONFIG_OPTION);
        // Add same name as above
        fillAzureStackForm({
          nameValue: nameFieldValue,
          hostValue: 'azure-stack.verify-duplicate-restriction.com',
        });
        // Assert name already exists error message
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
        // Validate elements
        validateAzureFormFields(false);
      });

      it('Should show the error message from the task_results API upon validation failure and validate cancel button behavior', () => {
        // Add all mandatory field values
        fillAzureForm({
          nameValue: `${AZURE_NAME_VALUE} - Verify add form validation error`,
        });
        // Assert validation error message
        validate({
          stubErrorResponse: true,
          errorMessage: AZURE_VALIDATION_ERROR,
        });
        assertValidationFailureMessage();

        // Validate cancel button
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' }).click();
        // Validating cancellation flash message
        cy.expect_flash(
          flashClassMap.success,
          FLASH_MESSAGE_OPERATION_CANCELLED
        );
      });

      it('Verify successful validate + add/refresh/delete operations', () => {
        const nameFieldValue = `${AZURE_NAME_VALUE} - Verify validate/add/refresh/delete operations`;
        // Add all mandatory field values
        fillAzureForm({
          nameValue: nameFieldValue,
        });
        // Assert validation success message
        validate({
          stubErrorResponse: false,
        });
        assertValidationSuccessMessage();
        // Assert add button is now enabled and then perform add operation
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Add',
          buttonType: 'submit',
        })
          .should('be.enabled')
          .click();
        // Assert add operation success flash message
        cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_OPERATION_SAVED);
        // Select the created provider from the data table
        selectCreatedProvider(nameFieldValue);
        // Select refresh option and assert flash message
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

        // Delete the created provider & assert delete operation success flash message
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
        // Setting up data and opening edit form
        addAzureProviderAndOpenEditForm({
          nameValue: nameFieldValue,
        });

        // Validate elements
        validateAzureFormFields(true);
      });

      it("Should show the error message from the task_results API upon validation failure and validate reset & cancel buttons' behavior", () => {
        nameFieldValue = `${AZURE_NAME_VALUE} - Verify edit form validation error`;
        // Setting up data and opening edit form
        addAzureProviderAndOpenEditForm({
          nameValue: nameFieldValue,
        });

        // Update region field
        cy.getFormSelectFieldById({ selectId: 'provider_region' }).select(
          REGION_OPTION_CENTRAL_US
        );
        // Assert validation error message
        validate({
          stubErrorResponse: true,
          errorMessage: AZURE_VALIDATION_ERROR,
        });
        assertValidationFailureMessage();
        // Assert reset button is now enabled and then perform reset operation
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Reset' })
          .should('be.enabled')
          .click();
        // Assert endpoint URL field has the old value
        cy.getFormSelectFieldById({ selectId: 'provider_region' })
          .find('option:selected')
          .should('have.text', REGION_OPTION_CENTRAL_INDIA);
        // Validate cancel button
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' }).click();
        // Validating cancellation flash message
        cy.expect_flash(
          flashClassMap.success,
          FLASH_MESSAGE_OPERATION_CANCELLED
        );
      });

      it('Verify successful validate + edit operation', () => {
        nameFieldValue = `${AZURE_NAME_VALUE} - Verify validate/edit operations`;
        // Setting up data and opening edit form
        addAzureProviderAndOpenEditForm({
          nameValue: nameFieldValue,
        });

        // Update region field
        cy.getFormSelectFieldById({ selectId: 'provider_region' }).select(
          REGION_OPTION_CENTRAL_US
        );
        // Assert validation success message
        validate({
          stubErrorResponse: false,
        });
        assertValidationSuccessMessage();
        // Assert save button is now enabled and then perform save operation
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Save',
          buttonType: 'submit',
        })
          .should('be.enabled')
          .click();
        // Assert save operation success flash message
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
        // Add all mandatory field values
        fillAzureForm({
          nameValue: nameFieldValue,
        });
        // Perform validation
        validate({
          stubErrorResponse: false,
        });
        // Perform add operation
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Add',
          buttonType: 'submit',
        }).click();
      });

      it('Should display error on duplicate name usage', () => {
        // Open the add cloud-provider form again
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_PROVIDER_CONFIG_OPTION);
        // Add same name as above
        fillAzureForm({
          nameValue: nameFieldValue,
        });
        // Assert name already exists error message
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
        // Validate elements
        validateAmazonEC2FormFields(false);
      });

      it('Should show the error message from the task_results API upon validation failure and validate cancel button behavior', () => {
        // Add all mandatory field values
        fillAmazonEC2Form({
          nameValue: `${AMAZON_EC2_NAME_VALUE} - Verify add form validation error`,
        });
        // Assert validation error message
        validate({
          stubErrorResponse: true,
          errorMessage: AMAZON_EC2_VALIDATION_ERROR,
        });
        assertValidationFailureMessage();

        // Validate cancel button
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' }).click();
        // Validating cancellation flash message
        cy.expect_flash(
          flashClassMap.success,
          FLASH_MESSAGE_OPERATION_CANCELLED
        );
      });

      it('Verify successful validate + add/refresh/delete operations', () => {
        const nameFieldValue = `${AMAZON_EC2_NAME_VALUE} - Verify validate/add/refresh/delete operations`;
        // Add all mandatory field values
        fillAmazonEC2Form({
          nameValue: nameFieldValue,
        });
        // Assert validation success message
        validate({
          stubErrorResponse: false,
        });
        assertValidationSuccessMessage();
        // Assert add button is now enabled and then perform add operation
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Add',
          buttonType: 'submit',
        })
          .should('be.enabled')
          .click();
        // Assert add operation success flash message
        cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_OPERATION_SAVED);
        // Select the created provider from the data table
        selectCreatedProvider(nameFieldValue);
        // Select refresh option and assert flash message
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

        // Delete the created provider & assert delete operation success flash message
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
        // Setting up data and opening edit form
        addAmazonEC2ProviderAndOpenEditForm({
          nameValue: nameFieldValue,
        });

        // Validate elements
        validateAmazonEC2FormFields(true);
      });

      it("Should show the error message from the task_results API upon validation failure and validate reset & cancel buttons' behavior", () => {
        nameFieldValue = `${AMAZON_EC2_NAME_VALUE} - Verify edit form validation error`;
        // Setting up data and opening edit form
        addAmazonEC2ProviderAndOpenEditForm({
          nameValue: nameFieldValue,
        });

        // Update region field
        cy.getFormSelectFieldById({ selectId: 'provider_region' }).select(
          REGION_OPTION_ASIA_PACIFIC
        );
        // Assert validation error message
        validate({
          stubErrorResponse: true,
          errorMessage: AMAZON_EC2_VALIDATION_ERROR,
        });
        assertValidationFailureMessage();
        // Assert reset button is now enabled and then perform reset operation
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Reset' })
          .should('be.enabled')
          .click();
        // Assert endpoint URL field has the old value
        cy.getFormSelectFieldById({ selectId: 'provider_region' })
          .find('option:selected')
          .should('have.text', REGION_OPTION_CANADA);
        // Validate cancel button
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' }).click();
        // Validating cancellation flash message
        cy.expect_flash(
          flashClassMap.success,
          FLASH_MESSAGE_OPERATION_CANCELLED
        );
      });

      it('Verify successful validate + edit operation', () => {
        nameFieldValue = `${AMAZON_EC2_NAME_VALUE} - Verify validate/edit operations`;
        // Setting up data and opening edit form
        addAmazonEC2ProviderAndOpenEditForm({
          nameValue: nameFieldValue,
        });

        // Update region field
        cy.getFormSelectFieldById({ selectId: 'provider_region' }).select(
          REGION_OPTION_ASIA_PACIFIC
        );
        // Assert validation success message
        validate({
          stubErrorResponse: false,
        });
        assertValidationSuccessMessage();
        // Assert save button is now enabled and then perform save operation
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Save',
          buttonType: 'submit',
        })
          .should('be.enabled')
          .click();
        // Assert save operation success flash message
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
        // Add all mandatory field values
        fillAmazonEC2Form({
          nameValue: nameFieldValue,
        });
        // Perform validation
        validate({
          stubErrorResponse: false,
        });
        // Perform add operation
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Add',
          buttonType: 'submit',
        }).click();
      });

      it('Should display error on duplicate name usage', () => {
        // Open the add cloud-provider form again
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_PROVIDER_CONFIG_OPTION);
        // Add same name as above
        fillAmazonEC2Form({
          nameValue: nameFieldValue,
        });
        // Assert name already exists error message
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
        // Validate elements
        validateIbmPowerVcFormFields(false);
      });

      it('Should show the error message from the task_results API upon validation failure and validate cancel button behavior', () => {
        // Add all mandatory field values
        fillIbmPowerVcForm({
          nameValue: `${IBM_POWERVC_NAME_VALUE} - Verify add form validation error`,
          hostValue: 'ibm-powervc.verify-add-form-validation-error.com',
        });
        // Assert validation error message
        validate({
          stubErrorResponse: true,
          errorMessage: IBM_POWERVC_VALIDATION_ERROR,
        });
        assertValidationFailureMessage();

        // Validate cancel button
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' }).click();
        // Validating cancellation flash message
        cy.expect_flash(
          flashClassMap.success,
          FLASH_MESSAGE_OPERATION_CANCELLED
        );
      });

      it('Verify successful validate + add/refresh/delete operations', () => {
        const nameFieldValue = `${IBM_POWERVC_NAME_VALUE} - Verify validate/add/refresh/delete operations`;
        // Add all mandatory field values
        fillIbmPowerVcForm({
          nameValue: nameFieldValue,
          hostValue:
            'ibm-powervc.verify-validate-add-refresh-delete-operations.com',
        });
        // Assert validation success message
        validate({
          stubErrorResponse: false,
        });
        assertValidationSuccessMessage();
        // Assert add button is now enabled and then perform add operation
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Add',
          buttonType: 'submit',
        })
          .should('be.enabled')
          .click();
        // Assert add operation success flash message
        cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_OPERATION_SAVED);
        // Select the created provider from the data table
        selectCreatedProvider(nameFieldValue);
        // Select refresh option and assert flash message
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

        // Delete the created provider & assert delete operation success flash message
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
        // Setting up data and opening edit form
        addIbmPowerVcProviderAndOpenEditForm({
          nameValue: nameFieldValue,
          hostValue: 'ibm-powervc.verify-edit-form-elements.com',
        });

        // Validate elements
        validateIbmPowerVcFormFields(true);
      });

      it("Should show the error message from the task_results API upon validation failure and validate reset & cancel buttons' behavior", () => {
        nameFieldValue = `${IBM_POWERVC_NAME_VALUE} - Verify edit form validation error`;
        // Setting up data and opening edit form
        addIbmPowerVcProviderAndOpenEditForm({
          nameValue: nameFieldValue,
          hostValue: 'ibm-powervc.verify-edit-form-validation-error.com',
        });

        // Update security protocol field
        cy.getFormSelectFieldById({
          selectId: 'endpoints.default.security_protocol',
        }).select(SECURITY_PROTOCOL_NON_SSL);
        // Assert validation error message
        validate({
          stubErrorResponse: true,
          errorMessage: IBM_POWERVC_VALIDATION_ERROR,
        });
        assertValidationFailureMessage();
        // Assert reset button is now enabled and then perform reset operation
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Reset' })
          .should('be.enabled')
          .click();
        // Assert security protocol field has the old value
        cy.getFormSelectFieldById({
          selectId: 'endpoints.default.security_protocol',
        })
          .find('option:selected')
          .should('have.text', SECURITY_PROTOCOL_SSL);
        // Validate cancel button
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' }).click();
        // Validating cancellation flash message
        cy.expect_flash(
          flashClassMap.success,
          FLASH_MESSAGE_OPERATION_CANCELLED
        );
      });

      it('Verify successful validate + edit operation', () => {
        nameFieldValue = `${IBM_POWERVC_NAME_VALUE} - Verify validate/edit operations`;
        // Setting up data and opening edit form
        addIbmPowerVcProviderAndOpenEditForm({
          nameValue: nameFieldValue,
          hostValue: 'ibm-powervc.verify-validate-edit-operations.com',
        });

        // Update security protocol field
        cy.getFormSelectFieldById({
          selectId: 'endpoints.default.security_protocol',
        }).select(SECURITY_PROTOCOL_NON_SSL);
        // Assert validation success message
        validate({
          stubErrorResponse: false,
        });
        assertValidationSuccessMessage();
        // Assert save button is now enabled and then perform save operation
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Save',
          buttonType: 'submit',
        })
          .should('be.enabled')
          .click();
        // Assert save operation success flash message
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
        // Add all mandatory field values
        fillIbmPowerVcForm({
          nameValue: nameFieldValue,
          hostValue: 'ibm-powervc.verify-duplicate-restriction.com',
        });
        // Perform validation
        validate({
          stubErrorResponse: false,
        });
        // Perform add operation
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Add',
          buttonType: 'submit',
        }).click();
      });

      it('Should display error on duplicate name usage', () => {
        // Open the add cloud-provider form again
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_PROVIDER_CONFIG_OPTION);
        // Add same name as above
        fillIbmPowerVcForm({
          nameValue: nameFieldValue,
          hostValue: 'ibm-powervc.verify-duplicate-restriction.com',
        });
        // Assert name already exists error message
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
        // Validate elements
        validateIbmCloudInfrastructureCenterFormFields(false);
      });

      it('Should show the error message from the task_results API upon validation failure and validate cancel button behavior', () => {
        // Add all mandatory field values
        fillIbmCloudInfrastructureCenterForm({
          nameValue: `${IBM_CIC_NAME_VALUE} - Verify add form validation error`,
          hostValue: 'ibm-cic.verify-add-form-validation-error.com',
        });
        // Assert validation error message
        validate({
          stubErrorResponse: true,
          errorMessage: IBM_CIC_VALIDATION_ERROR,
        });
        assertValidationFailureMessage();

        // Validate cancel button
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' }).click();
        // Validating cancellation flash message
        cy.expect_flash(
          flashClassMap.success,
          FLASH_MESSAGE_OPERATION_CANCELLED
        );
      });

      it('Verify successful validate + add/refresh/delete operations', () => {
        const nameFieldValue = `${IBM_CIC_NAME_VALUE} - Verify validate/add/refresh/delete operations`;
        // Add all mandatory field values
        fillIbmCloudInfrastructureCenterForm({
          nameValue: nameFieldValue,
          hostValue:
            'ibm-cic.verify-validate-add-refresh-delete-operations.com',
        });
        // Assert validation success message
        validate({
          stubErrorResponse: false,
        });
        assertValidationSuccessMessage();
        // Assert add button is now enabled and then perform add operation
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Add',
          buttonType: 'submit',
        })
          .should('be.enabled')
          .click();
        // Assert add operation success flash message
        cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_OPERATION_SAVED);
        // Select the created provider from the data table
        selectCreatedProvider(nameFieldValue);
        // Select refresh option and assert flash message
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

        // Delete the created provider & assert delete operation success flash message
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
        // Setting up data and opening edit form
        addIbmCloudInfrastructureCenterProviderAndOpenEditForm({
          nameValue: nameFieldValue,
          hostValue: 'ibm-cic.verify-edit-form-elements.com',
        });

        // Validate elements
        validateIbmCloudInfrastructureCenterFormFields(true);
      });

      it("Should show the error message from the task_results API upon validation failure and validate reset & cancel buttons' behavior", () => {
        nameFieldValue = `${IBM_CIC_NAME_VALUE} - Verify edit form validation error`;
        // Setting up data and opening edit form
        addIbmCloudInfrastructureCenterProviderAndOpenEditForm({
          nameValue: nameFieldValue,
          hostValue: 'ibm-cic.verify-edit-form-validation-error.com',
        });

        // Update security protocol field
        cy.getFormSelectFieldById({
          selectId: 'endpoints.default.security_protocol',
        }).select(SECURITY_PROTOCOL_NON_SSL);
        // Assert validation error message
        validate({
          stubErrorResponse: true,
          errorMessage: IBM_CIC_VALIDATION_ERROR,
        });
        assertValidationFailureMessage();
        // Assert reset button is now enabled and then perform reset operation
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Reset' })
          .should('be.enabled')
          .click();
        // Assert security protocol field has the old value
        cy.getFormSelectFieldById({
          selectId: 'endpoints.default.security_protocol',
        })
          .find('option:selected')
          .should('have.text', SECURITY_PROTOCOL_SSL);
        // Validate cancel button
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' }).click();
        // Validating cancellation flash message
        cy.expect_flash(
          flashClassMap.success,
          FLASH_MESSAGE_OPERATION_CANCELLED
        );
      });

      it('Verify successful validate + edit operation', () => {
        nameFieldValue = `${IBM_CIC_NAME_VALUE} - Verify validate/edit operations`;
        // Setting up data and opening edit form
        addIbmCloudInfrastructureCenterProviderAndOpenEditForm({
          nameValue: nameFieldValue,
          hostValue: 'ibm-cic.verify-validate-edit-operations.com',
        });

        // Update security protocol field
        cy.getFormSelectFieldById({
          selectId: 'endpoints.default.security_protocol',
        }).select(SECURITY_PROTOCOL_NON_SSL);
        // Assert validation success message
        validate({
          stubErrorResponse: false,
        });
        assertValidationSuccessMessage();
        // Assert save button is now enabled and then perform save operation
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Save',
          buttonType: 'submit',
        })
          .should('be.enabled')
          .click();
        // Assert save operation success flash message
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
        // Add all mandatory field values
        fillIbmCloudInfrastructureCenterForm({
          nameValue: nameFieldValue,
          hostValue: 'ibm-cic.verify-duplicate-restriction.com',
        });
        // Perform validation
        validate({
          stubErrorResponse: false,
        });
        // Perform add operation
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Add',
          buttonType: 'submit',
        }).click();
      });

      it('Should display error on duplicate name usage', () => {
        // Open the add cloud-provider form again
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_PROVIDER_CONFIG_OPTION);
        // Add same name as above
        fillIbmCloudInfrastructureCenterForm({
          nameValue: nameFieldValue,
          hostValue: 'ibm-cic.verify-duplicate-restriction.com',
        });
        // Assert name already exists error message
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
        // Validate elements
        validateOpenstackFormFields(false);
      });

      it('Should show the error message from the task_results API upon validation failure and validate cancel button behavior', () => {
        // Add all mandatory field values
        fillOpenstackForm({
          nameValue: `${OPENSTACK_NAME_VALUE} - Verify add form validation error`,
          hostValue: 'openstack.verify-add-form-validation-error.com',
        });
        // Assert validation error message
        validate({
          stubErrorResponse: true,
          errorMessage: OPENSTACK_VALIDATION_ERROR,
        });
        assertValidationFailureMessage();

        // Validate cancel button
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' }).click();
        // Validating cancellation flash message
        cy.expect_flash(
          flashClassMap.success,
          FLASH_MESSAGE_OPERATION_CANCELLED
        );
      });

      it('Verify successful validate + add/refresh/delete operations', () => {
        const nameFieldValue = `${OPENSTACK_NAME_VALUE} - Verify validate/add/refresh/delete operations`;
        // Add all mandatory field values
        fillOpenstackForm({
          nameValue: nameFieldValue,
          hostValue:
            'openstack.verify-validate-add-refresh-delete-operations.com',
        });
        // Assert validation success message
        validate({
          stubErrorResponse: false,
        });
        assertValidationSuccessMessage();
        // Assert add button is now enabled and then perform add operation
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Add',
          buttonType: 'submit',
        })
          .should('be.enabled')
          .click();
        // Assert add operation success flash message
        cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_OPERATION_SAVED);
        // Select the created provider from the data table
        selectCreatedProvider(nameFieldValue);
        // Select refresh option and assert flash message
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

        // Delete the created provider & assert delete operation success flash message
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
        // Setting up data and opening edit form
        addOpenstackProviderAndOpenEditForm({
          nameValue: nameFieldValue,
          hostValue: 'openstack.verify-edit-form-elements.com',
        });

        // Validate elements
        validateOpenstackFormFields(true);
      });

      it("Should show the error message from the task_results API upon validation failure and validate reset & cancel buttons' behavior", () => {
        nameFieldValue = `${OPENSTACK_NAME_VALUE} - Verify edit form validation error`;
        // Setting up data and opening edit form
        addOpenstackProviderAndOpenEditForm({
          nameValue: nameFieldValue,
          hostValue: 'openstack.verify-edit-form-validation-error.com',
        });

        // Update security protocol field
        cy.getFormSelectFieldById({
          selectId: 'endpoints.default.security_protocol',
        }).select(SECURITY_PROTOCOL_NON_SSL);
        // Assert validation error message
        validate({
          stubErrorResponse: true,
          errorMessage: OPENSTACK_VALIDATION_ERROR,
        });
        assertValidationFailureMessage();
        // Assert reset button is now enabled and then perform reset operation
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Reset' })
          .should('be.enabled')
          .click();
        // Assert security protocol field has the old value
        cy.getFormSelectFieldById({
          selectId: 'endpoints.default.security_protocol',
        })
          .find('option:selected')
          .should('have.text', SECURITY_PROTOCOL_SSL);
        // Validate cancel button
        cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' }).click();
        // Validating cancellation flash message
        cy.expect_flash(
          flashClassMap.success,
          FLASH_MESSAGE_OPERATION_CANCELLED
        );
      });

      it('Verify successful validate + edit operation', () => {
        nameFieldValue = `${OPENSTACK_NAME_VALUE} - Verify validate/edit operations`;
        // Setting up data and opening edit form
        addOpenstackProviderAndOpenEditForm({
          nameValue: nameFieldValue,
          hostValue: 'openstack.verify-validate-edit-operations.com',
        });

        // Update security protocol field
        cy.getFormSelectFieldById({
          selectId: 'endpoints.default.security_protocol',
        }).select(SECURITY_PROTOCOL_NON_SSL);
        // Assert validation success message
        validate({
          stubErrorResponse: false,
        });
        assertValidationSuccessMessage();
        // Assert save button is now enabled and then perform save operation
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Save',
          buttonType: 'submit',
        })
          .should('be.enabled')
          .click();
        // Assert save operation success flash message
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
        // Add all mandatory field values
        fillOpenstackForm({
          nameValue: nameFieldValue,
          hostValue: 'openstack.verify-duplicate-restriction.com',
        });
        // Perform validation
        validate({
          stubErrorResponse: false,
        });
        // Perform add operation
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Add',
          buttonType: 'submit',
        }).click();
      });

      it('Should display error on duplicate name usage', () => {
        // Open the add cloud-provider form again
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_PROVIDER_CONFIG_OPTION);
        // Add same name as above
        fillOpenstackForm({
          nameValue: nameFieldValue,
          hostValue: 'openstack.verify-duplicate-restriction.com',
        });
        // Assert name already exists error message
        assertNameAlreadyExistsError();
      });

      afterEach(() => {
        // TODO: add better clean up approach
        cleanUp({ createdProviderName: nameFieldValue });
      });
    });
  });
});
