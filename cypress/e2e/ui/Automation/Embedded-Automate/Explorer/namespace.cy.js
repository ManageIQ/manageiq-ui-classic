/* eslint-disable no-undef */

const textConstants = {
  // Menu options
  automationMenuOption: 'Automation',
  embeddedAutomationMenuOption: 'Embedded Automate',
  explorerMenuOption: 'Explorer',

  // Toolbar options
  toolbarConfiguration: 'Configuration',
  toolbarAddNewDomain: 'Add a New Domain',
  toolbarRemoveDomain: 'Remove this Domain',
  toolbarAddNewNamespace: 'Add a New Namespace',
  toolbarEditNamespace: 'Edit this Namespace',
  toolbarRemoveNamespace: 'Remove this Namespace',

  // Field values
  domainName: 'Test_Domain',
  description: 'Test description',
  namespaceName: 'Test_Namespace',
  editedNamespaceName: 'Test_Namespace_Edited',
  editedDescription: 'Test description edited',
  invalidNamespaceName: 'Test Namespace',

  // List items
  dataStoreAccordionItem: 'Datastore',

  // Buttons
  addButton: 'Add',
  cancelButton: 'Cancel',
  saveButton: 'Save',
  resetButton: 'Reset',

  // Flash message types
  flashTypeSuccess: 'success',
  flashTypeWarning: 'warning',
  flashTypeError: 'error',

  // Flash message text snippets
  flashMessageAddSuccess: 'added',
  flashMessageSaveSuccess: 'saved',
  flashMessageCancelled: 'cancelled',
  flashMessageInvalidNamespace: 'contain only alphanumeric',
  flashMessageNamespaceRemoved: 'delete successful',
  flashMessageNameAlreadyExists: 'taken',
  flashMessageResetNamespace: 'reset',
  browserConfirmRemoveMessage: 'remove',
};

const {
  automationMenuOption,
  embeddedAutomationMenuOption,
  explorerMenuOption,
  addButton,
  cancelButton,
  resetButton,
  saveButton,
  domainName,
  description,
  toolbarConfiguration,
  toolbarAddNewDomain,
  toolbarAddNewNamespace,
  toolbarEditNamespace,
  toolbarRemoveNamespace,
  toolbarRemoveDomain,
  namespaceName,
  editedNamespaceName,
  editedDescription,
  invalidNamespaceName,
  flashTypeError,
  flashTypeSuccess,
  flashTypeWarning,
  flashMessageAddSuccess,
  flashMessageSaveSuccess,
  flashMessageCancelled,
  flashMessageNamespaceRemoved,
  flashMessageInvalidNamespace,
  flashMessageNameAlreadyExists,
  flashMessageResetNamespace,
  browserConfirmRemoveMessage,
  dataStoreAccordionItem,
} = textConstants;

function addNamespace(nameFieldValue = namespaceName) {
  // Navigating to the Add Namespace form
  cy.toolbar(toolbarConfiguration, toolbarAddNewNamespace);
  // Creating a new namespace
  cy.get('#datastore-form-wrapper input#name').type(nameFieldValue);
  cy.get('#datastore-form-wrapper input#description').type(description);
  cy.get('#main-content .bx--btn-set button[type="submit"]')
    .contains(addButton)
    .click();
  cy.wait('@addNamespaceApi');
}

function interceptAccordionApi(textValue = namespaceName) {
  const aliasObject = {
    [domainName]: 'getCreatedDomainInfo',
    [namespaceName]: 'getCreatedNamespaceInfo',
    [dataStoreAccordionItem]: 'getDataStoreAccordionItemInfo',
  };
  cy.intercept(
    'POST',
    new RegExp(`/miq_ae_class/tree_select\\?id=.*&text=${textValue}`)
  ).as(aliasObject[textValue]);
  cy.accordionItem(textValue);
  cy.wait(`@${aliasObject[textValue]}`);
}

