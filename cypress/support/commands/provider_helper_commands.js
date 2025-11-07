import {
  SELECT_OPTIONS,
  TAB_LABELS,
  FIELD_LABELS,
  VALIDATION_MESSAGES,
  PROVIDER_TYPES,
  REGION_OPTIONS,
  FLASH_MESSAGES,
} from '../../e2e/ui/Compute/Clouds/Providers/provider-factory';
import { flashClassMap } from '../assertions/assertion_constants';

/**
 * Generates a unique identifier using timestamp
 * @returns {string}
 */
function generateUniqueIdentifier() {
  return new Date().getTime();
}

/**
 * Transforms any text string into a slug format using the given seperator('-', '_')
 * @param {*} text
 * @param {*} separator
 * @example slugifyWith("Cloud Provider Name", "_")
 * will return "cloud_provider_name"
 */
function slugifyWith(text, separator) {
  return text.toLowerCase().replace(/\s+/g, separator);
}

/**
 * Fills common form fields that are present in all provider forms
 * @param {Object} providerConfig - The provider configuration object
 * @param {string} nameValue - The name to use for the provider
 */
function fillCommonFormFields(providerConfig, nameValue) {
  cy.getFormSelectFieldById({ selectId: 'type' }).select(providerConfig.type);
  cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type(nameValue);
  cy.getFormSelectFieldById({ selectId: 'zone_id' }).select(
    SELECT_OPTIONS.ZONE_DEFAULT
  );
}

/**
 * Fills form fields based on field definitions and values
 * @param {Array} fields - Array of field definition objects
 * @param {Object} values - Object containing field values
 */
function fillFormFields(fields, values) {
  fields.forEach((field) => {
    if (!values[field.id]) return;

    switch (field.type) {
      case 'select':
        cy.getFormSelectFieldById({ selectId: field.id }).select(
          values[field.id]
        );
        break;
      case 'text':
        cy.getFormInputFieldByIdAndType({ inputId: field.id }).type(
          values[field.id]
        );
        break;
      case 'number':
        cy.getFormInputFieldByIdAndType({
          inputId: field.id,
          inputType: 'number',
        })
          .clear()
          .type(values[field.id]);
        break;
      case 'password':
        cy.getFormInputFieldByIdAndType({
          inputId: field.id,
          inputType: 'password',
        }).type(values[field.id]);
        break;
      case 'textarea':
        cy.getFormTextareaById({ textareaId: field.id }).type(values[field.id]);
        break;
      case 'checkbox':
        if (values[field.id]) {
          cy.getFormInputFieldByIdAndType({
            inputId: field.id,
            inputType: 'checkbox',
          }).check();
        }
        break;
      default:
        break;
    }
  });
}

/**
 * Fills a provider form based on provider configuration
 * @param {Object} providerConfig - The provider configuration object
 * @param {string} nameValue - The name to use for the provider
 * @param {string} hostValue - The hostname to use for the provider
 */
Cypress.Commands.add(
  'fillProviderForm',
  (providerConfig, nameValue, hostValue) => {
    fillCommonFormFields(providerConfig, nameValue);
    const defaultTabKey = slugifyWith(TAB_LABELS.DEFAULT, '_');
    const defaultTabFormFields = providerConfig.formFields[defaultTabKey];
    const defaultTabFormValues = providerConfig.formValues[defaultTabKey];
    if (defaultTabFormFields && defaultTabFormValues) {
      fillFormFields(defaultTabFormFields, defaultTabFormValues);
    }

    // Since the host value needs to be unique per test, it's passed as a parameter instead of
    // being hardcoded in the static formValues object. Only the default field is used(endpoints.default.hostname)
    if (hostValue) {
      const defaultHostFieldId = 'endpoints.default.hostname';
      const defaultHostFieldExists = providerConfig.formFields[
        defaultTabKey
      ].find((fieldObject) => fieldObject.id === defaultHostFieldId);
      if (defaultHostFieldExists) {
        cy.getFormInputFieldByIdAndType({
          inputId: defaultHostFieldId,
        }).type(hostValue);
      }
    }
  }
);

/**
 * Validates common form fields that are present in all provider forms
 * @param {boolean} isEdit - Whether the form is in edit mode
 */
