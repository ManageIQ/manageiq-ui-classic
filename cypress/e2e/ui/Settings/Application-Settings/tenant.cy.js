/* eslint-disable no-undef */

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

  // Flash message types
  flashTypeSuccess: 'success',
  flashTypeWarning: 'warning',
  flashTypeError: 'error',

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
  componentRouteUrl,
  settingsMenuOption,
  appSettingsMenuOption,
  accessControlAccordionItem,
  accessControlAccordionItemId,
  manageIQRegionAccordItem,
  tenantsAccordionItem,
  initialParentTenantName,
  initialParentTenantDescription,
  initialChildTenantName,
  initialChildTenantDescription,
  configToolbarButton,
  editTenantConfigOption,
  addProjectConfigOption,
  deleteItemConfigOption,
  addChildTenantConfigOption,
  manageQuotasConfigOption,
  flashTypeWarning,
  flashTypeSuccess,
  flashTypeError,
  flashMessageOperationCanceled,
  flashMessageOperationReset,
  flashMessageSaved,
  flashMessageAdded,
  flashMessageCantDelete,
  browserAlertDeleteConfirmText,
  saveButton,
  cancelButton,
  resetButton,
  addButton,
  nameValue,
  editedTenantNameValue,
  editedDescriptionValue,
  projectNameValue,
  allocatedStorageQuota,
  allocatedVmQuota,
  nameAlreadyTakenError,
  submitButtonType,
  resetButtonType,
  nameInputFieldId,
  descriptionInputFieldId,
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

function addOrEditOperation(
  button = addButton,
  name = initialChildTenantName,
  description = initialChildTenantDescription,
  flashMessageSnippet = flashMessageAdded,
  isEditOperation = false
) {
  // Check if button is disabled initially
  cy.getFormFooterButtonByType(button, submitButtonType).should('be.disabled');
  // Add or edit name and description
  const nameField = cy.getFormInputFieldById(nameInputFieldId);
  const descriptionField = cy.getFormInputFieldById(descriptionInputFieldId);
  if (isEditOperation) {
    nameField.clear().type(name);
    descriptionField.clear().type(description);
  } else {
    nameField.type(name);
    descriptionField.type(description);
  }
  // Save the form
  cy.getFormFooterButtonByType(button, submitButtonType)
    .should('be.enabled')
    .click();
  cy.expect_flash(flashTypeSuccess, flashMessageSnippet);
}

function createAndSelectChildTenant() {
  // Add child tenant first
  cy.toolbar(configToolbarButton, addChildTenantConfigOption);
  addOrEditOperation();
  // Select the created child tenant accordion item
  cy.selectAccordionItem([
    manageIQRegionAccordItem,
    tenantsAccordionItem,
    initialParentTenantName,
    initialChildTenantName,
  ]);
  cy.wait('@accordionApi');
}

