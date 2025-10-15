/* eslint-disable no-undef */
import { flashClassMap } from '@cypress-dir/support/assertions/assertion_constants.js';

// Component route url
const COMPONENT_ROUTE_URL = 'miq_ae_class/explorer#/';

// Menu options
const AUTOMATION_MENU_OPTION = 'Automation';
const EMBEDDED_AUTOMATION_MENU_OPTION = 'Embedded Automate';
const EXPLORER_MENU_OPTION = 'Explorer';

// Toolbar options
const TOOLBAR_CONFIGURATION = 'Configuration';
const TOOLBAR_ADD_NEW_DOMAIN = 'Add a New Domain';
const TOOLBAR_REMOVE_DOMAIN = 'Remove this Domain';
const TOOLBAR_ADD_NEW_NAMESPACE = 'Add a New Namespace';
const TOOLBAR_EDIT_NAMESPACE = 'Edit this Namespace';
const TOOLBAR_REMOVE_NAMESPACE = 'Remove this Namespace';

// Field values
const NAME_SAPCE_PATH_FIELD_LABEL = 'Fully Qualified Name';
const NAME_FIELD_LABEL = 'Name';
const DESCRIPTION_FIELD_LABEL = 'Description';
const DOMAIN_NAME = 'Test_Domain';
const DESCRIPTION = 'Test description';
const NAMESPACE_NAME = 'Test_Namespace';
const EDITED_NAMESPACE_NAME = 'Test_Namespace_Edited';
const EDITED_DESCRIPTION = 'Test description edited';
const INVALID_NAMESPACE_NAME = 'Test Namespace';
const NAMESPACE_FORM_HEADER = 'Automate Namespace';
const NAMESPACE_FORM_SUB_HEADER = 'Info';

// List items
const DATA_STORE_ACCORDION_LABEL = 'Datastore';

// Buttons
const ADD_BUTTON_TEXT = 'Add';
const CANCEL_BUTTON_TEXT = 'Cancel';
const SAVE_BUTTON_TEXT = 'Save';
const RESET_BUTTON_TEXT = 'Reset';

// Flash message text snippets
const FLASH_MESSAGE_ADD_SUCCESS = 'added';
const FLASH_MESSAGE_SAVE_SUCCESS = 'saved';
const FLASH_MESSAGE_CANCELLED = 'cancel';
const FLASH_MESSAGE_INVALID_NAMESPACE = 'contain only alphanumeric';
const FLASH_MESSAGE_NAMESPACE_REMOVED = 'delete successful';
const FLASH_MESSAGE_NAME_ALREADY_EXISTS = 'taken';
const FLASH_MESSAGE_RESET_NAMESPACE = 'reset';
const BROWSER_CONFIRM_REMOVE_MESSAGE = 'remove';

function addDomainOrNamespace({ nameFieldValue }) {
  // Adding name & description
  cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type(nameFieldValue);
  cy.getFormInputFieldByIdAndType({ inputId: 'description' }).type(DESCRIPTION);
  // Submitting the form
  cy.interceptApi({
    alias: 'addDomainOrNamespaceApi',
    urlPattern: '/miq_ae_class/create_namespace/new?button=add',
    triggerFn: () =>
      cy
        .getFormFooterButtonByTypeWithText({
          buttonText: ADD_BUTTON_TEXT,
          buttonType: 'submit',
        })
        .click(),
  });
}

function validateNamespaceFormFields(isEditForm = false) {
  cy.expect_explorer_title(NAMESPACE_FORM_HEADER);
  cy.get('#main-content #datastore-form-wrapper h3').contains(
    NAMESPACE_FORM_SUB_HEADER
  );
  cy.getFormLabelByForAttribute({ forValue: 'namespacePath' })
    .should('be.visible')
    .and('contain.text', NAME_SAPCE_PATH_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'namespacePath' })
    .should('be.visible')
    .and('be.disabled')
    .invoke('val')
    .should('include', DOMAIN_NAME);
  cy.getFormLabelByForAttribute({ forValue: 'name' })
    .should('be.visible')
    .and('contain.text', NAME_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'name' })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({ forValue: 'description' })
    .should('be.visible')
    .and('contain.text', DESCRIPTION_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'description' })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormFooterButtonByTypeWithText({ buttonText: CANCEL_BUTTON_TEXT })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormFooterButtonByTypeWithText({
    buttonText: isEditForm ? SAVE_BUTTON_TEXT : ADD_BUTTON_TEXT,
    buttonType: 'submit',
  })
    .should('be.visible')
    .and('be.disabled');
  if (isEditForm) {
    cy.getFormFooterButtonByTypeWithText({ buttonText: RESET_BUTTON_TEXT })
      .should('be.visible')
      .and('be.disabled');
  }
}

function createNamespaceAndOpenEditForm() {
  /* TODO: DATA_SETUP - Use API for namespace setup, excluding the test meant to validate functionality via UI */
  cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_ADD_NEW_NAMESPACE);
  addDomainOrNamespace({ nameFieldValue: NAMESPACE_NAME });
  cy.selectAccordionItem([
    DATA_STORE_ACCORDION_LABEL,
    DOMAIN_NAME,
    NAMESPACE_NAME,
  ]);
  cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_EDIT_NAMESPACE);
}

