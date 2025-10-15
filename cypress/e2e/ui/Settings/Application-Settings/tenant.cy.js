/* eslint-disable no-undef */
import { flashClassMap } from '../../../../support/assertions/assertion_constants';

// Component route url
const COMPONENT_ROUTE_URL = '/ops/explorer#/';

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
    .then((url) => {
      // Ensures navigation to Settings -> Application-Settings in the UI
      if (!url.endsWith(COMPONENT_ROUTE_URL)) {
        cy.visit(COMPONENT_ROUTE_URL);
      }
      cy.accordion(ACCESS_CONTROL_ACCORDION_ITEM);
    })
    .then(() => {
      callback();
    });
}

function cancelFormWithOptionalFlashCheck(assertFlashMessage = true) {
  cy.getFormFooterButtonByTypeWithText({
    buttonText: CANCEL_BUTTON_TEXT,
  }).click();
  if (assertFlashMessage) {
    cy.expect_flash(flashClassMap.warning, FLASH_MESSAGE_OPERATION_CANCELED);
  }
}

function resetFormAndAssertFlashMessage(buttonType = 'reset') {
  cy.getFormFooterButtonByTypeWithText({
    buttonText: RESET_BUTTON_TEXT,
    buttonType,
  })
    .should('be.enabled')
    .click();
  cy.expect_flash(flashClassMap.warning, FLASH_MESSAGE_OPERATION_RESET);
}

function saveFormWithOptionalFlashCheck({
  assertFlashMessage = true,
  button = SAVE_BUTTON_TEXT,
  flashMessageSnippet = FLASH_MESSAGE_SAVED,
  apiMethod = 'POST',
} = {}) {
  // Below url pattern can match: Edit tenant - PUT /api/tenants/{id}, Add tenant/project - POST /api/tenants
  // and Manage quotas: POST /api/tenants/{id}/quotas
  cy.interceptApi({
    method: apiMethod,
    alias: 'tenantOperationsApi',
    urlPattern: /\/api\/tenants.*/,
    triggerFn: () =>
      cy
        .getFormFooterButtonByTypeWithText({
          buttonText: button,
          buttonType: 'submit',
        })
        .should('be.enabled')
        .click(),
  });
  if (assertFlashMessage) {
    cy.expect_flash(flashClassMap.success, flashMessageSnippet);
  }
}

function updateNameAndDescription(nameValue, descriptionValue) {
  cy.getFormInputFieldByIdAndType({ inputId: 'name' }).clear().type(nameValue);
  cy.getFormInputFieldByIdAndType({ inputId: 'description' })
    .clear()
    .type(descriptionValue);
}

function verifyNameAndDescriptionValues(nameValue, descriptionValue) {
  cy.getFormInputFieldByIdAndType({ inputId: 'name' }).should(
    'have.value',
    nameValue
  );
  cy.getFormInputFieldByIdAndType({ inputId: 'description' }).should(
    'have.value',
    descriptionValue
  );
}

function validateFormElements(isEditForm = true) {
  cy.expect_explorer_title(FORM_HEADER_FRAGMENT);
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
  if (isEditForm) {
    cy.getFormFooterButtonByTypeWithText({ buttonText: RESET_BUTTON_TEXT })
      .should('be.visible')
      .and('be.disabled');
  }
  cy.getFormFooterButtonByTypeWithText({
    buttonText: isEditForm ? SAVE_BUTTON_TEXT : ADD_BUTTON_TEXT,
    buttonType: 'submit',
  })
    .should('be.visible')
    .and('be.disabled');
}

function createAndSelectChildTenant() {
  cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_CHILD_TENANT_CONFIG_OPTION);
  updateNameAndDescription(
    INITIAL_CHILD_TENANT_NAME,
    INITIAL_CHILD_TENANT_DESCRIPTION
  );
  saveFormWithOptionalFlashCheck({
    button: ADD_BUTTON_TEXT,
    flashMessageSnippet: FLASH_MESSAGE_ADDED,
  });
  cy.selectAccordionItem([
    MANAGEIQ_REGION_ACCORDION_ITEM,
    TENANTS_ACCORDION_ITEM,
    INITIAL_PARENT_TENANT_NAME,
    INITIAL_CHILD_TENANT_NAME,
  ]);
}

