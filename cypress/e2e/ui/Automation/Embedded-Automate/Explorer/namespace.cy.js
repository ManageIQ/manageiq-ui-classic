/* eslint-disable no-undef */
import { flashClassMap } from '../../../../../support/assertions/assertion_constants';

// Menu options
const AUTOMATION_MENU_OPTION = 'Automation';
const EMBEDDED_AUTOMATION_MENU_OPTION = 'Embedded Automate';
const EXPLORER_MENU_OPTION = 'Explorer';

// Toolbar options
const TOOLBAR_CONFIGURATION = 'Configuration';
const TOOLBAR_ADD_NEW_DOMAIN = 'Add a New Domain';
const TOOLBAR_ADD_NEW_NAMESPACE = 'Add a New Namespace';
const TOOLBAR_EDIT_NAMESPACE = 'Edit this Namespace';
const TOOLBAR_REMOVE_NAMESPACE = 'Remove this Namespace';

// Field values
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

const FLASH_TYPE_ERROR = 'error';

// Flash message text snippets
const FLASH_MESSAGE_ADD_SUCCESS = 'added';
const FLASH_MESSAGE_SAVE_SUCCESS = 'saved';
const FLASH_MESSAGE_CANCELLED = 'cancel';
const FLASH_MESSAGE_INVALID_NAMESPACE = 'contain only alphanumeric';
const FLASH_MESSAGE_NAMESPACE_REMOVED = 'delete successful';
const FLASH_MESSAGE_NAME_ALREADY_EXISTS = 'taken';
const FLASH_MESSAGE_RESET_NAMESPACE = 'reset';
const BROWSER_CONFIRM_REMOVE_MESSAGE = 'remove';

function addNamespace(nameFieldValue) {
  // Navigating to the Add Namespace form
  cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_ADD_NEW_NAMESPACE);
  // Creating a new namespace
  cy.getFormInputFieldById('name').type(nameFieldValue);
  cy.getFormInputFieldById('description').type(DESCRIPTION);
  cy.getFormFooterButtonByType(ADD_BUTTON_TEXT, 'submit').click();
  cy.wait('@addNamespaceApi');
}

function selectAccordionElement(accordionItemLabel) {
  const pathToTargetNode =
    accordionItemLabel === NAMESPACE_NAME
      ? [DOMAIN_NAME, NAMESPACE_NAME]
      : [DOMAIN_NAME];
  cy.interceptApi({
    alias: 'treeSelectApi',
    urlPattern: /\/miq_ae_class\/tree_select\?id=.*&text=.*/,
    triggerFn: () =>
      cy.selectAccordionItem([DATA_STORE_ACCORDION_LABEL, ...pathToTargetNode]),
  });
}

function validateNamespaceFormFields(isEditForm = false) {
  // Assert form header is visible
  cy.expect_explorer_title(NAMESPACE_FORM_HEADER);
  // Assert sub header is visible
  cy.get('#main-content #datastore-form-wrapper h3').contains(
    NAMESPACE_FORM_SUB_HEADER
  );
  // Assert name-space path field label is visible
  cy.getFormLabelByInputId('namespacePath').should('be.visible');
  // Assert name-space path field is visible and disabled
  cy.getFormInputFieldById('namespacePath')
    .should('be.visible')
    .and('be.disabled')
    .invoke('val')
    .should('include', DOMAIN_NAME);
  // Assert name field label is visible
  cy.getFormLabelByInputId('name').should('be.visible');
  // Assert name field is visible and enabled
  cy.getFormInputFieldById('name').should('be.visible').and('be.enabled');
  // Assert description field label is visible
  cy.getFormLabelByInputId('description').should('be.visible');
  // Assert description field is visible and enabled
  cy.getFormInputFieldById('description')
    .should('be.visible')
    .and('be.enabled');
  // Assert cancel button is visible and enabled
  cy.getFormFooterButtonByType(CANCEL_BUTTON_TEXT)
    .should('be.visible')
    .and('be.enabled');
  // Assert add/save button is visible and disabled
  cy.getFormFooterButtonByType(
    isEditForm ? SAVE_BUTTON_TEXT : ADD_BUTTON_TEXT,
    'submit'
  )
    .should('be.visible')
    .and('be.disabled');
  if (isEditForm) {
    // Assert reset button is visible and disabled
    cy.getFormFooterButtonByType(RESET_BUTTON_TEXT)
      .should('be.visible')
      .and('be.disabled');
  }
}

