/* eslint-disable no-undef */
import { flashClassMap } from '../../../../support/assertions/assertion_constants';

const textConstants = {
  // Component route url
  componentRouteUrl: '/ops/explorer',

  // Menu options
  settingsMenuOption: 'Settings',
  appSettingsMenuOption: 'Application Settings',

  // Accordion items
  accessControlAccordionItem: 'Access Control',
  accessControlAccordionItemId: 'rbac_accord',
  manageIQRegionAccordItem: /^ManageIQ Region:/,
  tenantsAccordionItem: 'Tenants',

  // Field values
  formHeaderFragment: 'Tenant',
  initialParentTenantName: 'My Company',
  initialParentTenantDescription: 'Tenant for My Company',
  editedTenantNameValue: 'Test-Name',
  editedDescriptionValue: 'Test-Description',
  projectNameValue: 'Test-Project',
  initialChildTenantName: 'Child-Tenant',
  initialChildTenantDescription: 'Child Tenant description',

  // Button types
  submitButtonType: 'submit',
  resetButtonType: 'reset',

  // Element ids
  nameInputFieldId: 'name',
  descriptionInputFieldId: 'description',

  // Config options
  configToolbarButton: 'Configuration',
  editTenantConfigOption: 'Edit this item',
  addProjectConfigOption: 'Add Project to this Tenant',
  deleteItemConfigOption: 'Delete this item',
  manageQuotasConfigOption: 'Manage Quotas',
  addChildTenantConfigOption: 'Add child Tenant to this Tenant',

  // Quota Descriptions
  allocatedStorageQuota: 'Allocated Storage in GB',
  allocatedVmQuota: 'Allocated Number of Virtual Machines',

  // Buttons
  saveButton: 'Save',
  cancelButton: 'Cancel',
  resetButton: 'Reset',
  addButton: 'Add',

  // Flash message text snippets
  flashMessageOperationCanceled: 'cancel',
  flashMessageOperationReset: 'reset',
  flashMessageSaved: 'saved',
  flashMessageAdded: 'added',
  flashMessageCantDelete: 'cannot delete',
  browserAlertDeleteConfirmText: 'delete',
  nameAlreadyTakenError: 'taken',
};

const {
  // Component route url
  componentRouteUrl,

  // Menu options
  settingsMenuOption,
  appSettingsMenuOption,

  // Accordion items
  accessControlAccordionItem,
  accessControlAccordionItemId,
  manageIQRegionAccordItem,
  tenantsAccordionItem,

  // Field values
  formHeaderFragment,
  initialParentTenantName,
  initialParentTenantDescription,
  editedTenantNameValue,
  editedDescriptionValue,
  projectNameValue,
  initialChildTenantName,
  initialChildTenantDescription,

  // Element ids
  nameInputFieldId,
  descriptionInputFieldId,

  // Config options
  configToolbarButton,
  editTenantConfigOption,
  addProjectConfigOption,
  deleteItemConfigOption,
  manageQuotasConfigOption,
  addChildTenantConfigOption,

  // Quota Descriptions
  allocatedStorageQuota,
  allocatedVmQuota,

  // Buttons
  saveButton,
  cancelButton,
  resetButton,
  addButton,

  // Flash message text snippets
  flashMessageOperationCanceled,
  flashMessageOperationReset,
  flashMessageSaved,
  flashMessageAdded,
  flashMessageCantDelete,
  browserAlertDeleteConfirmText,
  nameAlreadyTakenError,
} = textConstants;

function confirmUiNavigation(callback) {
  cy.url()
    ?.then((url) => {
      // Ensures navigation to Settings -> Application-Settings in the UI
      if (!url?.includes(componentRouteUrl)) {
        // Navigate to Settings -> Application-Settings before looking out for parent Tenants edited during test
        cy.menu(settingsMenuOption, appSettingsMenuOption);
      }
    })
    .then(() => {
      callback();
    });
}