function resetParentTenantForm() {
  cy.get(`#${ACCESS_CONTROL_ACCORDION_ITEM_ID} li.list-group-item`).each(
    (item) => {
      const text = item.text().trim();
      // Check if the text matches the edited parent tenant name, if yes reset
      if (text === EDITED_TENANT_NAME_VALUE) {
        cy.wrap(item).click();
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, EDIT_TENANT_CONFIG_OPTION);
        updateNameAndDescription(
          INITIAL_PARENT_TENANT_NAME,
          INITIAL_PARENT_TENANT_DESCRIPTION
        );
        saveFormWithOptionalFlashCheck({ assertFlashMessage: false });

        // Exit the loop
        return false;
      }
      // Returning null to get rid of eslint warning, has no impact
      return null;
    }
  );
}

function deleteAccordionItems(accordionsToDelete) {
  cy.get(`#${ACCESS_CONTROL_ACCORDION_ITEM_ID} li.list-group-item`).each(
    (item) => {
      const text = item.text().trim();
      // Check if the text matches the project name created during test, if yes delete
      if (accordionsToDelete.includes(text)) {
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
  cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_PROJECT_CONFIG_OPTION);
  updateNameAndDescription(PROJECT_NAME_VALUE, EDITED_DESCRIPTION_VALUE);
  saveFormWithOptionalFlashCheck({
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
      cy.wrap(row).find('span.bx--toggle__switch').click();

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

describe('Automate Tenant form operations: Settings > Application Settings > Access Control > Tenants', () => {
  beforeEach(() => {
    cy.login();
    cy.menu(SETTINGS_MENU_OPTION, APP_SETTINGS_MENU_OPTION);
    cy.accordion(ACCESS_CONTROL_ACCORDION_ITEM);
    cy.selectAccordionItem([
      MANAGEIQ_REGION_ACCORDION_ITEM,
      TENANTS_ACCORDION_ITEM,
      INITIAL_PARENT_TENANT_NAME,
    ]);
  });

  describe('Validate Parent Tenant operations: Edit, Add Project, Manage Quotas', () => {
    describe('Validate Edit parent tenant', () => {
      beforeEach(() => {
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, EDIT_TENANT_CONFIG_OPTION);
      });

      afterEach(() => {
        confirmUiNavigation(() => resetParentTenantForm());
      });

      it('Validate Edit tenant form elements', () => {
        validateFormElements();
      });

      it('Validate Reset & Cancel buttons on Edit tenant form', () => {
        updateNameAndDescription(
          EDITED_TENANT_NAME_VALUE,
          EDITED_DESCRIPTION_VALUE
        );
        resetFormAndAssertFlashMessage('button');
        verifyNameAndDescriptionValues(
          INITIAL_PARENT_TENANT_NAME,
          INITIAL_PARENT_TENANT_DESCRIPTION
        );
        cancelFormWithOptionalFlashCheck();
      });

      it('Validate Edit function', () => {
        updateNameAndDescription(
          EDITED_TENANT_NAME_VALUE,
          EDITED_DESCRIPTION_VALUE
        );
        saveFormWithOptionalFlashCheck({ apiMethod: 'PUT' });
      });
    });

    describe('Validate Add Project to parent tenant', () => {
      afterEach(() => {
        cy.appDbState('restore');
      });

      it('Validate Add Project function', () => {
        addProjectToTenant();
      });
    });

    describe('Validate Manage Quotas in parent tenant', () => {
      beforeEach(() => {
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, MANAGE_QUOTAS_CONFIG_OPTION);
      });

      afterEach(() => {
        cy.appDbState('restore');
      });

      it('Validate Reset & Cancel buttons in Manage Quotas form', () => {
        cy.getFormFooterButtonByTypeWithText({
          buttonText: RESET_BUTTON_TEXT,
          buttonType: 'reset',
        }).should('be.disabled');
        editQuotasTable(ALLOCATED_STORAGE_QUOTA);
        resetFormAndAssertFlashMessage();
        cancelFormWithOptionalFlashCheck();
      });

      it('Validate Manage Quotas function', () => {
        editQuotasTable(ALLOCATED_STORAGE_QUOTA, '10');
        saveFormWithOptionalFlashCheck();
      });
    });
  });

  describe('Validate Child Tenant operations: Add, Edit, Add Project, Manage Quotas', () => {
    describe('Validate Add child tenant function', () => {
      beforeEach(() => {
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_CHILD_TENANT_CONFIG_OPTION);
      });

      afterEach(() => {
        cy.appDbState('restore');
      });

      it('Validate Add child tenant form elements', () => {
        validateFormElements(false);
      });

      it('Validate Cancel, Add & Delete of child tenant', () => {
        updateNameAndDescription(
          INITIAL_CHILD_TENANT_NAME,
          INITIAL_CHILD_TENANT_DESCRIPTION
        );
        cancelFormWithOptionalFlashCheck();
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_CHILD_TENANT_CONFIG_OPTION);
        updateNameAndDescription(
          INITIAL_CHILD_TENANT_NAME,
          INITIAL_CHILD_TENANT_DESCRIPTION
        );
        saveFormWithOptionalFlashCheck({
          button: ADD_BUTTON_TEXT,
          flashMessageSnippet: FLASH_MESSAGE_ADDED,
        });
        deleteAccordionItems([INITIAL_CHILD_TENANT_NAME]);
        cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_DELETE_SUCCESSFUL);
      });

      it('Validate Adding a duplicate child tenant is restricted', () => {
        updateNameAndDescription(
          INITIAL_CHILD_TENANT_NAME,
          INITIAL_CHILD_TENANT_DESCRIPTION
        );
        saveFormWithOptionalFlashCheck({
          assertFlashMessage: false,
          button: ADD_BUTTON_TEXT,
          flashMessageSnippet: FLASH_MESSAGE_ADDED,
        });
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_CHILD_TENANT_CONFIG_OPTION);
        cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type(
          INITIAL_CHILD_TENANT_NAME
        );
        cy.get('#rbac_details #name-error-msg').contains(
          NAME_ALREADY_TAKEN_ERROR
        );
        cancelFormWithOptionalFlashCheck(false);
      });
    });

    describe('Validate Edit child tenant', () => {
      beforeEach(() => {
        createAndSelectChildTenant();
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, EDIT_TENANT_CONFIG_OPTION);
      });

      afterEach(() => {
        cy.appDbState('restore');
      });

      it('Validate Edit child tenant form elements', () => {
        validateFormElements();
        cancelFormWithOptionalFlashCheck();
      });

      it('Validate Reset & Cancel buttons on the Edit child tenant form', () => {
        updateNameAndDescription(
          EDITED_TENANT_NAME_VALUE,
          EDITED_DESCRIPTION_VALUE
        );
        resetFormAndAssertFlashMessage('button');
        verifyNameAndDescriptionValues(
          INITIAL_CHILD_TENANT_NAME,
          INITIAL_CHILD_TENANT_DESCRIPTION
        );
        cancelFormWithOptionalFlashCheck();
      });

      it('Validate Edit function', () => {
        updateNameAndDescription(
          EDITED_TENANT_NAME_VALUE,
          EDITED_DESCRIPTION_VALUE
        );
        saveFormWithOptionalFlashCheck({ apiMethod: 'PUT' });
      });
    });

    describe('Validate Add Project to child tenant', () => {
      beforeEach(() => {
        createAndSelectChildTenant();
      });

      afterEach(() => {
        cy.appDbState('restore');
      });

      it('Validate Add Project function', () => {
        addProjectToTenant();
      });

      it('Validate Removing a child tenant with a project is restricted', () => {
        addProjectToTenant();
        deleteAccordionItems([INITIAL_CHILD_TENANT_NAME]);
        cy.expect_flash(flashClassMap.error, FLASH_MESSAGE_CANT_DELETE);
      });
    });

    describe('Validate Manage Quotas in child tenant', () => {
      beforeEach(() => {
        createAndSelectChildTenant();
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, MANAGE_QUOTAS_CONFIG_OPTION);
      });

      afterEach(() => {
        cy.appDbState('restore');
      });

      it('Validate Reset & Cancel buttons in Manage Quotas form', () => {
        cy.getFormFooterButtonByTypeWithText({
          buttonText: RESET_BUTTON_TEXT,
          buttonType: 'reset',
        }).should('be.disabled');
        editQuotasTable(ALLOCATED_VM_QUOTA);
        resetFormAndAssertFlashMessage();
        cancelFormWithOptionalFlashCheck();
      });

      it('Validate Manage Quotas function', () => {
        editQuotasTable(ALLOCATED_VM_QUOTA, '10');
        saveFormWithOptionalFlashCheck();
      });
    });
  });
});