function validateCommonFormFields(providerType, isEdit) {
  cy.getFormLabelByForAttribute({ forValue: 'type' })
    .should('be.visible')
    .and('contain.text', FIELD_LABELS.TYPE);
  if (isEdit) {
    cy.getFormSelectFieldById({ selectId: 'type' })
      .should('be.visible')
      .and('be.disabled')
      .find('option:selected')
      .should('have.text', providerType);
  } else {
    cy.getFormSelectFieldById({ selectId: 'type' })
      .should('be.visible')
      .and('be.enabled')
      .select(providerType);
  }
  cy.getFormLabelByForAttribute({ forValue: 'name' })
    .should('be.visible')
    .and('contain.text', FIELD_LABELS.NAME);
  cy.getFormInputFieldByIdAndType({ inputId: 'name' })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({ forValue: 'zone_id' })
    .should('be.visible')
    .and('contain.text', FIELD_LABELS.ZONE);
  cy.getFormSelectFieldById({ selectId: 'zone_id' })
    .should('be.visible')
    .and('be.enabled');
}

/**
 * Validates form fields based on field definitions
 * @param {Array} fields - Array of field definition objects
 * @param {boolean} isEdit - Whether the form is in edit mode
 */
function validateFormFields(fields, isEdit) {
  fields.forEach((field) => {
    // Skip label validation for placeholder fields in edit mode
    if (!(isEdit && field.isPlaceholderInEditMode)) {
      cy.getFormLabelByForAttribute({ forValue: field.id })
        .scrollIntoView()
        .should('be.visible')
        .and('contain.text', field.label);
    }

    switch (field.type) {
      case 'select':
        cy.getFormSelectFieldById({ selectId: field.id })
          .should('be.visible')
          .and('be.enabled');
        break;
      case 'text':
        cy.getFormInputFieldByIdAndType({ inputId: field.id })
          .should('be.visible')
          .and('be.enabled');
        break;
      case 'number':
        cy.getFormInputFieldByIdAndType({
          inputId: field.id,
          inputType: 'number',
        })
          .should('be.visible')
          .and('be.enabled');
        break;
      case 'password':
        // Password fields appear as disabled placeholders in edit mode
        // with a legend instead of a label, and have a different ID format
        if (isEdit && field.isPlaceholderInEditMode) {
          cy.getFormLegendByText({ legendText: field.label });
          cy.getFormInputFieldByIdAndType({
            inputId: `${field.id}-password-placeholder`,
            inputType: 'password',
          })
            .should('be.visible')
            .and('be.disabled');
        } else {
          cy.getFormInputFieldByIdAndType({
            inputId: field.id,
            inputType: 'password',
          })
            .should('be.visible')
            .and('be.enabled');
        }
        break;
      case 'textarea':
        // Similar to password fields, Auth key fields appear as disabled
        // placeholders with a legend instead of a label
        if (isEdit && field.isPlaceholderInEditMode) {
          cy.getFormLegendByText({ legendText: field.label });
          cy.getFormInputFieldByIdAndType({
            inputId: `${field.id}-password-placeholder`,
            inputType: 'password',
          })
            .should('be.visible')
            .and('be.disabled');
        } else {
          cy.getFormTextareaById({ textareaId: field.id })
            .should('be.visible')
            .and('be.enabled');
        }
        break;
      case 'checkbox':
        cy.getFormInputFieldByIdAndType({
          inputId: field.id,
          inputType: 'checkbox',
        })
          .should('be.visible')
          .and('be.enabled');
        break;
      default:
        break;
    }
  });
}

/**
 * Validates form buttons (validate, add/save, reset, cancel)
 * @param {string} providerType - Type of provider to be validated
 * @param {boolean} isEdit - Whether the form is in edit mode
 */
