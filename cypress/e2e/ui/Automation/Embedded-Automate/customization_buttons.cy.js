/* eslint-disable no-undef */
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
    it('Creates a new button with role visibility', () => {
      cy.selectAccordionItem(['Object Types', 'Availability Zone', '[Unassigned Buttons]']);
      cy.toolbar('Configuration', 'Add a new Button');
      cy.get('#explorer_title_text').contains('Adding a new Button');

      cy.get('#name').type('Test Button');
      cy.get('#description').type('Test button description');

      cy.get('.icon-button').click();
      cy.get(':nth-child(1) > span > .ff').click();
      cy.get('.bx--modal-footer > .bx--btn--primary').click();

      cy.tabs({ tabLabel: 'Advanced' });

      cy.get('#object_request').scrollIntoView();
      cy.get('#object_request').type('test_request');

      cy.get('#form_role_visibility button[data-id="visibility_typ"]').scrollIntoView();
      cy.get('#form_role_visibility button[data-id="visibility_typ"]').click();
      cy.get('#form_role_visibility .dropdown-menu [data-original-index="1"] > a').click();

      cy.contains('User Roles').scrollIntoView();

      cy.interceptApi({
        alias: 'checkAuditorRole',
        urlPattern: '/miq_ae_customization/automate_button_field_changed',
        triggerFn: () => cy.get('#form_role_visibility').contains('EvmRole-auditor').closest('td').find('input[type="checkbox"]').check(),
        waitOnlyIfRequestIntercepted: true,
      });

      cy.interceptApi({
        alias: 'checkDesktopRole',
        urlPattern: '/miq_ae_customization/automate_button_field_changed',
        triggerFn: () => cy.get('#form_role_visibility').contains('EvmRole-desktop').closest('td').find('input[type="checkbox"]').check(),
        waitOnlyIfRequestIntercepted: true,
      });

      // Click Add button
      // TODO: cy.getFormButtonByTypeWithText expects this in the main_content div, but it's in the form_buttons_div
      // within the full_content div - enhance the cy.getFormButtonByTypeWithText to accept a div id or normalize the location of the button
      cy.get('#buttons_on > .btn-primary').click();
      cy.expect_flash(flashClassMap.success, 'was added');

      cy.get('.clickable-row').contains('Test Button').click();

      cy.get('#main_div').contains('Test Button');
      cy.get('#main_div').contains('test_request');
      cy.get('.visibility').contains('EvmRole-auditor');
      cy.get('.visibility').contains('EvmRole-desktop');
    });
  });
});
