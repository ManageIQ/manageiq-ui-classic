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
      cy.get('.cds--modal-container').should('be.visible');
      cy.get(':nth-child(1) > span > .ff').click();
      cy.get('.cds--modal-footer > .cds--btn--primary').click();

      cy.tabs({ tabLabel: 'Advanced' });

      cy.get('#object_request').scrollIntoView();
      cy.get('#object_request').type('test_request');

      cy.interceptApi({
        alias: 'visibilityChanged',
        urlPattern: '/miq_ae_customization/automate_button_field_changed',
        triggerFn: () => {
          cy.get('#form_role_visibility button[data-id="visibility_typ"]').scrollIntoView();
          cy.get('#form_role_visibility button[data-id="visibility_typ"]').click();
          cy.get('#form_role_visibility .dropdown-menu [data-original-index="1"] > a').click();
        },
        waitOnlyIfRequestIntercepted: true,
      });

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

      // TODO: cy.getFormButtonByTypeWithText expects button in main_content div, but it's in form_buttons_div
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