function createNamespaceAndOpenEditForm() {
  /* TODO: DATA_SETUP - Use API for namespace setup, excluding the test meant to validate functionality via UI */
  // Adding a new namespace
  addNamespace(NAMESPACE_NAME);
  // Selecting the created namespace from the accordion list items
  selectAccordionElement(NAMESPACE_NAME);
  // Opening the edit form
  cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_EDIT_NAMESPACE);
}

function extractDomainIdAndTokenFromResponse(interception) {
  const rawTreeObject = interception?.response?.body?.reloadTrees?.ae_tree;
  if (rawTreeObject) {
    const rawTreeParsed = JSON.parse(rawTreeObject);
    rawTreeParsed.every((treeObject) => {
      // Exit iteration once id is extracted from nodes array
      return treeObject?.nodes?.every((nodeObject) => {
        if (nodeObject?.text === DOMAIN_NAME) {
          const domainId = nodeObject?.key?.split('-')?.[1];
          const csrfToken = interception?.request?.headers?.['x-csrf-token'];
          const idAndToken = {
            domainId,
            csrfToken,
          };
          // Creating an aliased state to store id and token
          cy.wrap(idAndToken).as('idAndToken');

          // Stop iterating once the domain id is found
          return false;
        }
        // Continue iterating
        return true;
      });
    });
  }
}