function cancelForm(
  assertFlashMessage = true,
  flashMessageSnippet = flashMessageOperationCanceled
) {
  cy.getFormFooterButtonByType(cancelButton).click();
  if (assertFlashMessage) {
    cy.expect_flash(flashClassMap.warning, flashMessageSnippet);
  }
}

function resetForm(buttonType = 'reset') {
  cy.getFormFooterButtonByType(resetButton, buttonType)
    .should('be.enabled')
    .click();
  cy.expect_flash(flashClassMap.warning, flashMessageOperationReset);
}

function saveForm({
  assertFlashMessage = true,
  button = saveButton,
  flashMessageSnippet = flashMessageSaved,
} = {}) {
  cy.getFormFooterButtonByType(button, 'submit').should('be.enabled').click();
  if (assertFlashMessage) {
    cy.expect_flash(flashClassMap.success, flashMessageSnippet);
  }
}

function updateNameAndDescription(nameValue, descriptionValue) {
  cy.getFormInputFieldById(nameInputFieldId).clear().type(nameValue);
  cy.getFormInputFieldById(descriptionInputFieldId)
    .clear()
    .type(descriptionValue);
}

function verifyNameAndDescriptionValues(nameValue, descriptionValue) {
  cy.getFormInputFieldById(nameInputFieldId).should('have.value', nameValue);
  cy.getFormInputFieldById(descriptionInputFieldId).should(
    'have.value',
    descriptionValue
  );
}

function validateFormElements(isEditForm = true) {
  // Assert form header is visible
  cy.expect_explorer_title(formHeaderFragment);
  // Assert name field label is visible
  cy.getFormLabelByInputId(nameInputFieldId).should('be.visible');
  // Assert name field is visible and enabled
  cy.getFormInputFieldById(nameInputFieldId)
    .should('be.visible')
    .and('be.enabled');
  // Assert description field label is visible
  cy.getFormLabelByInputId(descriptionInputFieldId).should('be.visible');
  // Assert description field is visible and enabled
  cy.getFormInputFieldById(descriptionInputFieldId)
    .should('be.visible')
    .and('be.enabled');
  // Assert cancel button is visible and enabled
  cy.getFormFooterButtonByType(cancelButton)
    .should('be.visible')
    .and('be.enabled');
  if (isEditForm) {
    // Assert reset button is visible and disabled
    cy.getFormFooterButtonByType(resetButton)
      .should('be.visible')
      .and('be.disabled');
  }
  // Assert add/save button is visible and disabled
  cy.getFormFooterButtonByType(isEditForm ? saveButton : addButton, 'submit')
    .should('be.visible')
    .and('be.disabled');
}

function createAndSelectChildTenant() {
  // Open child tenant create form
  cy.toolbar(configToolbarButton, addChildTenantConfigOption);
  // Add name & description
  updateNameAndDescription(
    initialChildTenantName,
    initialChildTenantDescription
  );
  // Save the form
  saveForm({
    button: addButton,
    flashMessageSnippet: flashMessageAdded,
  });
  // Select the created child tenant accordion item
  // TODO: Replace with cy.interceptApi after it's enhanced to wait conditionally on request trigger
  cy.selectAccordionItem([
    manageIQRegionAccordItem,
    tenantsAccordionItem,
    initialParentTenantName,
    initialChildTenantName,
  ]);
  cy.wait('@treeSelectApi');
}

function resetParentTenantForm() {
  cy.get(`#${accessControlAccordionItemId} li.list-group-item`).each((item) => {
    const text = item?.text()?.trim();
    // Check if the text matches the edited parent tenant name, if yes reset
    if (text === editedTenantNameValue) {
      cy.wrap(item).click();
      // Open the tenant edit form
      cy.toolbar(configToolbarButton, editTenantConfigOption);
      // Reset name & description to old values
      updateNameAndDescription(
        initialParentTenantName,
        initialParentTenantDescription
      );
      // Save the form
      saveForm({ assertFlashMessage: false });

      // Exit the loop
      return false;
    }
    // Returning null to get rid of eslint warning, has no impact
    return null;
  });
}

