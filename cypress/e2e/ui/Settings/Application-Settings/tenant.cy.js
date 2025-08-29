/* eslint-disable no-undef */
import { flashClassMap } from '../../../../support/assertions/assertion_constants';

// Component route url
const COMPONENT_ROUTE_URL = '/ops/explorer';

// Menu options
const SETTINGS_MENU_OPTION = 'Settings';
const APP_SETTINGS_MENU_OPTION = 'Application Settings';

// Accordion items
const ACCESS_CONTROL_ACCORDION_ITEM = 'Access Control';
const ACCESS_CONTROL_ACCORDION_ITEM_ID = 'rbac_accord';
const MANAGEIQ_REGION_ACCORDION_ITEM = /^ManageIQ Region:/;
const TENANTS_ACCORDION_ITEM = 'Tenants';

// Field values
const FORM_HEADER_FRAGMENT = 'Tenant';
const NAME_FIELD_LABEL = 'Name';
const DESCRIPTION_FIELD_LABEL = 'Description';
const INITIAL_PARENT_TENANT_NAME = 'My Company';
const INITIAL_PARENT_TENANT_DESCRIPTION = 'Tenant for My Company';
const EDITED_TENANT_NAME_VALUE = 'Test-Name';
const EDITED_DESCRIPTION_VALUE = 'Test-Description';
const PROJECT_NAME_VALUE = 'Test-Project';
const INITIAL_CHILD_TENANT_NAME = 'Child-Tenant';
const INITIAL_CHILD_TENANT_DESCRIPTION = 'Child Tenant description';

// Config options
const CONFIG_TOOLBAR_BUTTON = 'Configuration';
const EDIT_TENANT_CONFIG_OPTION = 'Edit this item';
const ADD_PROJECT_CONFIG_OPTION = 'Add Project to this Tenant';
const DELETE_ITEM_CONFIG_OPTION = 'Delete this item';
const MANAGE_QUOTAS_CONFIG_OPTION = 'Manage Quotas';
const ADD_CHILD_TENANT_CONFIG_OPTION = 'Add child Tenant to this Tenant';

// Quota Descriptions
const ALLOCATED_STORAGE_QUOTA = 'Allocated Storage in GB';
const ALLOCATED_VM_QUOTA = 'Allocated Number of Virtual Machines';

// Buttons
const SAVE_BUTTON_TEXT = 'Save';
const CANCEL_BUTTON_TEXT = 'Cancel';
const RESET_BUTTON_TEXT = 'Reset';
const ADD_BUTTON_TEXT = 'Add';

// Flash message text snippets
const FLASH_MESSAGE_OPERATION_CANCELED = 'cancel';
const FLASH_MESSAGE_OPERATION_RESET = 'reset';
const FLASH_MESSAGE_SAVED = 'saved';
const FLASH_MESSAGE_ADDED = 'added';
const FLASH_MESSAGE_CANT_DELETE = 'cannot delete';
const FLASH_MESSAGE_DELETE_SUCCESSFUL = 'successful';
const BROWSER_ALERT_DELETE_CONFIRM_TEXT = 'delete';
const NAME_ALREADY_TAKEN_ERROR = 'taken';

function confirmUiNavigation(callback) {
  cy.url()
    ?.then((url) => {
      // Ensures navigation to Settings -> Application-Settings in the UI
      if (!url?.includes(COMPONENT_ROUTE_URL)) {
        // Navigate to Settings -> Application-Settings before looking out for parent Tenants edited during test
        cy.menu(SETTINGS_MENU_OPTION, APP_SETTINGS_MENU_OPTION);
      }
    })
    .then(() => {
      callback();
    });
}

function cancelForm(
  assertFlashMessage = true,
  flashMessageSnippet = FLASH_MESSAGE_OPERATION_CANCELED
) {
  cy.getFormFooterButtonByType(CANCEL_BUTTON_TEXT).click();
  if (assertFlashMessage) {
    cy.expect_flash(flashClassMap.warning, flashMessageSnippet);
  }
}

function resetForm(buttonType = 'reset') {
  cy.getFormFooterButtonByType(RESET_BUTTON_TEXT, buttonType)
    .should('be.enabled')
    .click();
  cy.expect_flash(flashClassMap.warning, FLASH_MESSAGE_OPERATION_RESET);
}