function validateProviderFormButtons(providerType, isEdit) {
  cy.getFormButtonByTypeWithText({
    buttonText: 'Validate',
  })
    .scrollIntoView()
    .should('be.visible')
    .and('be.disabled');
  // TODO: Confirm why the Save button for "IBM Cloud VPC" is enabled in edit mode even when no changes are made
  const saveButtonAssertionText =
    isEdit && providerType === PROVIDER_TYPES.IBM_CLOUD_VPC
      ? 'be.enabled'
      : 'be.disabled';
  cy.getFormButtonByTypeWithText({
    buttonText: isEdit ? 'Save' : 'Add',
    buttonType: 'submit',
  })
    .should('be.visible')
    .and(saveButtonAssertionText);
  if (isEdit) {
    const resetButtonEnabledProviderTypes = [
      PROVIDER_TYPES.VMWARE_VCLOUD,
      PROVIDER_TYPES.IBM_CLOUD_VPC,
      PROVIDER_TYPES.IBM_CIC,
      PROVIDER_TYPES.OPENSTACK,
    ];
    const resetButtonAssertionText = resetButtonEnabledProviderTypes.includes(
      providerType
    )
      ? 'be.enabled'
      : 'be.disabled';
    cy.getFormButtonByTypeWithText({ buttonText: 'Reset' })
      .should('be.visible')
      .and(resetButtonAssertionText);
  }
  cy.getFormButtonByTypeWithText({ buttonText: 'Cancel' })
    .should('be.visible')
    .and('be.enabled');
}

/**
 * Handles special tab setup requirements before validation
 * Some tabs require selecting specific values in dropdowns before other fields become visible
 * @param {string} tab - The tab name
 * @param {Object} providerConfig - The provider configuration
 */
function setupTabForValidation(tab, providerConfig) {
  if (tab === TAB_LABELS.DEFAULT) {
    if (providerConfig.fieldSelectionValues.default) {
      const eventStreamValues =
        providerConfig.fieldSelectionValues.default.event_stream_selection;
      cy.getFormSelectFieldById({
        selectId: 'api_version',
      }).select(providerConfig.fieldSelectionValues.default.api_version);
      cy.getFormSelectFieldById({
        selectId: 'event_stream_selection',
        // TODO: Enhance to sequentially select values and validate their associated
        // fields before moving to the next(like in IBM CIC & Openstack)
      }).select(eventStreamValues[0]);
    }
  } else if (tab === TAB_LABELS.EVENTS) {
    if (providerConfig.fieldSelectionValues.events) {
      if (providerConfig.fieldSelectionValues.events.event_stream_selection) {
        const eventStreamValues =
          providerConfig.fieldSelectionValues.events.event_stream_selection;
        cy.getFormSelectFieldById({
          selectId: 'event_stream_selection',
          // TODO: Enhance to sequentially select values and validate their
          // associated fields, if necessary in events tab
        }).select(eventStreamValues[0]);
      } else if (providerConfig.fieldSelectionValues.events.events_selection) {
        cy.getFormSelectFieldById({
          selectId: 'events_selection',
        }).select(providerConfig.fieldSelectionValues.events.events_selection);
      }
    }
  } else if (tab === TAB_LABELS.METRICS) {
    // For IBM Cloud VPC and other providers with metrics_selection
    if (providerConfig.fieldSelectionValues.metrics) {
      if (providerConfig.fieldSelectionValues.metrics.metrics_selection) {
        cy.getFormSelectFieldById({ selectId: 'metrics_selection' }).select(
          providerConfig.fieldSelectionValues.metrics.metrics_selection
        );
      }
    }
  }
}

/**
 * Validates a provider form based on provider configuration
 * @param {Object} providerConfig - The provider configuration object
 * @param {boolean} isEdit - Whether the form is in edit mode
 */
Cypress.Commands.add('validateProviderFormFields', (providerConfig, isEdit) => {
  validateCommonFormFields(providerConfig.type, isEdit);
  providerConfig.tabs.forEach((tab) => {
    // If not on the default tab, switch to it
    if (tab !== TAB_LABELS.DEFAULT) {
      cy.tabs({ tabLabel: tab });
    }
    // Set up the tab for validation (select required dropdown values)
    setupTabForValidation(tab, providerConfig);
    const tabKeyCorrespondingToTabName = slugifyWith(tab, '_');
    if (providerConfig.formFields[tabKeyCorrespondingToTabName]) {
      validateFormFields(
        providerConfig.formFields[tabKeyCorrespondingToTabName],
        isEdit
      );
    }
  });
  // Switch back to default tab
  if (providerConfig.tabs.length > 1) {
    cy.tabs({ tabLabel: TAB_LABELS.DEFAULT });
  }
  validateProviderFormButtons(providerConfig.type, isEdit);
});

/**
 * Updates provider fields for edit validation tests based on provider type
 * @param {Object} providerType - The provider type
 */