function deleteAccordionItem(accordionToDelete) {
  cy.get(`#${accessControlAccordionItemId} li.list-group-item`).each((item) => {
    const text = item?.text()?.trim();
    // Check if the text matches the project name created during test, if yes delete
    if (text === accordionToDelete) {
      cy.wrap(item).click({ force: true });
      cy.interceptApi({
        alias: 'deleteAccordionApi',
        urlPattern: /\/ops\/x_button\/[^/]+\?pressed=rbac_tenant_delete/,
        triggerFn: () =>
          cy.expect_browser_confirm_with_text({
            confirmTriggerFn: () =>
              cy.toolbar(configToolbarButton, deleteItemConfigOption),
            containsText: browserAlertDeleteConfirmText,
          }),
      });
      // Break the loop
      return false;
    }
    // Returning null to get rid of eslint warning, has no impact
    return null;
  });
}

function addProjectToTenant() {
  // Open the Add Project form
  cy.toolbar(configToolbarButton, addProjectConfigOption);
  // Add name & description
  updateNameAndDescription(projectNameValue, editedDescriptionValue);
  // Save the form
  saveForm({ button: addButton, flashMessageSnippet: flashMessageAdded });
}

function editQuotasTable(quotaName = allocatedStorageQuota, quotaValue) {
  cy.get('#rbac_details .miq-data-table table tbody tr').each((row) => {
    if (
      row
        .find('td span.bx--front-line')
        .filter((_ind, el) => el.innerText.trim() === quotaName).length
    ) {
      // Toggle the switch to enable the quota - "Allocated Storage in GB"
      cy.wrap(row).find('span.bx--toggle__switch').click();

      // Focusing the quota input field when necessary
      if (quotaValue) {
        cy.wrap(row)
          .find('div.bx--text-input-wrapper input')
          .clear()
          .type(quotaValue);
      }
      // Exit loop
      return false;
    }
    // Returning null to get rid of eslint warning, has no impact
    return null;
  });
}

function rollbackQuotas() {
  cy.toolbar(configToolbarButton, manageQuotasConfigOption);
  let quotaDisabled = false;
  cy.get('#rbac_details .miq-data-table table tbody tr').each((row) => {
    const quotaValueInputWrapper = row.find('div.bx--text-input-wrapper');
    // If the quota value input wrapper DOES NOT have the '-readonly' class, it's enabled
    const isEnabled = !quotaValueInputWrapper.hasClass(
      'bx--text-input-wrapper--readonly'
    );
    if (isEnabled) {
      quotaDisabled = true;
      // Toggle the switch to disable the quota
      cy.wrap(row).find('span.bx--toggle__switch').click();
    }
  });
  // Save the form if any quotas have been reverted to disabled.
  cy.then(() => {
    if (quotaDisabled) {
      // Saving the form
      cy.getFormFooterButtonByType(saveButton, 'submit').click();
    }
  });
}