function resetParentTenantForm() {
  cy.get(`#${accessControlAccordionItemId} li.list-group-item`).each((item) => {
    const text = item?.text()?.trim();
    // Check if the text matches the edited parent tenant name, if yes reset
    if (text === editedTenantNameValue) {
      cy.wrap(item).click();
      // Open the tenant edit form
      cy.toolbar(configToolbarButton, editTenantConfigOption);
      // Reset the form fields to initial values
      addOrEditOperation(
        saveButton,
        initialParentTenantName,
        initialParentTenantDescription,
        flashMessageSaved,
        true
      );
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
      cy.intercept(
        'POST',
        /\/ops\/x_button\/[^/]+\?pressed=rbac_tenant_delete/
      ).as('deleteAccordionItem');
      cy.expect_browser_confirm_with_text({
        confirmTriggerFn: () =>
          cy.toolbar(configToolbarButton, deleteItemConfigOption),
        containsText: browserAlertDeleteConfirmText,
      });
      cy.wait('@deleteAccordionItem');
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
  // Adding a project to the parent tenant
  addOrEditOperation(
    addButton,
    projectNameValue,
    editedDescriptionValue,
    flashMessageAdded
  );
}

function editQuotasTable(quotaName = allocatedStorageQuota) {
  cy.get('#rbac_details .miq-data-table table tbody tr').each((row) => {
    if (
      row
        .find('td span.bx--front-line')
        .filter((_ind, el) => el.innerText.trim() === quotaName).length
    ) {
      // Toggle the switch to enable the quota - "Allocated Storage in GB"
      cy.wrap(row).find('span.bx--toggle__switch').click();

      // Selecting the input field to type the quota value 10GB
      cy.wrap(row).find('div.bx--text-input-wrapper input').clear().type('10');

      // Exit loop
      return false;
    }
    // Returning null to get rid of eslint warning, has no impact
    return null;
  });
}

function quotasResetOperation(quotaName = allocatedStorageQuota) {
  // Check if Reset button is disabled initially
  cy.getFormFooterButtonByType(resetButton, resetButtonType).should(
    'be.disabled'
  );
  // Editing the quota table
  editQuotasTable(quotaName);
  // Confirm Reset button is enabled once table values are updated and then click on Reset
  cy.getFormFooterButtonByType(resetButton, resetButtonType)
    .should('be.enabled')
    .click();
  cy.expect_flash(flashTypeWarning, flashMessageOperationReset);
}

function updateQuotas(quotaName = allocatedStorageQuota) {
  // Opting for the desired quota in the table
  editQuotasTable(quotaName);
  // Saving the form
  cy.getFormFooterButtonByType(saveButton, submitButtonType).click();
  cy.expect_flash(flashTypeSuccess, flashMessageSaved);
}

function rollbackQuotas() {
  cy.toolbar(configToolbarButton, manageQuotasConfigOption);
  cy.get('#rbac_details .miq-data-table table tbody tr').each((row) => {
    const quotaValueInputWrapper = row.find('div.bx--text-input-wrapper');
    // If the quota value input wrapper DOES NOT have the '-readonly' class, it's enabled
    const isEnabled = !quotaValueInputWrapper.hasClass(
      'bx--text-input-wrapper--readonly'
    );
    if (isEnabled) {
      // Toggle the switch to disable the quota
      cy.wrap(row).find('span.bx--toggle__switch').click();
    }
  });
  // Saving the form
  cy.getFormFooterButtonByType(saveButton, submitButtonType).click();
}

function cancelOperation(flashMessageSnippet = flashMessageOperationCanceled) {
  // Cancel the form
  cy.getFormFooterButtonByType(cancelButton).click();
  cy.expect_flash(flashTypeWarning, flashMessageSnippet);
}

function resetOperation(
  oldName = initialParentTenantName,
  oldDescription = initialParentTenantDescription
) {
  // Check if Reset button is disabled initially
  cy.getFormFooterButtonByType(resetButton).should('be.disabled');
  // Editing name and description fields
  cy.getFormInputFieldById(nameInputFieldId).type(editedTenantNameValue);
  cy.getFormInputFieldById(descriptionInputFieldId).type(
    editedDescriptionValue
  );
  // Confirm Reset button is enabled once dropdown value is changed and then click on Reset
  cy.getFormFooterButtonByType(resetButton).should('be.enabled').click();
  cy.expect_flash(flashTypeWarning, flashMessageOperationReset);
  // Confirm name and description has old values
  cy.getFormInputFieldById(nameInputFieldId).should('have.value', oldName);
  cy.getFormInputFieldById(descriptionInputFieldId).should(
    'have.value',
    oldDescription
  );
}

describe('Automate Tenant form operations: Settings > Application Settings > Access Control > Tenants', () => {
  beforeEach(() => {
    cy.login();
    // Added static delay to wait for initial data load and dashboard display
    cy.wait(500);
    // Navigate to Settings -> Application-Settings in the UI
    cy.menu(settingsMenuOption, appSettingsMenuOption);
    // Expand Access-Control accordion
    cy.intercept(
      'POST',
      `ops/accordion_select?id=${accessControlAccordionItemId}`
    ).as('getAccessControlAccordion');
    cy.accordion(accessControlAccordionItem);
    cy.wait('@getAccessControlAccordion');
    // Select the existing parent tenant accordion item named "My Company"
    let requestFired = false;
    cy.intercept(
      'POST',
      /ops\/tree_select\?id=[^&]+&text=[^&]+/,
      () => (requestFired = true)
    ).as('accordionApi');
    cy.selectAccordionItem([
      manageIQRegionAccordItem,
      tenantsAccordionItem,
      initialParentTenantName,
    ]);
    cy.then(() => {
      // If the request was fired, wait for the alias
      if (requestFired) {
        cy.wait('@accordionApi');
      }
    });
  });

  describe('Validate Parent Tenant operations: Edit, Add Project, Manage Quotas', () => {
    describe('Validate Edit parent tenant', () => {
      beforeEach(() => {
        // Open the tenant edit form
        cy.toolbar(configToolbarButton, editTenantConfigOption);
      });

      it('Validate Cancel & Reset buttons on Edit tenant form', () => {
        // Reset operation
        resetOperation();
        // Cancel the edit operation
        cancelOperation();
      });

      it('Validate Edit function', () => {
        // Perform the edit operation
        addOrEditOperation(
          saveButton,
          editedTenantNameValue,
          editedDescriptionValue,
          flashMessageSaved,
          true
        );
      });

      after(() => {
        confirmUiNavigation(() => resetParentTenantForm());
      });
    });

    describe('Validate Add Project to parent tenant', () => {
      it('Validate Add Project function', () => {
        // Add Project to the parent tenant
        addProjectToTenant();
      });

      after(() => {
        confirmUiNavigation(() => deleteAccordionItem(projectNameValue));
      });
    });

    describe('Validate Manage Quotas in parent tenant', () => {
      beforeEach(() => {
        // Open the Manage Quotas form
        cy.toolbar(configToolbarButton, manageQuotasConfigOption);
      });

      it('Validate Cancel & Reset buttons in Manage Quotas form', () => {
        // Edit the quotas table and reset the quotas
        quotasResetOperation();
        // Cancel the Manage Quotas form
        cancelOperation();
      });

      it('Validate Manage Quotas function', () => {
        // Enabling the quota: "Allocated Storage in GB" with value 10
        updateQuotas();
      });

      after(() => {
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

      it('Validate cancel button on Add child tenant form', () => {
        // Cancel the add operation
        cancelOperation();
      });

      it('Validate Add & Delete child tenant', () => {
        // Adding a child tenant
        addOrEditOperation();
        // Delete the created child tenant
        deleteAccordionItem(initialChildTenantName);
      });

      it('Validate Adding a duplicate child tenant is restricted', () => {
        // Adding a child tenant
        addOrEditOperation();
        // Open the Add child tenant form again
        cy.toolbar(configToolbarButton, addChildTenantConfigOption);
        // Trying to add a child tenant with the same name
        cy.getFormInputFieldById(nameInputFieldId).type(initialChildTenantName);
        cy.get('#rbac_details #name-error-msg').contains(nameAlreadyTakenError);
        // Cancel the add form
        cancelOperation();
      });

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

      it('Validate Cancel & Reset buttons on the Edit child tenent form', () => {
        // Editing and resetting the form
        resetOperation(initialChildTenantName, initialChildTenantDescription);
        // Cancel the edit form
        cancelOperation();
        // Removing the child tenant
        deleteAccordionItem(initialChildTenantName);
      });

      it('Validate Edit function', () => {
        // Perform the edit operation
        addOrEditOperation(
          saveButton,
          editedTenantNameValue,
          editedDescriptionValue,
          flashMessageSaved,
          true
        );
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
        cy.expect_flash(flashTypeError, flashMessageCantDelete);
      });

      afterEach(() => {
        confirmUiNavigation(() => {
          // Delete the created project
          deleteAccordionItem(projectNameValue);
          // add test to validate if removing child tenant with project throws error

          /* @cleanup: Remove this block once the delete issue is fixed: https://github.com/ManageIQ/manageiq-ui-classic/issues/9512 */
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

      it('Validate Cancel & Reset buttons in Manage Quotas form', () => {
        // Edit the quotas table and reset the quotas
        quotasResetOperation(allocatedVmQuota);
        // Cancel the Manage Quotas form
        cancelOperation();
      });

      it('Validate Manage Quotas function', () => {
        // Enabling the quota: "Allocated Number of Virtual Machines" with value 10
        updateQuotas(allocatedVmQuota);
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
