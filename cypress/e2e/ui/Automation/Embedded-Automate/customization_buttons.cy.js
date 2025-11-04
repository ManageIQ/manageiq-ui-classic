/* eslint-disable no-undef */
import { flashClassMap } from '../../../../support/assertions/assertion_constants';

describe('Automation > Embedded Automate > Customization > Buttons', () => {
  beforeEach(() => {
    cy.login();
    cy.menu('Automation', 'Embedded Automate', 'Customization');
    cy.get('#explorer_title_text');

    // Navigate to Buttons accordion
    cy.accordion('Buttons');
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  describe('Button Creation', () => {
    it('Creates a new button for Availability Zone', () => {
      // Navigate through the accordion: Object Types > Availability Zone > [Unassigned Buttons]
      cy.selectAccordionItem(['Object Types', 'Availability Zone', '[Unassigned Buttons]']);

      // Use toolbar command to add a new button
      cy.toolbar('Configuration', 'Add a new Button');

      // Verify we're on the add button page
      cy.get('#explorer_title_text').contains('Adding a new Button');

      // Fill in name and description with hardcoded values
      cy.get('#name').type('Test Availability Zone Button');
      cy.get('#description').type('Test button for availability zone');

      // Select an icon from the dropdown
      cy.get('.icon-button').click();
      cy.get(':nth-child(1) > span > .ff').click();
      cy.get('.bx--modal-footer > .bx--btn--primary').click();

      // Click the Advanced tab
      cy.tabs({ tabLabel: 'Advanced' });

      // Scroll to object details part of the form and fill in the request field
      cy.get('#object_request').scrollIntoView();
      cy.get('#object_request').type('test_request');

      // Click Add button
      cy.get('#buttons_on > .btn-primary').click();

      // Verify flash message that button was added
      cy.expect_flash(flashClassMap.success, 'was added');

      // Verify the button was added successfully by clicking it in the accordion
      cy.get('.clickable-row').contains('Test Availability Zone Button').click();

      // Verify the name, description, and request are displayed correctly in the main div
      cy.get('#main_div').contains('Test Availability Zone Button');
      cy.get('#main_div').contains('Test button for availability zone');
      cy.get('#main_div').contains('test_request');
    });
  });
});