describe('Automate Tenant form operations: Settings > Application Settings > Access Control > Tenants', () => {
  beforeEach(() => {
    cy.login();
    // Navigate to Settings -> Application-Settings in the UI
    cy.menu(settingsMenuOption, appSettingsMenuOption);
    // Expand Access-Control accordion
    cy.interceptApi({
      alias: 'accordionSelectApi',
      urlPattern: /\/ops\/accordion_select\?id=.*/,
      triggerFn: () => cy.accordion(accessControlAccordionItem),
    });

    // Select the existing parent tenant accordion item named "My Company"
    // TODO: Replace with cy.interceptApi after it's enhanced to wait conditionally on request trigger
    let requestFired = false;
    cy.intercept(
      'POST',
      /\/ops\/tree_select\?id=.*&text=.*/,
      () => (requestFired = true)
    ).as('treeSelectApi');
    cy.selectAccordionItem([
      manageIQRegionAccordItem,
      tenantsAccordionItem,
      initialParentTenantName,
    ]);
    cy.then(() => {
      // If the request was fired, wait for the alias
      if (requestFired) {
        cy.wait('@treeSelectApi');
      }
    });
  });

  describe('Validate Parent Tenant operations: Edit, Add Project, Manage Quotas', () => {
    describe('Validate Edit parent tenant', () => {
      beforeEach(() => {
        // Open the tenant edit form
        cy.toolbar(configToolbarButton, editTenantConfigOption);
      });

      it('Validate Edit tenant form elements', () => {
        // Validate form fields
        validateFormElements();
      });

      it('Validate Reset & Cancel buttons on Edit tenant form', () => {
        // Update name & description fields
        updateNameAndDescription(editedTenantNameValue, editedDescriptionValue);
        // Reset the form
        resetForm('button');
        // Confirm name and description has old values
        verifyNameAndDescriptionValues(
          initialParentTenantName,
          initialParentTenantDescription
        );
        // Cancel the edit form
        cancelForm();
      });

      it('Validate Edit function', () => {
        // Edit name & description
        updateNameAndDescription(editedTenantNameValue, editedDescriptionValue);
        // Save the form
        saveForm();
      });

      afterEach(() => {
        confirmUiNavigation(() => resetParentTenantForm());
      });
    });

    describe('Validate Add Project to parent tenant', () => {
      it('Validate Add Project function', () => {
        // Add Project to the parent tenant
        addProjectToTenant();
      });

      afterEach(() => {
        confirmUiNavigation(() => deleteAccordionItem(projectNameValue));
      });
    });

    describe('Validate Manage Quotas in parent tenant', () => {
      beforeEach(() => {
        // Open the Manage Quotas form
        cy.toolbar(configToolbarButton, manageQuotasConfigOption);
      });

      it('Validate Reset & Cancel buttons in Manage Quotas form', () => {
        // Check if Reset button is disabled initially
        cy.getFormFooterButtonByType(resetButton, 'reset').should(
          'be.disabled'
        );
        // Editing the quota table
        editQuotasTable(allocatedStorageQuota);
        // Reset the form
        resetForm();

        // Cancel the Manage Quotas form
        cancelForm();
      });

      it('Validate Manage Quotas function', () => {
        // Enabling the quota: "Allocated Storage in GB" with value 10
        editQuotasTable(allocatedStorageQuota, '10');
        // Saving the form
        saveForm();
      });

      afterEach(() => {
        // Resetting the quotas back to all disabled state
        confirmUiNavigation(() => rollbackQuotas());
      });
    });
  });

  describe('Validate Child Tenant operations: Add, Edit, Add Project, Manage Quotas', () => {
    describe('Validate Add child tenant function', () => {
      beforeEach(() => {
        // Open the Add child tenant form
        cy.toolbar(configToolbarButton, addChildTenantConfigOption);
      });

      it('Validate Add child tenant form elements and cancel operation', () => {
        // Validate form fields
        validateFormElements(false);
        // Cancel the add child tenant form
        cancelForm();
      });

      it('Validate Add & Delete child tenant', () => {
        // Add name & description
        updateNameAndDescription(
          initialChildTenantName,
          initialChildTenantDescription
        );
        // Save the form
        saveForm({ button: addButton, flashMessageSnippet: flashMessageAdded });
        // Delete the created child tenant
        deleteAccordionItem(initialChildTenantName);
        // TODO: add flash message assertion once delete issue is fixed: https://github.com/ManageIQ/manageiq-ui-classic/issues/9512
      });

      it('Validate Adding a duplicate child tenant is restricted', () => {
        // Add name & description
        updateNameAndDescription(
          initialChildTenantName,
          initialChildTenantDescription
        );
        // Save the form
        saveForm({
          assertFlashMessage: false,
          button: addButton,
          flashMessageSnippet: flashMessageAdded,
        });

        // Open the Add child tenant form again
        cy.toolbar(configToolbarButton, addChildTenantConfigOption);
        // Trying to add a child tenant with the same name
        cy.getFormInputFieldById(nameInputFieldId).type(initialChildTenantName);
        cy.get('#rbac_details #name-error-msg').contains(nameAlreadyTakenError);
        // Cancel the add form
        cancelForm(false);
      });

      // TODO: Switch to afterEach once tenant deletion is fixed: https://github.com/ManageIQ/manageiq-ui-classic/issues/9512
      after(() => {
        // Deleting the child tenant
        confirmUiNavigation(() => deleteAccordionItem(initialChildTenantName));
      });
    });

    describe('Validate Edit child tenant', () => {
      beforeEach(() => {
        // Adding a child tenant first and then selecting it
        createAndSelectChildTenant();
        // Open the child tenant edit form
        cy.toolbar(configToolbarButton, editTenantConfigOption);
      });

      it('Validate Edit child tenant form elements', () => {
        // Validate form fields
        validateFormElements();
        // Cancel the edit form
        cancelForm();
        // Removing the child tenant
        deleteAccordionItem(initialChildTenantName);
      });

      it('Validate Reset & Cancel buttons on the Edit child tenent form', () => {
        // Update name & description fields
        updateNameAndDescription(editedTenantNameValue, editedDescriptionValue);
        // Reset the form
        resetForm('button');
        // Confirm name and description has old values
        verifyNameAndDescriptionValues(
          initialChildTenantName,
          initialChildTenantDescription
        );
        // Cancel the edit form
        cancelForm();
        // Removing the child tenant
        deleteAccordionItem(initialChildTenantName);
      });

      it('Validate Edit function', () => {
        // Add name & description
        updateNameAndDescription(editedTenantNameValue, editedDescriptionValue);
        // Save the form
        saveForm();
        // Removing the edited child tenant
        deleteAccordionItem(editedTenantNameValue);
      });
    });

    describe('Validate Add Project to child tenant', () => {
      beforeEach(() => {
        // Adding a child tenant first and then selecting it
        createAndSelectChildTenant();
      });

      it('Validate Add Project function', () => {
        // Adding a project to the child tenant
        addProjectToTenant();
      });

      it('Validate Removing a child tenant with a project is restricted', () => {
        // Adding a project to the child tenant
        addProjectToTenant();
        // Attempting to delete the child tenant
        deleteAccordionItem(initialChildTenantName);
        // Expecting a flash error message
        cy.expect_flash(flashClassMap.error, flashMessageCantDelete);
      });

      afterEach(() => {
        confirmUiNavigation(() => {
          // Delete the created project
          deleteAccordionItem(projectNameValue);
          // add test to validate if removing child tenant with project throws error

          /* TODO: Remove this block once the delete issue is fixed: https://github.com/ManageIQ/manageiq-ui-classic/issues/9512 */
          /* --------------------------------------------------------- */
          // Closing the error modal
          cy.get('.error-modal-miq .modal-header button.close').click();
          /* --------------------------------------------------------- */

          // Delete the child tenant
          deleteAccordionItem(initialChildTenantName);
        });
      });
    });

    describe('Validate Manage Quotas in child tenant', () => {
      beforeEach(() => {
        // Adding a child tenant first and then selecting it
        createAndSelectChildTenant();
        // Open the Manage Quotas form
        cy.toolbar(configToolbarButton, manageQuotasConfigOption);
      });

      it('Validate Reset & Cancel buttons in Manage Quotas form', () => {
        // Check if Reset button is disabled initially
        cy.getFormFooterButtonByType(resetButton, 'reset').should(
          'be.disabled'
        );
        // Editing the quota table
        editQuotasTable(allocatedVmQuota);
        // Reset the form
        resetForm();

        // Cancel the Manage Quotas form
        cancelForm();
      });

      it('Validate Manage Quotas function', () => {
        // Enabling the quota: "Allocated Number of Virtual Machines" with value 10
        editQuotasTable(allocatedVmQuota, '10');
        // Saving the form
        saveForm();
      });

      afterEach(() => {
        confirmUiNavigation(() => {
          // Deleting the child tenant
          deleteAccordionItem(initialChildTenantName);
        });
      });
    });
  });
});
