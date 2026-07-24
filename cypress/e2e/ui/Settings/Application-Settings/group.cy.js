import { flashClassMap } from '../../../../support/assertions/assertion_constants';

describe('Settings > Application Settings > Access Control > Add Group', () => {
  // Menu options
  const PRIMARY_MENU_OPTION = 'Settings';
  const SECONDARY_MENU_OPTION = 'Application Settings';
  const ACCORDION = 'Access Control';
  const TOOLBAR_MENU = 'Configuration';

  // Test data
  const GROUP_DESCRIPTION = '0Test Group';
  const GROUP_DETAILED_DESCRIPTION = 'Test group detailed description';
  const GROUP_ROLE = 'EvmRole-super_administrator';
  const GROUP_TENANT = 'My Company';

  // CRUD actions
  const FLASH_MESSAGE_OPERATION_ADDED = 'saved';
  const FLASH_MESSAGE_OPERATION_CANCELLED = 'cancelled';

  beforeEach(() => {
    cy.login();
    cy.menu(PRIMARY_MENU_OPTION, SECONDARY_MENU_OPTION);
    cy.accordion(ACCORDION);
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  // WILL ADD BACK THIS TEST ONCE THE FORM IS CONVERTED REACT

  it('should enforce maximum length on description field', () => {
    cy.selectAccordionItem(['Groups']);
    cy.toolbar(TOOLBAR_MENU, 'Add a new Group');

    // Description field has maxlength of 50
    const longDescription = 'A'.repeat(60);
    cy.get('#description').clear().type(longDescription);

    // Verify only 50 characters are accepted
    cy.get('#description').invoke('val').should('have.length', 50);
  });

  it('should enforce maximum length on detailed description field', () => {
    cy.selectAccordionItem(['Groups']);
    cy.toolbar(TOOLBAR_MENU, 'Add a new Group');

    // Detailed description field has maxlength of 255
    const longDetailedDescription = 'A'.repeat(300);
    cy.get('#detailed_description').clear().type(longDetailedDescription);

    // Verify only 255 characters are accepted
    cy.get('#detailed_description').invoke('val').should('have.length', 255);
  });
});
