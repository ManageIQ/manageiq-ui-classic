/* eslint-disable no-undef */

const textConstants = {
  // Menu options
  automationMenuOption: 'Automation',
  embeddedAutomationMenuOption: 'Embedded Automate',
  explorerMenuOption: 'Explorer',

  // Toolbar options
  toolbarConfiguration: 'Configuration',
  toolbarAddNewDomain: 'Add a New Domain',
  toolbarAddNewNamespace: 'Add a New Namespace',
  toolbarEditNamespace: 'Edit this Namespace',
  toolbarRemoveNamespace: 'Remove this Namespace',

  // Common selectors
  inputFieldSelector: (inputId) =>
    `#main-content #datastore-form-wrapper input#${inputId}`,
  buttonSelector: (type) => `#main-content .bx--btn-set button[type="${type}"]`,
  inputFieldLabelSelector: (forValue) =>
    `#main-content #datastore-form-wrapper label[for="${forValue}"]`,

  // Element ids
  nameInputFieldId: 'name',
  descriptionInputFieldId: 'description',
  namespacePathInputFieldId: 'namespacePath',

  // Button types
  submitButtonType: 'submit',
  normalButtonType: 'button',

  // Field values
  domainName: 'Test_Domain',
  description: 'Test description',
  namespaceName: 'Test_Namespace',
  editedNamespaceName: 'Test_Namespace_Edited',
  editedDescription: 'Test description edited',
  invalidNamespaceName: 'Test Namespace',
  namespaceFormHeader: 'Automate Namespace',
  namespaceFormSubHeader: 'Info',

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
  flashMessageCancelled: 'cancel',
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
  inputFieldSelector,
  buttonSelector,
  inputFieldLabelSelector,
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
  namespaceFormHeader,
  namespaceFormSubHeader,
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
  nameInputFieldId,
  descriptionInputFieldId,
  namespacePathInputFieldId,
  submitButtonType,
  normalButtonType,
} = textConstants;

function addNamespace(nameFieldValue = namespaceName) {
  // Navigating to the Add Namespace form
  cy.toolbar(toolbarConfiguration, toolbarAddNewNamespace);
  // Creating a new namespace
  cy.get(inputFieldSelector(nameInputFieldId)).type(nameFieldValue);
  cy.get(inputFieldSelector(descriptionInputFieldId)).type(description);
  cy.contains(buttonSelector(submitButtonType), addButton).click();
  cy.wait('@addNamespaceApi');
}

function selectAccordionTree(textValue) {
  const aliasObject = {
    [domainName]: 'getCreatedDomainInfo',
    [namespaceName]: 'getCreatedNamespaceInfo',
  };
  cy.intercept(
    'POST',
    new RegExp(`/miq_ae_class/tree_select\\?id=.*&text=${textValue}`)
  ).as(aliasObject[textValue]);
  // Datastore is already set in the tree path, add domain/namespace to the path
  const pathToTargetNode =
    textValue === namespaceName ? [domainName, namespaceName] : [domainName];
  cy.selectAccordionItem([dataStoreAccordionItem, ...pathToTargetNode]);
  cy.wait(`@${aliasObject[textValue]}`);
}

function validateNamespaceFormFields(isEditForm = false) {
  // Assert form header is visible
  cy.expect_explorer_title(namespaceFormHeader);
  // Assert sub header is visible
  cy.get('#main-content #datastore-form-wrapper h3').contains(
    namespaceFormSubHeader
  );
  // Assert name-space path field label is visible
  cy.get(inputFieldLabelSelector(namespacePathInputFieldId)).should(
    'be.visible'
  );
  // Assert name-space path field is visible and disabled
  cy.get(inputFieldSelector(namespacePathInputFieldId))
    .should('be.visible')
    .and('be.disabled')
    .invoke('val')
    .should('include', domainName);
  // Assert name field label is visible
  cy.get(inputFieldLabelSelector(nameInputFieldId)).should('be.visible');
  // Assert name field is visible and enabled
  cy.get(inputFieldSelector(nameInputFieldId))
    .should('be.visible')
    .and('be.enabled');
  // Assert description field label is visible
  cy.get(inputFieldLabelSelector(descriptionInputFieldId)).should('be.visible');
  // Assert description field is visible and enabled
  cy.get(inputFieldSelector(descriptionInputFieldId))
    .should('be.visible')
    .and('be.enabled');
  // Assert cancel button is visible and enabled
  cy.contains(buttonSelector(normalButtonType), cancelButton)
    .should('be.visible')
    .and('be.enabled');
  // Assert add/save button is visible and disabled
  cy.contains(
    buttonSelector(submitButtonType),
    isEditForm ? saveButton : addButton
  )
    .should('be.visible')
    .and('be.disabled');
  if (isEditForm) {
    // Assert reset button is visible and disabled
    cy.contains(buttonSelector(normalButtonType), resetButton)
      .should('be.visible')
      .and('be.disabled');
  }
}

function createNamespaceAndOpenEditForm() {
  /* TODO: DATA_SETUP - Use API for namespace setup, excluding the test meant to validate functionality via UI */
  // Adding a new namespace
  addNamespace();
  // Selecting the created namespace from the accordion list items
  selectAccordionTree(namespaceName);
  // Opening the edit form
  cy.toolbar(toolbarConfiguration, toolbarEditNamespace);
}