describe('Automate operations on Namespaces: Automation -> Embedded Automate -> Explorer -> {Any-created-domain} -> Namespace form', () => {
  beforeEach(() => {
    cy.appFactories([
      ['create', 'miq_ae_domain', {name: DOMAIN_NAME}],
    ]);

    cy.login();
    cy.menu(
      AUTOMATION_MENU_OPTION,
      EMBEDDED_AUTOMATION_MENU_OPTION,
      EXPLORER_MENU_OPTION
    );
    cy.selectAccordionItem([DATA_STORE_ACCORDION_LABEL, DOMAIN_NAME]);
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  it('Validate Add Namespace form fields', () => {
    cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_ADD_NEW_NAMESPACE);
    validateNamespaceFormFields();
    cy.getFormFooterButtonByTypeWithText({
      buttonText: CANCEL_BUTTON_TEXT,
    }).click();
  });

  it('Validate Cancel button', () => {
    cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_ADD_NEW_NAMESPACE);
    cy.getFormFooterButtonByTypeWithText({ buttonText: CANCEL_BUTTON_TEXT })
      .should('be.enabled')
      .click();
    cy.expect_flash(flashClassMap.warning, FLASH_MESSAGE_CANCELLED);
  });

  it('Validate Name field allows only alphanumeric and _ . - $ characters', () => {
    cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_ADD_NEW_NAMESPACE);
    addDomainOrNamespace({ nameFieldValue: INVALID_NAMESPACE_NAME });
    cy.expect_flash(flashClassMap.error, FLASH_MESSAGE_INVALID_NAMESPACE);
    cy.getFormFooterButtonByTypeWithText({
      buttonText: CANCEL_BUTTON_TEXT,
    }).click();
  });

  it('Validate Edit Namespace form fields', () => {
    createNamespaceAndOpenEditForm();
    validateNamespaceFormFields(true);
    cy.getFormFooterButtonByTypeWithText({
      buttonText: CANCEL_BUTTON_TEXT,
    }).click();
  });

  it('Checking whether add, edit & delete namespace works', () => {
    cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_ADD_NEW_NAMESPACE);
    addDomainOrNamespace({ nameFieldValue: NAMESPACE_NAME });
    cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_ADD_SUCCESS);
    cy.selectAccordionItem([
      DATA_STORE_ACCORDION_LABEL,
      DOMAIN_NAME,
      NAMESPACE_NAME,
    ]);
    cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_EDIT_NAMESPACE);
    cy.getFormFooterButtonByTypeWithText({
      buttonText: SAVE_BUTTON_TEXT,
      buttonType: 'submit',
    }).should('be.disabled');
    cy.getFormInputFieldByIdAndType({ inputId: 'description' })
      .clear()
      .type(EDITED_DESCRIPTION);
    cy.getFormFooterButtonByTypeWithText({
      buttonText: SAVE_BUTTON_TEXT,
      buttonType: 'submit',
    })
      .should('be.enabled')
      .click();
    cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_SAVE_SUCCESS);
    cy.expect_browser_confirm_with_text({
      confirmTriggerFn: () =>
        cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_REMOVE_NAMESPACE),
      containsText: BROWSER_CONFIRM_REMOVE_MESSAGE,
    });
    cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_NAMESPACE_REMOVED);
  });

  it('Checking whether creating a duplicate namespace is restricted', () => {
    /* TODO: DATA_SETUP - Use API for namespace setup, excluding the test meant to validate functionality via UI */
    cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_ADD_NEW_NAMESPACE);
    addDomainOrNamespace({ nameFieldValue: NAMESPACE_NAME });
    cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_ADD_NEW_NAMESPACE);
    addDomainOrNamespace({ nameFieldValue: NAMESPACE_NAME });
    cy.expect_flash(flashClassMap.error, FLASH_MESSAGE_NAME_ALREADY_EXISTS);
    cy.getFormFooterButtonByTypeWithText({
      buttonText: CANCEL_BUTTON_TEXT,
    }).click();
  });

  it('Checking whether Cancel & Reset buttons work fine in the Edit form', () => {
    createNamespaceAndOpenEditForm();
    /* Validating Reset button */
    cy.getFormFooterButtonByTypeWithText({
      buttonText: RESET_BUTTON_TEXT,
    }).should('be.disabled');
    cy.getFormInputFieldByIdAndType({ inputId: 'name' })
      .clear()
      .type(EDITED_NAMESPACE_NAME);
    cy.getFormInputFieldByIdAndType({ inputId: 'description' })
      .clear()
      .type(EDITED_DESCRIPTION);
    cy.getFormFooterButtonByTypeWithText({ buttonText: RESET_BUTTON_TEXT })
      .should('be.enabled')
      .click();
    cy.expect_flash(flashClassMap.warning, FLASH_MESSAGE_RESET_NAMESPACE);
    cy.getFormInputFieldByIdAndType({ inputId: 'name' }).should(
      'have.value',
      NAMESPACE_NAME
    );
    cy.getFormInputFieldByIdAndType({ inputId: 'description' }).should(
      'have.value',
      DESCRIPTION
    );
    /* Validating Cancel button */
    cy.getFormFooterButtonByTypeWithText({
      buttonText: CANCEL_BUTTON_TEXT,
    }).click();
    cy.expect_flash(flashClassMap.warning, FLASH_MESSAGE_CANCELLED);
  });
});
