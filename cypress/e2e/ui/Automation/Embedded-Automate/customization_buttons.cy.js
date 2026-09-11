import { flashClassMap } from '../../../../support/assertions/assertion_constants';

describe('Automation > Embedded Automate > Customization > Buttons', () => {
  beforeEach(() => {
    cy.login();
    cy.menu('Automation', 'Embedded Automate', 'Customization');
    cy.get('#explorer_title_text');
    cy.accordion('Buttons');
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  describe('Button Creation', () => {
    it('creates a new button and shows it in the tree', () => {
      cy.selectAccordionItem(['Object Types', 'Availability Zone', '[Unassigned Buttons]']);
      cy.toolbar('Configuration', 'Add a new Button');
      cy.get('#explorer_title_text').contains('Adding a new Button');

      // Options tab — fill required fields
      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type('Test Button');
      cy.getFormInputFieldByIdAndType({ inputId: 'description' }).type('Test Button Description');

      // Advanced tab — fill required Request field
      cy.tabs({ tabLabel: 'Advanced' });
      cy.getFormInputFieldByIdAndType({ inputId: 'request' }).type('test_request');

      cy.getFormButtonByTypeWithText({ buttonText: 'Add', buttonType: 'submit' }).click();

      // Flash message confirms success
      cy.expect_flash(flashClassMap.success, 'Test Button');

      // Button appears in the tree and its detail view is correct
      cy.get('.clickable-row').contains('Test Button').click();
      cy.get('#main_div').contains('Test Button');
      cy.get('#main_div').contains('Test Button Description');
    });

    it('cancels adding a button and returns to the tree', () => {
      cy.selectAccordionItem(['Object Types', 'Availability Zone', '[Unassigned Buttons]']);
      cy.toolbar('Configuration', 'Add a new Button');
      cy.get('#explorer_title_text').contains('Adding a new Button');

      cy.getFormButtonByTypeWithText({ buttonText: 'Cancel' }).click();

      cy.expect_flash(flashClassMap.warning, 'cancelled');
    });
  });

  describe('Button Edit', () => {
    beforeEach(() => {
      cy.appFactories([
        ['create', 'custom_button', {
          applies_to_class: 'AvailabilityZone',
          name: 'Edit Test Button',
          description: 'Original description',
          options: { button_type: 'default', display_for: 'single', submit_how: 'one', display: true },
          uri_path: '/System/Process/Request',
          uri_attributes: { request: 'original_request' },
          uri_message: 'create',
        }],
      ]);
    });

    it('edits an existing button and saves', () => {
      cy.selectAccordionItem(['Object Types', 'Availability Zone', '[Unassigned Buttons]']);
      cy.get('.clickable-row').contains('Edit Test Button').click();
      cy.toolbar('Configuration', 'Edit this Button');
      cy.get('#explorer_title_text').contains('Editing Button');

      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).clear().type('Renamed Button');
      cy.getFormInputFieldByIdAndType({ inputId: 'description' }).clear().type('Updated description');

      cy.getFormButtonByTypeWithText({ buttonText: 'Save', buttonType: 'submit' }).click();

      cy.expect_flash(flashClassMap.success, 'Renamed Button');

      cy.get('#main_div').contains('Renamed Button');
      cy.get('#main_div').contains('Updated description');
    });

    it('resets edits back to saved values', () => {
      cy.selectAccordionItem(['Object Types', 'Availability Zone', '[Unassigned Buttons]']);
      cy.get('.clickable-row').contains('Edit Test Button').click();
      cy.toolbar('Configuration', 'Edit this Button');

      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).clear().type('This Should Be Reverted');
      cy.getFormButtonByTypeWithText({ buttonText: 'Reset' }).click();

      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).should('have.value', 'Edit Test Button');
    });

    it('cancels editing and returns to the detail view', () => {
      cy.selectAccordionItem(['Object Types', 'Availability Zone', '[Unassigned Buttons]']);
      cy.get('.clickable-row').contains('Edit Test Button').click();
      cy.toolbar('Configuration', 'Edit this Button');

      cy.getFormButtonByTypeWithText({ buttonText: 'Cancel' }).click();

      cy.expect_flash(flashClassMap.warning, 'cancelled');
      cy.get('#main_div').contains('Edit Test Button');
    });
  });

  describe('Role visibility', () => {
    it('creates a button with role-based visibility and shows the roles on the detail page', () => {
      cy.selectAccordionItem(['Object Types', 'Availability Zone', '[Unassigned Buttons]']);
      cy.toolbar('Configuration', 'Add a new Button');

      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type('Role Button');
      cy.getFormInputFieldByIdAndType({ inputId: 'description' }).type('Role Button Description');

      cy.tabs({ tabLabel: 'Advanced' });
      cy.getFormInputFieldByIdAndType({ inputId: 'request' }).type('role_request');

      // Switch Role Access from "To All" to "By Role"
      cy.get('#visibility\\.roles').click();
      cy.get('[data-value="role"]').click();

      // Select EvmRole-auditor from the User Roles multi-select
      cy.get('#available_roles').click();
      cy.get('[data-value="EvmRole-auditor"]').click();
      cy.get('#available_roles').click(); // close dropdown

      cy.getFormButtonByTypeWithText({ buttonText: 'Add', buttonType: 'submit' }).click();
      cy.expect_flash(flashClassMap.success, 'Role Button');

      cy.get('.clickable-row').contains('Role Button').click();
      cy.get('.visibility').contains('EvmRole-auditor');
    });
  });
});