describe('Automate operations on Namespaces: Automation -> Embedded Automate -> Explorer -> {Any-created-domain} -> Namespace form', () => {
  beforeEach(() => {
    cy.login();
    cy.menu(
      automationMenuOption,
      embeddedAutomationMenuOption,
      explorerMenuOption
    );
    // Creating a domain to test namespace operations
    cy.toolbar(toolbarConfiguration, toolbarAddNewDomain);
    cy.get('#datastore-form-wrapper input#name').type(domainName);
    cy.get('#datastore-form-wrapper input#description').type(description);
    cy.intercept('POST', '/miq_ae_class/create_namespace/new?button=add').as(
      'addNamespaceApi'
    );
    cy.get('#main-content .bx--btn-set button[type="submit"]')
      .contains(addButton)
      .click();
    cy.wait('@addNamespaceApi');
    cy.expect_flash(flashTypeSuccess, flashMessageAddSuccess);
    // Selecting the created domain from the accordion list items
    interceptAccordionApi(domainName);
  });

  it('Validate Cancel button', () => {
    cy.toolbar(toolbarConfiguration, toolbarAddNewNamespace);
    // Cancelling the form
    cy.get('#main-content .bx--btn-set button[type="button"]')
      .contains(cancelButton)
      .should('be.enabled')
      .click();
    cy.expect_flash(flashTypeWarning, flashMessageCancelled);
  });

  it('Validate Name field allows only alphanumeric and _ . - $ characters', () => {
    // Trying to add a namespace with invalid characters
    addNamespace(invalidNamespaceName);
    cy.expect_flash(flashTypeError, flashMessageInvalidNamespace);
    // Cancelling the form
    cy.get('#main-content .bx--btn-set button[type="button"]')
      .contains(cancelButton)
      .click();
  });

  it('Checking whether add, edit & delete namespace works', () => {
    // Adding a new namespace
    addNamespace();
    cy.expect_flash(flashTypeSuccess, flashMessageAddSuccess);

    // Selecting the created namespace from the accordion list items
    interceptAccordionApi();
    // Editing the namespace
    cy.toolbar(toolbarConfiguration, toolbarEditNamespace);
    // Checking if the Save button is disabled initially
    cy.get('#main-content .bx--btn-set button[type="submit"]')
      .contains(saveButton)
      .should('be.disabled');
    cy.get('#datastore-form-wrapper input#description')
      .clear()
      .type(editedDescription);
    cy.get('#main-content .bx--btn-set button[type="submit"]')
      .contains(saveButton)
      .should('be.enabled')
      .click();
    cy.expect_flash(flashTypeSuccess, flashMessageSaveSuccess);

    // Deleting the namespace
    cy.expect_browser_confirm_with_text({
      confirmTriggerFn: () =>
        cy.toolbar(toolbarConfiguration, toolbarRemoveNamespace),
      containsText: browserConfirmRemoveMessage,
    });
    cy.expect_flash(flashTypeSuccess, flashMessageNamespaceRemoved);
  });

  it('Checking whether creating a duplicate namespace is restricted', () => {
    // Adding a new namespace
    addNamespace();
    // Trying to add duplicate namespace
    addNamespace();
    cy.expect_flash(flashTypeError, flashMessageNameAlreadyExists);

    // Cancelling the form
    cy.get('#main-content .bx--btn-set button[type="button"]')
      .contains(cancelButton)
      .click();
  });

  it('Checking whether Cancel & Reset buttons work fine in the Edit form', () => {
    // Adding a new namespace
    addNamespace();
    // Selecting the created namespace from the accordion list items
    interceptAccordionApi();
    // Opening the edit form
    cy.toolbar(toolbarConfiguration, toolbarEditNamespace);

    /* Validating Reset button */
    // Checking if the Reset button is disabled initially
    cy.get('#main-content .bx--btn-set button[type="button"]')
      .contains(resetButton)
      .should('be.disabled');
    // Editing name and description fields
    cy.get('#datastore-form-wrapper input#name')
      .clear()
      .type(editedNamespaceName);
    cy.get('#datastore-form-wrapper input#description')
      .clear()
      .type(editedDescription);
    // Resetting
    cy.get('#main-content .bx--btn-set button[type="button"]')
      .contains(resetButton)
      .should('be.enabled')
      .click();
    cy.expect_flash(flashTypeWarning, flashMessageResetNamespace);
    // Confirming the edited fields contain the old values after resetting
    cy.get('#datastore-form-wrapper input#name').should(
      'have.value',
      namespaceName
    );
    cy.get('#datastore-form-wrapper input#description').should(
      'have.value',
      description
    );

    /* Validating Cancel button */
    cy.get('#main-content .bx--btn-set button[type="button"]')
      .contains(cancelButton)
      .click();
    cy.expect_flash(flashTypeWarning, flashMessageCancelled);
  });

  afterEach(() => {
    // Selecting the created domain(Test_Domain) from the accordion list items
    interceptAccordionApi(dataStoreAccordionItem);
    cy.accordionItem(domainName);
    cy.wait('@getCreatedDomainInfo');
    // Removing the domain
    cy.expect_browser_confirm_with_text({
      confirmTriggerFn: () =>
        cy.toolbar(toolbarConfiguration, toolbarRemoveDomain),
      containsText: browserConfirmRemoveMessage,
    });
  });
});