function saveForm({
  assertFlashMessage = true,
  button = SAVE_BUTTON_TEXT,
  flashMessageSnippet = FLASH_MESSAGE_SAVED,
} = {}) {
  cy.getFormFooterButtonByType(button, 'submit').should('be.enabled').click();
  if (assertFlashMessage) {
    cy.expect_flash(flashClassMap.success, flashMessageSnippet);
  }
}

function updateNameAndDescription(nameValue, descriptionValue) {
  cy.getFormInputFieldById('name').clear().type(nameValue);
  cy.getFormInputFieldById('description').clear().type(descriptionValue);
}

function verifyNameAndDescriptionValues(nameValue, descriptionValue) {
  cy.getFormInputFieldById('name').should('have.value', nameValue);
  cy.getFormInputFieldById('description').should(
    'have.value',
    descriptionValue
  );
}

function validateFormElements(isEditForm = true) {
  // Assert form header is visible
  cy.expect_explorer_title(FORM_HEADER_FRAGMENT);
  // Assert name field label is visible
  cy.getFormLabelByInputId('name')
    .should('be.visible')
    .and('contain.text', NAME_FIELD_LABEL);
  // Assert name field is visible and enabled
  cy.getFormInputFieldById('name').should('be.visible').and('be.enabled');
  // Assert description field label is visible
  cy.getFormLabelByInputId('description')
    .should('be.visible')
    .and('contain.text', DESCRIPTION_FIELD_LABEL);
  // Assert description field is visible and enabled
  cy.getFormInputFieldById('description')
    .should('be.visible')
    .and('be.enabled');
  // Assert cancel button is visible and enabled
  cy.getFormFooterButtonByType(CANCEL_BUTTON_TEXT)
    .should('be.visible')
    .and('be.enabled');
  if (isEditForm) {
    // Assert reset button is visible and disabled
    cy.getFormFooterButtonByType(RESET_BUTTON_TEXT)
      .should('be.visible')
      .and('be.disabled');
  }
  // Assert add/save button is visible and disabled
  cy.getFormFooterButtonByType(
    isEditForm ? SAVE_BUTTON_TEXT : ADD_BUTTON_TEXT,
    'submit'
  )
    .should('be.visible')
    .and('be.disabled');
}

function createAndSelectChildTenant() {
  // Open child tenant create form
  cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_CHILD_TENANT_CONFIG_OPTION);
  // Add name & description
  updateNameAndDescription(
    INITIAL_CHILD_TENANT_NAME,
    INITIAL_CHILD_TENANT_DESCRIPTION
  );
  // Save the form
  saveForm({
    button: ADD_BUTTON_TEXT,
    flashMessageSnippet: FLASH_MESSAGE_ADDED,
  });
  // Select the created child tenant accordion item
  // TODO: Replace with cy.interceptApi after it's enhanced to wait conditionally on request trigger
  cy.selectAccordionItem([
    MANAGEIQ_REGION_ACCORDION_ITEM,
    TENANTS_ACCORDION_ITEM,
    INITIAL_PARENT_TENANT_NAME,
    INITIAL_CHILD_TENANT_NAME,
  ]);
  cy.wait('@treeSelectApi');
}

function resetParentTenantForm() {
  cy.get(`#${ACCESS_CONTROL_ACCORDION_ITEM_ID} li.list-group-item`).each(
    (item) => {
      const text = item?.text()?.trim();
      // Check if the text matches the edited parent tenant name, if yes reset
      if (text === EDITED_TENANT_NAME_VALUE) {
        cy.wrap(item).click();
        // Open the tenant edit form
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, EDIT_TENANT_CONFIG_OPTION);
        // Reset name & description to old values
        updateNameAndDescription(
          INITIAL_PARENT_TENANT_NAME,
          INITIAL_PARENT_TENANT_DESCRIPTION
        );
        // Save the form
        saveForm({ assertFlashMessage: false });

        // Exit the loop
        return false;
      }
      // Returning null to get rid of eslint warning, has no impact
      return null;
    }
  );
}

// TODO: Aside from test that validates deletion, replace with a more reliable cleanup mechanism when ready
function deleteAccordionItem(accordionToDelete) {
  cy.get(`#${ACCESS_CONTROL_ACCORDION_ITEM_ID} li.list-group-item`).each(
    (item) => {
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
                cy.toolbar(CONFIG_TOOLBAR_BUTTON, DELETE_ITEM_CONFIG_OPTION),
              containsText: BROWSER_ALERT_DELETE_CONFIRM_TEXT,
            }),
        });
        // Break the loop
        return false;
      }
      // Returning null to get rid of eslint warning, has no impact
      return null;
    }
  );
}