function updateProviderFieldsForEdit(providerType) {
  // Different providers need different fields updated for validation
  switch (providerType) {
    case PROVIDER_TYPES.VMWARE_VCLOUD:
      cy.getFormSelectFieldById({ selectId: 'api_version' }).select(
        SELECT_OPTIONS.API_VERSION_V9
      );
      break;
    case PROVIDER_TYPES.ORACLE_CLOUD:
      cy.getFormSelectFieldById({ selectId: 'provider_region' }).select(
        REGION_OPTIONS.MELBOURNE
      );
      break;
    case PROVIDER_TYPES.IBM_CLOUD_VPC:
      cy.getFormSelectFieldById({ selectId: 'provider_region' }).select(
        REGION_OPTIONS.SPAIN
      );
      break;
    case PROVIDER_TYPES.IBM_POWER_SYSTEMS:
      cy.getFormInputFieldByIdAndType({ inputId: 'uid_ems' }).type('-xr4q');
      break;
    case PROVIDER_TYPES.GOOGLE_COMPUTE:
      cy.getFormInputFieldByIdAndType({ inputId: 'project' }).type('-76g1');
      break;
    case PROVIDER_TYPES.AZURE_STACK:
    case PROVIDER_TYPES.IBM_POWERVC:
    case PROVIDER_TYPES.IBM_CIC:
    case PROVIDER_TYPES.OPENSTACK:
      cy.getFormSelectFieldById({
        selectId: 'endpoints.default.security_protocol',
      }).select(SELECT_OPTIONS.SECURITY_PROTOCOL_NON_SSL);
      break;
    case PROVIDER_TYPES.AZURE:
      cy.getFormSelectFieldById({ selectId: 'provider_region' }).select(
        REGION_OPTIONS.CENTRAL_US
      );
      break;
    case PROVIDER_TYPES.AMAZON_EC2:
      cy.getFormSelectFieldById({ selectId: 'provider_region' }).select(
        REGION_OPTIONS.ASIA_PACIFIC
      );
      break;
    default:
  }
}

/**
 * Selects a created provider from the data table
 * @param {string} providerName - The name of the provider to select
 */
function selectCreatedProvider(providerName) {
  // Set pagination to 200 items per page to include the target provider despite pending deletions
  cy.get(
    '.miq-fieldset-content .miq-pagination select#bx-pagination-select-1'
  ).select('200');
  cy.selectTableRowsByText({ textArray: [providerName] });
}

/**
 * Intercepts the API call when adding a provider and handles special case for Azure Stack
 *
 * This command intercepts the POST request to '/api/providers' that occurs when adding a provider.
 * For Azure Stack providers, it allows the request to reach the server (so data is created) but then
 * overrides the response status code to 200 (OK). This is necessary because the server would normally
 * return a 500 error when using mock values for fields like host, port, etc. in test environments.
 *
 * The command automatically triggers the form submission by clicking the 'Add' button.
 *
 * @param {Object} options - Options for the interception
 * @param {boolean} [options.isAzureStack=false] - Whether the provider is Azure Stack, which requires
 *                                                special response handling
 */
Cypress.Commands.add(
  'interceptAddProviderApi',
  ({ isAzureStack = false } = {}) => {
    cy.interceptApi({
      alias: 'addProviderApi',
      urlPattern: '/api/providers',
      triggerFn: () =>
        cy
          .getFormButtonByTypeWithText({
            buttonText: 'Add',
            buttonType: 'submit',
          })
          .click(),
      ...(isAzureStack && {
        responseInterceptor: (req) => {
          // Let the request go through to the server(so that the data is created) and then override
          // the response statusCode to 200, server will return internal_server_error(500) since we are
          // using mock values for fields like host, port, etc.
          req.continue((res) => {
            res.send(200);
          });
        },
      }),
    });
  }
);

/**
 * Adds a provider and opens the edit form
 * @param {Object} providerConfig - The provider configuration object
 * @param {string} nameValue - The name to use for the provider
 * @param {string} hostValue - The hostname to use for the provider (optional)
 * @param {boolean} isAzureStack - Whether the provider is Azure Stack, which requires special handling when opening edit form
 */
