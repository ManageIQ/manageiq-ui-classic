/* eslint-disable no-undef */

const textConstants = {
  // Menu options
  settingsMenuOption: 'Settings',
  appSettingsMenuOption: 'Application Settings',
  toolBarConfigMenu: 'Configuration',

  // added item information
  initialTenantName: 'Test-name',
  initialTenantDescription: 'test description',

  // List items
  accessControlAccordion: 'Access Control',

  // flash message assertions
  flashMessageOperationAdded: 'added',
  flashMessageOperationDeleted: 'delete',
  flashTypeSuccess: 'success',

  // Configuration menu options and browser alert text snippets
  deleteItem: 'Delete this item',
}

const {
  accessControlAccordion,
  appSettingsMenuOption,
  deleteItem,
  flashMessageOperationAdded,
  flashMessageOperationDeleted,
  flashTypeSuccess,
  initialTenantDescription,
  initialTenantName,
  settingsMenuOption,
  toolBarConfigMenu,
} = textConstants;

describe('Settings > Application Settings > Access Control', () => {
  beforeEach(() => {
    cy.login();
    cy.menu(settingsMenuOption, appSettingsMenuOption);
    cy.accordion(accessControlAccordion);
  });

  it('should be able to create and delete a tenant', () => {
    cy.selectAccordionItem([
       /^ManageIQ Region/,
       'Tenants',
       'My Company',
    ]);

    cy.toolbar(toolBarConfigMenu, 'Add child Tenant to this Tenant');
    cy.getFormInputFieldById('name').type(initialTenantName);
    cy.getFormInputFieldById('description').type(initialTenantDescription);
    cy.getFormFooterButtonByType('Add', 'submit').click();
    cy.expect_flash(flashTypeSuccess, flashMessageOperationAdded);
    cy.selectAccordionItem([
       /^ManageIQ Region/,
       'Tenants',
       'My Company',
       initialTenantName
    ]);

    cy.expect_browser_confirm_with_text({
      confirmTriggerFn: () => cy.toolbar(toolBarConfigMenu, deleteItem),
      containsText: deleteItem,
    });
    cy.expect_flash(flashTypeSuccess, flashMessageOperationDeleted);
  });
});