function addProjectToTenant() {
  // Open the Add Project form
  cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_PROJECT_CONFIG_OPTION);
  // Add name & description
  updateNameAndDescription(PROJECT_NAME_VALUE, EDITED_DESCRIPTION_VALUE);
  // Save the form
  saveForm({
    button: ADD_BUTTON_TEXT,
    flashMessageSnippet: FLASH_MESSAGE_ADDED,
  });
}

function editQuotasTable(quotaName = ALLOCATED_STORAGE_QUOTA, quotaValue) {
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
  cy.toolbar(CONFIG_TOOLBAR_BUTTON, MANAGE_QUOTAS_CONFIG_OPTION);
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
      cy.getFormFooterButtonByType(SAVE_BUTTON_TEXT, 'submit').click();
    }
  });
}

describe('Automate Tenant form operations: Settings > Application Settings > Access Control > Tenants', () => {
  beforeEach(() => {
    cy.login();
    // Navigate to Settings -> Application-Settings in the UI
    cy.menu(SETTINGS_MENU_OPTION, APP_SETTINGS_MENU_OPTION);
    // Expand Access-Control accordion
    cy.interceptApi({
      alias: 'accordionSelectApi',
      urlPattern: /\/ops\/accordion_select\?id=.*/,
      triggerFn: () => cy.accordion(ACCESS_CONTROL_ACCORDION_ITEM),
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
      MANAGEIQ_REGION_ACCORDION_ITEM,
      TENANTS_ACCORDION_ITEM,
      INITIAL_PARENT_TENANT_NAME,
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
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, EDIT_TENANT_CONFIG_OPTION);
      });

      it('Validate Edit tenant form elements', () => {
        // Validate form fields
        validateFormElements();
      });

      it('Validate Reset & Cancel buttons on Edit tenant form', () => {
        // Update name & description fields
        updateNameAndDescription(
          EDITED_TENANT_NAME_VALUE,
          EDITED_DESCRIPTION_VALUE
        );
        // Reset the form
        resetForm('button');
        // Confirm name and description has old values
        verifyNameAndDescriptionValues(
          INITIAL_PARENT_TENANT_NAME,
          INITIAL_PARENT_TENANT_DESCRIPTION
        );
        // Cancel the edit form
        cancelForm();
      });

      it('Validate Edit function', () => {
        // Edit name & description
        updateNameAndDescription(
          EDITED_TENANT_NAME_VALUE,
          EDITED_DESCRIPTION_VALUE
        );
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
        confirmUiNavigation(() => deleteAccordionItem(PROJECT_NAME_VALUE));
      });
    });

    describe('Validate Manage Quotas in parent tenant', () => {
      beforeEach(() => {
        // Open the Manage Quotas form
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, MANAGE_QUOTAS_CONFIG_OPTION);
      });

      it('Validate Reset & Cancel buttons in Manage Quotas form', () => {
        // Check if Reset button is disabled initially
        cy.getFormFooterButtonByType(RESET_BUTTON_TEXT, 'reset').should(
          'be.disabled'
        );
        // Editing the quota table
        editQuotasTable(ALLOCATED_STORAGE_QUOTA);
        // Reset the form
        resetForm();

        // Cancel the Manage Quotas form
        cancelForm();
      });

      it('Validate Manage Quotas function', () => {
        // Enabling the quota: "Allocated Storage in GB" with value 10
        editQuotasTable(ALLOCATED_STORAGE_QUOTA, '10');
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
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_CHILD_TENANT_CONFIG_OPTION);
      });

      it('Validate Add child tenant form elements', () => {
        // Validate form fields
        validateFormElements(false);
      });

      it('Validate Cancel, Add & Delete of child tenant', () => {
        // Add name & description
        updateNameAndDescription(
          INITIAL_CHILD_TENANT_NAME,
          INITIAL_CHILD_TENANT_DESCRIPTION
        );
        // Cancel the add child tenant form
        cancelForm();
        // Open the Add child tenant form again to perform add operation
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_CHILD_TENANT_CONFIG_OPTION);
        // Add name & description
        updateNameAndDescription(
          INITIAL_CHILD_TENANT_NAME,
          INITIAL_CHILD_TENANT_DESCRIPTION
        );
        // Save the form
        saveForm({
          button: ADD_BUTTON_TEXT,
          flashMessageSnippet: FLASH_MESSAGE_ADDED,
        });
        // Delete the created child tenant
        deleteAccordionItem(INITIAL_CHILD_TENANT_NAME);
        cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_DELETE_SUCCESSFUL);
      });

      it('Validate Adding a duplicate child tenant is restricted', () => {
        // Add name & description
        updateNameAndDescription(
          INITIAL_CHILD_TENANT_NAME,
          INITIAL_CHILD_TENANT_DESCRIPTION
        );
        // Save the form
        saveForm({
          assertFlashMessage: false,
          button: ADD_BUTTON_TEXT,
          flashMessageSnippet: FLASH_MESSAGE_ADDED,
        });

        // Open the Add child tenant form again
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_CHILD_TENANT_CONFIG_OPTION);
        // Trying to add a child tenant with the same name
        cy.getFormInputFieldById('name').type(INITIAL_CHILD_TENANT_NAME);
        cy.get('#rbac_details #name-error-msg').contains(
          NAME_ALREADY_TAKEN_ERROR
        );
        // Cancel the add form
        cancelForm(false);
      });

      afterEach(() => {
        // Deleting the child tenant
        confirmUiNavigation(() =>
          deleteAccordionItem(INITIAL_CHILD_TENANT_NAME)
        );
      });
    });

    describe('Validate Edit child tenant', () => {
      beforeEach(() => {
        // Adding a child tenant first and then selecting it
        createAndSelectChildTenant();
        // Open the child tenant edit form
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, EDIT_TENANT_CONFIG_OPTION);
      });

      it('Validate Edit child tenant form elements', () => {
        // Validate form fields
        validateFormElements();
        // Cancel the edit form
        cancelForm();
        // Removing the child tenant
        deleteAccordionItem(INITIAL_CHILD_TENANT_NAME);
      });

      it('Validate Reset & Cancel buttons on the Edit child tenent form', () => {
        // Update name & description fields
        updateNameAndDescription(
          EDITED_TENANT_NAME_VALUE,
          EDITED_DESCRIPTION_VALUE
        );
        // Reset the form
        resetForm('button');
        // Confirm name and description has old values
        verifyNameAndDescriptionValues(
          INITIAL_CHILD_TENANT_NAME,
          INITIAL_CHILD_TENANT_DESCRIPTION
        );
        // Cancel the edit form
        cancelForm();
        // Removing the child tenant
        deleteAccordionItem(INITIAL_CHILD_TENANT_NAME);
      });

      it('Validate Edit function', () => {
        // Add name & description
        updateNameAndDescription(
          EDITED_TENANT_NAME_VALUE,
          EDITED_DESCRIPTION_VALUE
        );
        // Save the form
        saveForm();
        // Removing the edited child tenant
        deleteAccordionItem(EDITED_TENANT_NAME_VALUE);
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
        deleteAccordionItem(INITIAL_CHILD_TENANT_NAME);
        // Expecting a flash error message
        cy.expect_flash(flashClassMap.error, FLASH_MESSAGE_CANT_DELETE);
      });

      afterEach(() => {
        confirmUiNavigation(() => {
          // Delete the created project
          deleteAccordionItem(PROJECT_NAME_VALUE);
          // Delete the child tenant
          deleteAccordionItem(INITIAL_CHILD_TENANT_NAME);
        });
      });
    });

    describe('Validate Manage Quotas in child tenant', () => {
      beforeEach(() => {
        // Adding a child tenant first and then selecting it
        createAndSelectChildTenant();
        // Open the Manage Quotas form
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, MANAGE_QUOTAS_CONFIG_OPTION);
      });

      it('Validate Reset & Cancel buttons in Manage Quotas form', () => {
        // Check if Reset button is disabled initially
        cy.getFormFooterButtonByType(RESET_BUTTON_TEXT, 'reset').should(
          'be.disabled'
        );
        // Editing the quota table
        editQuotasTable(ALLOCATED_VM_QUOTA);
        // Reset the form
        resetForm();

        // Cancel the Manage Quotas form
        cancelForm();
      });

      it('Validate Manage Quotas function', () => {
        // Enabling the quota: "Allocated Number of Virtual Machines" with value 10
        editQuotasTable(ALLOCATED_VM_QUOTA, '10');
        // Saving the form
        saveForm();
      });

      afterEach(() => {
        confirmUiNavigation(() => {
          // Deleting the child tenant
          deleteAccordionItem(INITIAL_CHILD_TENANT_NAME);
        });
      });
    });
  });
});