function addProviderAndOpenEditForm(
  providerConfig,
  nameValue,
  hostValue,
  isAzureStack
) {
  cy.fillProviderForm(providerConfig, nameValue, hostValue);
  cy.providerValidation({
    stubErrorResponse: false,
  });
  cy.interceptAddProviderApi({ isAzureStack });
  selectCreatedProvider(nameValue);
  // Azure-Stack needs to be handled differently, add similar cases if needed
  // These APIs help populate the form fields
  if (isAzureStack) {
    // TODO: Switch to cy.interceptApi once its enhanced to support multiple api intercepts from a single event
    cy.intercept(
      'GET',
      /\/api\/providers\/(\d+)\?attributes=endpoints,authentications/,
      (req) => {
        const providerId = req.url.match(/\/api\/providers\/(\d+)\?/)[1];
        req.continue((res) => {
          res.send(200, {
            id: providerId,
            type: 'ManageIQ::Providers::AzureStack::CloudManager',
            name: nameValue,
            zone_id: '2',
            uid_ems: providerConfig.formValues.default.uid_ems,
            subscription: providerConfig.formValues.default.subscription,
            api_version: providerConfig.formValues.default.api_version,
            endpoints: [
              {
                role: 'default',
                hostname: hostValue,
                port: providerConfig.formValues.default[
                  'endpoints.default.port'
                ],
                security_protocol:
                  providerConfig.formValues.default[
                    'endpoints.default.security_protocol'
                  ],
              },
            ],
            authentications: [
              {
                authtype: 'default',
                userid:
                  providerConfig.formValues.default[
                    'authentications.default.userid'
                  ],
              },
            ],
          });
        });
      }
    ).as('getProviderFieldValuesApi');
    cy.intercept(
      'GET',
      '/api/zones?expand=resources&attributes=id,name,visible&filter[]=visible!=false&sort_by=name',
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
                name: SELECT_OPTIONS.ZONE_DEFAULT,
                visible: true,
              },
            ],
          });
        });
      }
    ).as('getZoneDropdownOptionsApi');
    cy.toolbar('Configuration', 'Edit Selected Cloud Provider');
    cy.wait('@getProviderFieldValuesApi');
    cy.wait('@getZoneDropdownOptionsApi');
  } else {
    cy.toolbar('Configuration', 'Edit Selected Cloud Provider');
  }
}

/**
 * Asserts validation failure message
 */
function assertValidationFailureMessage() {
  cy.contains('.ddorg__carbon-error-helper-text', VALIDATION_MESSAGES.FAILED);
}

/**
 * Asserts validation success message
 */
function assertValidationSuccessMessage() {
  return cy.contains('.bx--form__helper-text', VALIDATION_MESSAGES.SUCCESSFUL);
}

/**
 * Asserts name already exists error
 */
function assertNameAlreadyExistsError() {
  return cy.expect_inline_field_errors({
    containsText: VALIDATION_MESSAGES.NAME_ALREADY_EXISTS,
  });
}

/**
 * Performs validation with optional error response stubbing
 * @param {boolean} stubErrorResponse - Whether to stub an error response
 * @param {string} errorMessage - The error message to show
 */
Cypress.Commands.add(
  'providerValidation',
  ({ stubErrorResponse, errorMessage }) => {
    let response = { state: 'Finished', status: 'Error' };
    if (stubErrorResponse) {
      response = {
        ...response,
        message: errorMessage,
      };
    } else {
      response = { ...response, status: 'Ok', task_results: {} };
    }
    // not using cy.interceptApi because each validate call requires a fresh alias registration,
    // reusing the same intercept callback results in it returning the first response object
    cy.intercept('GET', '/api/tasks/*?attributes=task_results', response).as(
      'validateApi'
    );
    cy.getFormButtonByTypeWithText({
      buttonText: 'Validate',
    }).click();
    cy.wait('@validateApi');
  }
);

/**
 * Deletes a provider with optional flash message check
 * @param {string} createdProviderName - The name of the provider to delete
 * @param {boolean} assertDeleteFlashMessage - Whether to assert the delete flash message
 */
function selectProviderAndDeleteWithOptionalFlashMessage({
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
          cy.toolbar('Configuration', 'Remove Cloud Providers from Inventory'),
        containsText: 'removed',
      }),
    onApiResponse: () => {
      if (assertDeleteFlashMessage) {
        cy.expect_flash(flashClassMap.success, 'delete');
      }
    },
  });
}

