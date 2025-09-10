/* eslint-disable no-undef */
import { flashClassMap } from '../../../../support/assertions/assertion_constants';

describe('Settings > Application Settings > Access Control', () => {
  // Navigation
  const PRIMARY_MENU_OPTION = 'Settings';
  const SECONDARY_MENU_OPTION = 'Application Settings';
  const ACCORDION = 'Access Control';
  const TOOLBAR_MENU = 'Configuration';

  // Created item information
  const INITIAL_TENANT_NAME = 'Test-name';
  const INITIAL_TENANT_DESCRIPTION = 'test description';

  // CRUD actions
  const FLASH_MESSAGE_OPERATION_ADDED = 'added';
  const FLASH_MESSAGE_OPERATION_DELETED = 'delete';
  const DELETE_ITEM = 'Delete this item';

  beforeEach(() => {
    cy.login();
    cy.menu(PRIMARY_MENU_OPTION, SECONDARY_MENU_OPTION);
    cy.accordion(ACCORDION);
  });

  it('should be able to create and delete a tenant', () => {
    cy.selectAccordionItem([
       /^ManageIQ Region/,
       'Tenants',
       'My Company',
    ]);

    cy.toolbar(TOOLBAR_MENU, 'Add child Tenant to this Tenant');
    cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type(
      INITIAL_TENANT_NAME
    );
    cy.getFormInputFieldByIdAndType({ inputId: 'description' }).type(
      INITIAL_TENANT_DESCRIPTION
    );
    cy.getFormFooterButtonByTypeWithText({
      buttonText: 'Add',
      buttonType: 'submit',
    }).click();
    cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_OPERATION_ADDED);
    cy.selectAccordionItem([
       /^ManageIQ Region/,
       'Tenants',
       'My Company',
       INITIAL_TENANT_NAME
    ]);

    cy.expect_browser_confirm_with_text({
      confirmTriggerFn: () => cy.toolbar(TOOLBAR_MENU, DELETE_ITEM),
      containsText: DELETE_ITEM,
    });
    cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_OPERATION_DELETED);
  });
});