function extractDomainIdAndTokenFromResponse(interception) {
  const rawTreeObject = interception?.response?.body?.reloadTrees?.ae_tree;
  if (rawTreeObject) {
    const rawTreeParsed = JSON.parse(rawTreeObject);
    rawTreeParsed.every((treeObject) => {
      // Exit iteration once id is extracted from nodes array
      return treeObject?.nodes?.every((nodeObject) => {
        if (nodeObject?.text === domainName) {
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
    cy.menu(
      automationMenuOption,
      embeddedAutomationMenuOption,
      explorerMenuOption
    );
    /* TODO: DATA_SETUP - Refactor to use API for domain data setup */
    // Creating a domain to test namespace operations
    cy.toolbar(toolbarConfiguration, toolbarAddNewDomain);
    cy.get(inputFieldSelector(nameInputFieldId)).type(domainName);
    cy.get(inputFieldSelector(descriptionInputFieldId)).type(description);
    cy.intercept('POST', '/miq_ae_class/create_namespace/new?button=add').as(
      'addNamespaceApi'
    );
    cy.contains(buttonSelector(submitButtonType), addButton).click();
    cy.wait('@addNamespaceApi').then((interception) => {
      extractDomainIdAndTokenFromResponse(interception);
    });
    cy.expect_flash(flashTypeSuccess, flashMessageAddSuccess);
    // Selecting the created domain from the accordion list items
    selectAccordionTree(domainName);
  });

  it('Validate Add Namespace form fields', () => {
    // Navigating to the Add Namespace form
    cy.toolbar(toolbarConfiguration, toolbarAddNewNamespace);

    // Validating the form fields
    validateNamespaceFormFields();

    // Cancelling the form
    cy.contains(buttonSelector(normalButtonType), cancelButton).click();
  });

  it('Validate Cancel button', () => {
    // Navigating to the Add Namespace form
    cy.toolbar(toolbarConfiguration, toolbarAddNewNamespace);

    // Cancelling the form
    cy.contains(buttonSelector(normalButtonType), cancelButton)
      .should('be.enabled')
      .click();
    cy.expect_flash(flashTypeWarning, flashMessageCancelled);
  });

  it('Validate Name field allows only alphanumeric and _ . - $ characters', () => {
    // Trying to add a namespace with invalid characters
    addNamespace(invalidNamespaceName);
    cy.expect_flash(flashTypeError, flashMessageInvalidNamespace);

    // Cancelling the form
    cy.contains(buttonSelector(normalButtonType), cancelButton).click();
  });

  it('Validate Edit Namespace form fields', () => {
    // Create a namespace and open the edit form
    createNamespaceAndOpenEditForm();

    // Validating the form fields
    validateNamespaceFormFields(true);

    // Cancelling the form
    cy.contains(buttonSelector(normalButtonType), cancelButton).click();
  });

  it('Checking whether add, edit & delete namespace works', () => {
    // Adding a new namespace
    addNamespace();
    cy.expect_flash(flashTypeSuccess, flashMessageAddSuccess);

    // Selecting the created namespace from the accordion list items
    selectAccordionTree(namespaceName);
    // Editing the namespace
    cy.toolbar(toolbarConfiguration, toolbarEditNamespace);
    // Checking if the Save button is disabled initially
    cy.contains(buttonSelector(submitButtonType), saveButton).should(
      'be.disabled'
    );
    cy.get(inputFieldSelector(descriptionInputFieldId))
      .clear()
      .type(editedDescription);
    cy.contains(buttonSelector(submitButtonType), saveButton)
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
    /* TODO: DATA_SETUP - Use API for namespace setup, excluding the test meant to validate functionality via UI */
    // Adding a new namespace
    addNamespace();
    // Trying to add duplicate namespace
    addNamespace();
    cy.expect_flash(flashTypeError, flashMessageNameAlreadyExists);

    // Cancelling the form
    cy.contains(buttonSelector(normalButtonType), cancelButton).click();
  });

  it('Checking whether Cancel & Reset buttons work fine in the Edit form', () => {
    // Create a namespace and open the edit form
    createNamespaceAndOpenEditForm();

    /* Validating Reset button */
    // Checking if the Reset button is disabled initially
    cy.contains(buttonSelector(normalButtonType), resetButton).should(
      'be.disabled'
    );
    // Editing name and description fields
    cy.get(inputFieldSelector(nameInputFieldId))
      .clear()
      .type(editedNamespaceName);
    cy.get(inputFieldSelector(descriptionInputFieldId))
      .clear()
      .type(editedDescription);
    // Resetting
    cy.contains(buttonSelector(normalButtonType), resetButton)
      .should('be.enabled')
      .click();
    cy.expect_flash(flashTypeWarning, flashMessageResetNamespace);
    // Confirming the edited fields contain the old values after resetting
    cy.get(inputFieldSelector(nameInputFieldId)).should(
      'have.value',
      namespaceName
    );
    cy.get(inputFieldSelector(descriptionInputFieldId)).should(
      'have.value',
      description
    );

    /* Validating Cancel button */
    cy.contains(buttonSelector(normalButtonType), cancelButton).click();
    cy.expect_flash(flashTypeWarning, flashMessageCancelled);
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