/**
 * Provider Test Generator helpers - Generates test cases for cloud providers
 * These utilities make it easy to create test cases for different provider types
 */

/**
 * Generates a test suite for validating the add form of a provider
 * @param {Object} providerConfig - The provider configuration object
 */
function generateAddFormValidationTests(providerConfig, isAzureStack = false) {
  describe(`Validate ${providerConfig.type} add form`, () => {
    it('Validate visibility of elements', () => {
      cy.validateProviderFormFields(providerConfig, false);
    });

    it('Should show the error message from the task_results API upon validation failure and validate cancel button behavior', () => {
      cy.fillProviderForm(
        providerConfig,
        providerConfig.nameValue,
        'manageiq.example.com'
      );
      cy.providerValidation({
        stubErrorResponse: true,
        errorMessage: providerConfig.validationError,
      });
      assertValidationFailureMessage();
      cy.getFormButtonByTypeWithText({ buttonText: 'Cancel' }).click();
      cy.expect_flash(
        flashClassMap.success,
        FLASH_MESSAGES.OPERATION_CANCELLED
      );
    });

    it('Verify successful validate + add/refresh/delete operations', () => {
      /**
       * The provider's unique name is set in nameValue variable
       */
      const uniqueId = generateUniqueIdentifier();
      const nameValue = `${providerConfig.nameValue} - verify-validate-add-refresh-and-delete-operations - ${uniqueId}`;
      const hostValue = `${slugifyWith(
        providerConfig.type,
        '-'
      )}-${uniqueId}.com`;
      cy.fillProviderForm(providerConfig, nameValue, hostValue);
      //Add
      cy.providerValidation({
        stubErrorResponse: false,
      });
      assertValidationSuccessMessage();
      cy.interceptAddProviderApi({ isAzureStack });
      cy.expect_flash(flashClassMap.success, FLASH_MESSAGES.OPERATION_SAVED);
      // Refresh
      selectCreatedProvider(nameValue);
      cy.expect_browser_confirm_with_text({
        confirmTriggerFn: () =>
          cy.toolbar('Configuration', 'Refresh Relationships and Power States'),
        containsText: FLASH_MESSAGES.REFRESH_OPERATION,
      });
      cy.expect_flash(flashClassMap.success, FLASH_MESSAGES.REFRESH_OPERATION);
      // Delete
      // FIXME: remove this block once bug is fixed
      // Bug: After refresh, config option other than add remains disabled and requires any action to be performed to enable it back
      /* ==================================================================== */
      cy.toolbar('Configuration', 'Add a New Cloud Provider');
      cy.getFormButtonByTypeWithText({ buttonText: 'Cancel' }).click();
      /* ==================================================================== */
      selectProviderAndDeleteWithOptionalFlashMessage({
        createdProviderName: nameValue,
        assertDeleteFlashMessage: true,
      });
    });
  });
}

/**
 * Generates a test suite for validating the edit form of a provider
 * @param {Object} providerConfig - The provider configuration object
 * @param {boolean} isAzureStack - Whether the provider is Azure Stack (requires special handling)
 */