describe('Automate operations on Namespaces: Automation -> Embedded Automate -> Explorer -> {Any-created-domain} -> Namespace form', () => {
  beforeEach(() => {
    cy.login();
    // Navigate to Explorer under Automation -> Embedded Automate
    cy.menu(
      AUTOMATION_MENU_OPTION,
      EMBEDDED_AUTOMATION_MENU_OPTION,
      EXPLORER_MENU_OPTION
    );
    // Expand "Datastore" accordion if not already expanded
    cy.accordion(DATA_STORE_ACCORDION_LABEL);
    /* TODO: DATA_SETUP - Refactor to use API for domain data setup */
    // Creating a domain to test namespace operations
    cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_ADD_NEW_DOMAIN);
    cy.getFormInputFieldById('name').type(DOMAIN_NAME);
    cy.getFormInputFieldById('description').type(DESCRIPTION);
    cy.intercept('POST', '/miq_ae_class/create_namespace/new?button=add').as(
      'addNamespaceApi'
    );
    cy.getFormFooterButtonByType(ADD_BUTTON_TEXT, 'submit').click();
    cy.wait('@addNamespaceApi').then((interception) => {
      extractDomainIdAndTokenFromResponse(interception);
    });
    cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_ADD_SUCCESS);
    // Selecting the created domain from the accordion list items
    selectAccordionElement(DOMAIN_NAME);
  });

  it('Validate Add Namespace form fields', () => {
    // Navigating to the Add Namespace form
    cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_ADD_NEW_NAMESPACE);

    // Validating the form fields
    validateNamespaceFormFields();

    // Cancelling the form
    cy.getFormFooterButtonByType(CANCEL_BUTTON_TEXT).click();
  });

  it('Validate Cancel button', () => {
    // Navigating to the Add Namespace form
    cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_ADD_NEW_NAMESPACE);

    // Cancelling the form
    cy.getFormFooterButtonByType(CANCEL_BUTTON_TEXT)
      .should('be.enabled')
      .click();
    cy.expect_flash(flashClassMap.warning, FLASH_MESSAGE_CANCELLED);
  });

  it('Validate Name field allows only alphanumeric and _ . - $ characters', () => {
    // Trying to add a namespace with invalid characters
    addNamespace(INVALID_NAMESPACE_NAME);
    cy.expect_flash(flashClassMap.error, FLASH_MESSAGE_INVALID_NAMESPACE);

    // Cancelling the form
    cy.getFormFooterButtonByType(CANCEL_BUTTON_TEXT).click();
  });

  it('Validate Edit Namespace form fields', () => {
    // Create a namespace and open the edit form
    createNamespaceAndOpenEditForm();

    // Validating the form fields
    validateNamespaceFormFields(true);

    // Cancelling the form
    cy.getFormFooterButtonByType(CANCEL_BUTTON_TEXT).click();
  });

  it('Checking whether add, edit & delete namespace works', () => {
    // Adding a new namespace
    addNamespace(NAMESPACE_NAME);
    cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_ADD_SUCCESS);

    // Selecting the created namespace from the accordion list items
    selectAccordionElement(NAMESPACE_NAME);
    // Editing the namespace
    cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_EDIT_NAMESPACE);
    // Checking if the Save button is disabled initially
    cy.getFormFooterButtonByType(SAVE_BUTTON_TEXT, 'submit').should(
      'be.disabled'
    );
    cy.getFormInputFieldById('description').clear().type(EDITED_DESCRIPTION);
    cy.getFormFooterButtonByType(SAVE_BUTTON_TEXT, 'submit')
      .should('be.enabled')
      .click();
    cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_SAVE_SUCCESS);

    // Deleting the namespace
    cy.expect_browser_confirm_with_text({
      confirmTriggerFn: () =>
        cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_REMOVE_NAMESPACE),
      containsText: BROWSER_CONFIRM_REMOVE_MESSAGE,
    });
    cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_NAMESPACE_REMOVED);
  });

  it('Checking whether creating a duplicate namespace is restricted', () => {
    /* TODO: DATA_SETUP - Use API for namespace setup, excluding the test meant to validate functionality via UI */
    // Adding a new namespace
    addNamespace(NAMESPACE_NAME);
    // Trying to add duplicate namespace
    addNamespace(NAMESPACE_NAME);
    cy.expect_flash(flashClassMap.error, FLASH_MESSAGE_NAME_ALREADY_EXISTS);

    // Cancelling the form
    cy.getFormFooterButtonByType(CANCEL_BUTTON_TEXT).click();
  });

  it('Checking whether Cancel & Reset buttons work fine in the Edit form', () => {
    // Create a namespace and open the edit form
    createNamespaceAndOpenEditForm();

    /* Validating Reset button */
    // Checking if the Reset button is disabled initially
    cy.getFormFooterButtonByType(RESET_BUTTON_TEXT).should('be.disabled');
    // Editing name and description fields
    cy.getFormInputFieldById('name').clear().type(EDITED_NAMESPACE_NAME);
    cy.getFormInputFieldById('description').clear().type(EDITED_DESCRIPTION);
    // Resetting
    cy.getFormFooterButtonByType(RESET_BUTTON_TEXT)
      .should('be.enabled')
      .click();
    cy.expect_flash(flashClassMap.warning, FLASH_MESSAGE_RESET_NAMESPACE);
    // Confirming the edited fields contain the old values after resetting
    cy.getFormInputFieldById('name').should('have.value', NAMESPACE_NAME);
    cy.getFormInputFieldById('description').should('have.value', DESCRIPTION);

    /* Validating Cancel button */
    cy.getFormFooterButtonByType(CANCEL_BUTTON_TEXT).click();
    cy.expect_flash(flashClassMap.warning, FLASH_MESSAGE_CANCELLED);
  });

  afterEach(() => {
    // retrieve the id and token from the aliased state
    // to invoke api for deleting the created domain
    cy.get('@idAndToken').then((data) => {
      const { domainId, csrfToken } = data;
      if (domainId && csrfToken) {
        cy.request({
          method: 'POST',
          url: `/miq_ae_class/x_button/${domainId}?pressed=miq_ae_domain_delete`,
          headers: {
            'X-CSRF-Token': csrfToken,
          },
        }).then((response) => {
          expect(response.status).to.eq(200);
        });
      }
    });
  });
});
