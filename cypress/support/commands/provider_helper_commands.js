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
Cypress.Commands.add('fillCommonFormFields', (providerConfig, nameValue) => {
  cy.getFormSelectFieldById({ selectId: 'type' }).select(providerConfig.type);
  cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type(nameValue);
  cy.getFormSelectFieldById({ selectId: 'zone_id' }).select(
    SELECT_OPTIONS.ZONE_DEFAULT
  );
});

/**
 * Fills form fields based on field definitions and values
 * @param {Array} fields - Array of field definition objects
 * @param {Object} values - Object containing field values
 */
Cypress.Commands.add('fillFormFields', (fields, values) => {
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
});

/**
 * Fills a provider form based on provider configuration
 * @param {Object} providerConfig - The provider configuration object
 * @param {string} nameValue - The name to use for the provider
 * @param {string} hostValue - The hostname to use for the provider
 */
Cypress.Commands.add(
  'fillProviderForm',
  (providerConfig, nameValue, hostValue) => {
    cy.fillCommonFormFields(providerConfig, nameValue);
    const defaultTabKey = slugifyWith(TAB_LABELS.DEFAULT, '_');
    const defaultTabFormFields = providerConfig.formFields[defaultTabKey];
    const defaultTabFormValues = providerConfig.formValues[defaultTabKey];
    if (defaultTabFormFields && defaultTabFormValues) {
      cy.fillFormFields(defaultTabFormFields, defaultTabFormValues);
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
Cypress.Commands.add('validateCommonFormFields', (providerType, isEdit) => {
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
});

/**
 * Validates form fields based on field definitions
 * @param {Array} fields - Array of field definition objects
 * @param {boolean} isEdit - Whether the form is in edit mode
 */
Cypress.Commands.add('validateFormFields', (fields, isEdit) => {
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
          cy.contains('.bx--fieldset legend.bx--label', field.label);
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
          cy.contains('.bx--fieldset legend.bx--label', field.label);
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
});

/**
 * Validates form buttons (validate, add/save, reset, cancel)
 * @param {string} providerType - Type of provider to be validated
 * @param {boolean} isEdit - Whether the form is in edit mode
 */
Cypress.Commands.add('validateFormButtons', (providerType, isEdit) => {
  cy.contains('button', 'Validate')
    .scrollIntoView()
    .should('be.visible')
    .and('be.disabled');
  // TODO: Confirm why the Save button for "IBM Cloud VPC" is enabled in edit mode even when no changes are made
  const saveButtonAssertionText =
    isEdit && providerType === PROVIDER_TYPES.IBM_CLOUD_VPC
      ? 'be.enabled'
      : 'be.disabled';
  cy.getFormFooterButtonByTypeWithText({
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
    cy.getFormFooterButtonByTypeWithText({ buttonText: 'Reset' })
      .should('be.visible')
      .and(resetButtonAssertionText);
  }
  cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' })
    .should('be.visible')
    .and('be.enabled');
});

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
Cypress.Commands.add('validateProviderForm', (providerConfig, isEdit) => {
  cy.validateCommonFormFields(providerConfig.type, isEdit);
  providerConfig.tabs.forEach((tab) => {
    // If not on the default tab, switch to it
    if (tab !== TAB_LABELS.DEFAULT) {
      cy.tabs({ tabLabel: tab });
    }
    // Set up the tab for validation (select required dropdown values)
    setupTabForValidation(tab, providerConfig);
    const tabKeyCorrespondingToTabName = slugifyWith(tab, '_');
    if (providerConfig.formFields[tabKeyCorrespondingToTabName]) {
      cy.validateFormFields(
        providerConfig.formFields[tabKeyCorrespondingToTabName],
        isEdit
      );
    }
  });
  // Switch back to default tab
  if (providerConfig.tabs.length > 1) {
    cy.tabs({ tabLabel: TAB_LABELS.DEFAULT });
  }
  cy.validateFormButtons(providerConfig.type, isEdit);
});

/**
 * Updates provider fields for edit validation tests based on provider type
 * @param {Object} providerType - The provider type
 */
Cypress.Commands.add('updateProviderFieldsForEdit', (providerType) => {
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
});

/**
 * Selects a created provider from the data table
 * @param {string} providerName - The name of the provider to select
 */
Cypress.Commands.add('selectCreatedProvider', (providerName) => {
  // Set pagination to 200 items per page to include the target provider despite pending deletions
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
});

/**
 * Adds a provider and opens the edit form
 * @param {Object} providerConfig - The provider configuration object
 * @param {string} nameValue - The name to use for the provider
 * @param {string} hostValue - The hostname to use for the provider (optional)
 */
Cypress.Commands.add(
  'addProviderAndOpenEditForm',
  (providerConfig, nameValue, hostValue) => {
    cy.fillProviderForm(providerConfig, nameValue, hostValue);
    cy.validate({
      stubErrorResponse: false,
    });
    cy.getFormFooterButtonByTypeWithText({
      buttonText: 'Add',
      buttonType: 'submit',
    }).click();
    cy.selectCreatedProvider(nameValue);
    cy.toolbar('Configuration', 'Edit Selected Cloud Provider');
  }
);

/**
 * Intercepts the API call when adding an Azure Stack provider and forces a successful response
 *
 * This command intercepts the POST request to '/api/providers' that occurs when adding an Azure Stack
 * provider. It allows the request to reach the server (so data is created) but then overrides the
 * response status code to 200 (OK). This is necessary because the server would normally return a 500
 * error when using mock values for fields like host, port, etc. in test environments.
 *
 * The command automatically triggers the form submission by clicking the 'Add' button.
 */
Cypress.Commands.add('interceptAddAzureStackProviderApi', () => {
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

/**
 * Special handling for Azure Stack provider which requires additional API interception
 * @param {Object} providerConfig - The provider configuration object
 * @param {string} nameValue - The name to use for the provider
 * @param {string} hostValue - The hostname to use for the provider
 */
Cypress.Commands.add(
  'addAzureStackProviderAndOpenEditForm',
  (providerConfig, nameValue, hostValue) => {
    cy.fillProviderForm(providerConfig, nameValue, hostValue);
    cy.validate({
      stubErrorResponse: false,
    });
    cy.interceptAddAzureStackProviderApi();
    cy.selectCreatedProvider(nameValue);
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
  }
);

/**
 * Asserts validation failure message
 */
Cypress.Commands.add('assertValidationFailureMessage', () => {
  cy.contains('.ddorg__carbon-error-helper-text', VALIDATION_MESSAGES.FAILED);
});

/**
 * Asserts validation success message
 */
Cypress.Commands.add('assertValidationSuccessMessage', () => {
  cy.contains('.bx--form__helper-text', VALIDATION_MESSAGES.SUCCESSFUL);
});

/**
 * Asserts name already exists error
 */
Cypress.Commands.add('assertNameAlreadyExistsError', () => {
  cy.contains('#name-error-msg', VALIDATION_MESSAGES.NAME_ALREADY_EXISTS);
});

/**
 * Performs validation with optional error response stubbing
 * @param {boolean} stubErrorResponse - Whether to stub an error response
 * @param {string} errorMessage - The error message to show
 */
Cypress.Commands.add('validate', ({ stubErrorResponse, errorMessage }) => {
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
  cy.contains('button', 'Validate').click();
  cy.wait('@validateApi');
});

/**
 * Deletes a provider with optional flash message check
 * @param {string} createdProviderName - The name of the provider to delete
 * @param {boolean} assertDeleteFlashMessage - Whether to assert the delete flash message
 */
Cypress.Commands.add(
  'selectProviderAndDeleteWithOptionalFlashMessage',
  ({ createdProviderName, assertDeleteFlashMessage }) => {
    cy.selectCreatedProvider(createdProviderName);
    cy.interceptApi({
      alias: 'deleteProviderApi',
      urlPattern: '/ems_cloud/button?pressed=ems_cloud_delete',
      triggerFn: () =>
        cy.expect_browser_confirm_with_text({
          confirmTriggerFn: () =>
            cy.toolbar(
              'Configuration',
              'Remove Cloud Providers from Inventory'
            ),
          containsText: 'removed',
        }),
      onApiResponse: () => {
        if (assertDeleteFlashMessage) {
          cy.expect_flash(flashClassMap.success, 'delete');
        }
      },
    });
  }
);

/**
 * Cleans up a provider by deleting it
 * @param {string} createdProviderName - The name of the provider to clean up
 */
Cypress.Commands.add('cleanUp', ({ createdProviderName }) => {
  cy.url()
    .then((url) => {
      // Navigate to cloud providers table view
      if (!url.endsWith('/ems_cloud/show_list#/')) {
        cy.visit('/ems_cloud/show_list#/');
      }
    })
    .then(() => {
      cy.selectProviderAndDeleteWithOptionalFlashMessage({
        createdProviderName,
        assertDeleteFlashMessage: false,
      });
    });
});

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
      cy.validateProviderForm(providerConfig, false);
    });

    it('Should show the error message from the task_results API upon validation failure and validate cancel button behavior', () => {
      cy.fillProviderForm(
        providerConfig,
        providerConfig.nameValue,
        'manageiq.example.com'
      );
      cy.validate({
        stubErrorResponse: true,
        errorMessage: providerConfig.validationError,
      });
      cy.assertValidationFailureMessage();
      cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' }).click();
      cy.expect_flash(
        flashClassMap.success,
        FLASH_MESSAGES.OPERATION_CANCELLED
      );
    });

    it('Verify successful validate + add/refresh/delete operations', () => {
      /**
       * The provider name is set in this variable to identify it for deletion
       */
      const uniqueId = generateUniqueIdentifier();
      const nameValue = `${providerConfig.nameValue} - verify-validate-add-refresh-and-delete-operations - ${uniqueId}`;
      const hostValue = `${slugifyWith(
        providerConfig.type,
        '-'
      )}-${uniqueId}.com`;
      cy.fillProviderForm(providerConfig, nameValue, hostValue);
      //Add
      cy.validate({
        stubErrorResponse: false,
      });
      cy.assertValidationSuccessMessage();
      if (isAzureStack) {
        cy.interceptAddAzureStackProviderApi();
      } else {
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Add',
          buttonType: 'submit',
        })
          .should('be.enabled')
          .click();
      }
      cy.expect_flash(flashClassMap.success, FLASH_MESSAGES.OPERATION_SAVED);
      // Refresh
      cy.selectCreatedProvider(nameValue);
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
      cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel' }).click();
      /* ==================================================================== */
      cy.selectProviderAndDeleteWithOptionalFlashMessage({
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
     * The provider name is set in this variable at the start of each test,
     * allowing afterEach to identify it for deletion.
     */
    let nameFieldValue;
    let hostValue;

    it('Validate visibility of elements', () => {
      const uniqueId = generateUniqueIdentifier();
      nameFieldValue = `${providerConfig.nameValue} - verify-edit-form-elements - ${uniqueId}`;
      hostValue = `${slugifyWith(providerConfig.type, '-')}-${uniqueId}.com`;
      if (isAzureStack) {
        cy.addAzureStackProviderAndOpenEditForm(
          providerConfig,
          nameFieldValue,
          hostValue
        );
      } else {
        cy.addProviderAndOpenEditForm(
          providerConfig,
          nameFieldValue,
          hostValue
        );
      }
      cy.validateProviderForm(providerConfig, true);
    });

    it("Should show the error message from the task_results API upon validation failure and validate reset & cancel buttons' behavior", () => {
      const uniqueId = generateUniqueIdentifier();
      nameFieldValue = `${providerConfig.nameValue} - verify-edit-form-validation-error - ${uniqueId}`;
      hostValue = `${slugifyWith(providerConfig.type, '-')}-${uniqueId}.com`;
      if (isAzureStack) {
        cy.addAzureStackProviderAndOpenEditForm(
          providerConfig,
          nameFieldValue,
          hostValue
        );
      } else {
        cy.addProviderAndOpenEditForm(
          providerConfig,
          nameFieldValue,
          hostValue
        );
      }
      cy.updateProviderFieldsForEdit(providerConfig.type);
      cy.validate({
        stubErrorResponse: true,
        errorMessage: providerConfig.validationError,
      });
      cy.assertValidationFailureMessage();
      cy.getFormFooterButtonByTypeWithText({ buttonText: 'Reset' })
        .should('be.enabled')
        .click();
      cy.getFormFooterButtonByTypeWithText({
        buttonText: 'Cancel',
      }).click();
      cy.expect_flash(
        flashClassMap.success,
        FLASH_MESSAGES.OPERATION_CANCELLED
      );
    });

    it('Verify successful validate + edit operation', () => {
      const uniqueId = generateUniqueIdentifier();
      nameFieldValue = `${providerConfig.nameValue} - verify-validate-and-edit-operations - ${uniqueId}`;
      hostValue = `${slugifyWith(providerConfig.type, '-')}-${uniqueId}.com`;
      if (isAzureStack) {
        cy.addAzureStackProviderAndOpenEditForm(
          providerConfig,
          nameFieldValue,
          hostValue
        );
      } else {
        cy.addProviderAndOpenEditForm(
          providerConfig,
          nameFieldValue,
          hostValue
        );
      }
      // Update fields based on provider type
      cy.updateProviderFieldsForEdit(providerConfig.type);
      cy.validate({
        stubErrorResponse: false,
      });
      cy.assertValidationSuccessMessage();
      if (isAzureStack) {
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
            req.continue((res) => {
              res.send(200);
            });
          },
        });
      } else {
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Save',
          buttonType: 'submit',
        })
          .should('be.enabled')
          .click();
      }
      cy.expect_flash(flashClassMap.success, FLASH_MESSAGES.OPERATION_SAVED);
    });

    afterEach(() => {
      cy.cleanUp({ createdProviderName: nameFieldValue });
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
    const uniqueId = generateUniqueIdentifier();
    /**
     * The provider name is set in this variable at the start of the test, allowing afterEach to identify it for deletion.
     */
    const nameFieldValue = `${providerConfig.nameValue} - verify-duplicate-restriction - ${uniqueId}`;
    const hostValue = `${slugifyWith(
      providerConfig.type,
      '-'
    )}-${uniqueId}.com`;

    beforeEach(() => {
      cy.fillProviderForm(providerConfig, nameFieldValue, hostValue);
      cy.validate({
        stubErrorResponse: false,
      });
      if (isAzureStack) {
        cy.interceptAddAzureStackProviderApi();
      } else {
        cy.getFormFooterButtonByTypeWithText({
          buttonText: 'Add',
          buttonType: 'submit',
        }).click();
      }
    });

    it('Should display error on duplicate name usage', () => {
      cy.toolbar('Configuration', 'Add a New Cloud Provider');
      // Add same name as above
      cy.fillProviderForm(providerConfig, nameFieldValue, hostValue);
      cy.assertNameAlreadyExistsError();
    });

    afterEach(() => {
      cy.cleanUp({ createdProviderName: nameFieldValue });
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