function generateEditFormValidationTests(providerConfig, isAzureStack = false) {
  describe(`Validate ${providerConfig.type} edit form`, () => {
    /**
     * The provider's unique name is set in this variable at the start of each test
     */
    let nameFieldValue;
    let hostValue;

    it('Validate visibility of elements', () => {
      // TODO: Replace with better data set-up approach
      const uniqueId = generateUniqueIdentifier();
      nameFieldValue = `${providerConfig.nameValue} - verify-edit-form-elements - ${uniqueId}`;
      hostValue = `${slugifyWith(providerConfig.type, '-')}-${uniqueId}.com`;
      addProviderAndOpenEditForm(
        providerConfig,
        nameFieldValue,
        hostValue,
        isAzureStack
      );
      cy.validateProviderFormFields(providerConfig, true);
    });

    it("Should show the error message from the task_results API upon validation failure and validate reset & cancel buttons' behavior", () => {
      // TODO: Replace with better data set-up approach
      const uniqueId = generateUniqueIdentifier();
      nameFieldValue = `${providerConfig.nameValue} - verify-edit-form-validation-error - ${uniqueId}`;
      hostValue = `${slugifyWith(providerConfig.type, '-')}-${uniqueId}.com`;
      addProviderAndOpenEditForm(
        providerConfig,
        nameFieldValue,
        hostValue,
        isAzureStack
      );
      updateProviderFieldsForEdit(providerConfig.type);
      cy.providerValidation({
        stubErrorResponse: true,
        errorMessage: providerConfig.validationError,
      });
      assertValidationFailureMessage();
      cy.getFormButtonByTypeWithText({ buttonText: 'Reset' })
        .should('be.enabled')
        .click();
      cy.getFormButtonByTypeWithText({
        buttonText: 'Cancel',
      }).click();
      cy.expect_flash(
        flashClassMap.success,
        FLASH_MESSAGES.OPERATION_CANCELLED
      );
    });

    it('Verify successful validate + edit operation', () => {
      // TODO: Replace with better data set-up approach
      const uniqueId = generateUniqueIdentifier();
      nameFieldValue = `${providerConfig.nameValue} - verify-validate-and-edit-operations - ${uniqueId}`;
      hostValue = `${slugifyWith(providerConfig.type, '-')}-${uniqueId}.com`;
      addProviderAndOpenEditForm(
        providerConfig,
        nameFieldValue,
        hostValue,
        isAzureStack
      );
      // Update fields based on provider type
      updateProviderFieldsForEdit(providerConfig.type);
      cy.providerValidation({
        stubErrorResponse: false,
      });
      assertValidationSuccessMessage();
      // Azure Stack needs to be handled differently, add similar cases if needed
      if (isAzureStack) {
        cy.interceptApi({
          method: 'PATCH',
          alias: 'editAzureStackProviderApi',
          urlPattern: /\/api\/providers\/\d+/,
          triggerFn: () =>
            cy
              .getFormButtonByTypeWithText({
                buttonText: 'Save',
                buttonType: 'submit',
              })
              .should('be.enabled')
              .click(),
          responseInterceptor: (req) => {
            req.continue((res) => {
              res.send(200);
            });
          },
        });
      } else {
        cy.getFormButtonByTypeWithText({
          buttonText: 'Save',
          buttonType: 'submit',
        })
          .should('be.enabled')
          .click();
      }
      cy.expect_flash(flashClassMap.success, FLASH_MESSAGES.OPERATION_SAVED);
    });

    afterEach(() => {
      cy.appDbState('restore');
    });
  });
}

/**
 * Generates a test suite for validating the name uniqueness of a provider
 * @param {Object} providerConfig - The provider configuration object
 * @param {boolean} isAzureStack - Whether the provider is Azure Stack (requires special handling)
 */
function generateNameUniquenessTests(providerConfig, isAzureStack = false) {
  describe(`${providerConfig.type} provider name uniqueness validation`, () => {
    /**
     * The provider's unique name is set in this variable at the start of the test
     */
    let nameFieldValue;
    let hostValue;

    beforeEach(() => {
      // TODO: Replace with better data set-up approach
      const uniqueId = generateUniqueIdentifier();
      nameFieldValue = `${providerConfig.nameValue} - verify-duplicate-restriction - ${uniqueId}`;
      hostValue = `${slugifyWith(providerConfig.type, '-')}-${uniqueId}.com`;

      cy.fillProviderForm(providerConfig, nameFieldValue, hostValue);
      cy.providerValidation({
        stubErrorResponse: false,
      });
      cy.interceptAddProviderApi({ isAzureStack });
    });

    it('Should display error on duplicate name usage', () => {
      cy.toolbar('Configuration', 'Add a New Cloud Provider');
      // Add same name as above
      cy.fillProviderForm(providerConfig, nameFieldValue, hostValue);
      assertNameAlreadyExistsError();
    });

    afterEach(() => {
      cy.appDbState('restore');
    });
  });
}

/**
 * Generates all test suites for a provider
 * @param {Object} providerConfig - The provider configuration object
 */
export function generateProviderTests(providerConfig) {
  const isAzureStack = providerConfig.type === PROVIDER_TYPES.AZURE_STACK;

  describe(`Validate cloud provider type: ${providerConfig.type}`, () => {
    generateAddFormValidationTests(providerConfig, isAzureStack);
    generateEditFormValidationTests(providerConfig, isAzureStack);
    generateNameUniquenessTests(providerConfig, isAzureStack);
  });
}
