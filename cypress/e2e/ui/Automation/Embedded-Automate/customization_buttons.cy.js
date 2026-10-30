import { flashClassMap } from '../../../../support/assertions/assertion_constants';

const BUTTON_FACTORY_ATTRS = {
  applies_to_class: 'AvailabilityZone',
  options: { button_type: 'default', display_for: 'single', submit_how: 'one', display: true },
  uri_path: '/System/Process/Request',
  uri_attributes: { request: 'original_request' },
  uri_message: 'create',
};

const navigateToUnassignedButtons = () => {
  cy.selectAccordionItem(['Object Types', 'Availability Zone']);
  cy.selectAccordionItem(['Object Types', 'Availability Zone', '[Unassigned Buttons]']);
};

describe('Automation > Embedded Automate > Customization > Buttons', () => {
  afterEach(() => {
    cy.appDbState('restore');
  });

  it('creates a button', () => {
    cy.login();
    cy.menu('Automation', 'Embedded Automate', 'Customization');
    cy.accordion('Buttons');
    navigateToUnassignedButtons();
    cy.toolbar('Configuration', 'Add a new Button');

    cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type('Test Button');
    cy.getFormInputFieldByIdAndType({ inputId: 'description' }).type('Test Button Description');

    cy.tabs({ tabLabel: 'Advanced' });
    cy.getFormInputFieldByIdAndType({ inputId: 'request' }).type('test_request');

    cy.interceptApi({
      alias: 'createButtonApi',
      urlPattern: /\/api\/custom_buttons\/?$/,
      triggerFn: () =>
        cy.getFormButtonByTypeWithText({ buttonText: 'Add', buttonType: 'submit' }).click(),
    });

    cy.expect_flash(flashClassMap.success, 'Test Button');
  });

  it('edits a button', () => {
    cy.appFactories([
      ['create', 'custom_button', { ...BUTTON_FACTORY_ATTRS, name: 'Edit Test Button', description: 'Original description' }],
    ]);
    cy.login();
    cy.menu('Automation', 'Embedded Automate', 'Customization');
    cy.accordion('Buttons');
    navigateToUnassignedButtons();

    cy.get('.clickable-row').contains('Edit Test Button').should('be.visible').click();
    cy.toolbar('Configuration', 'Edit this Button');

    cy.getFormInputFieldByIdAndType({ inputId: 'name' }).clear().type('Renamed Button');

    cy.interceptApi({
      method: 'PUT',
      alias: 'editButtonApi',
      urlPattern: /\/api\/custom_buttons\/\d+$/,
      triggerFn: () =>
        cy.getFormButtonByTypeWithText({ buttonText: 'Save', buttonType: 'submit' }).click(),
    });

    cy.expect_flash(flashClassMap.success, 'Renamed Button');
  });

  it('deletes a button', () => {
    cy.appFactories([
      ['create', 'custom_button', { ...BUTTON_FACTORY_ATTRS, name: 'Delete Test Button', description: 'To be deleted' }],
    ]);
    cy.login();
    cy.menu('Automation', 'Embedded Automate', 'Customization');
    cy.accordion('Buttons');
    navigateToUnassignedButtons();

    cy.get('.clickable-row').contains('Delete Test Button').should('be.visible').click();
    cy.toolbar('Configuration', 'Remove this Button');

    cy.expect_modal({ modalHeaderText: 'Delete Button', modalContentExpectedTexts: ['Delete Test Button'], targetFooterButtonText: 'Delete' });

    cy.expect_flash(flashClassMap.success, 'deleted');
  });
});
