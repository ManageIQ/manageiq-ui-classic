/* eslint-disable no-undef */
import { flashClassMap } from '../../../../support/assertions/assertion_constants';

describe('Cloud Intel > Reports > Widgets', () => {
  beforeEach(() => {
    cy.login();
    cy.menu('Cloud Intel', 'Reports');
    cy.get('#explorer_title_text');
    cy.accordion('Widgets');
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  describe('Widget Creation', () => {
    it('Creates a new widget with role visibility', () => {
      cy.selectAccordionItem(['Report Widgets']);
      cy.toolbar('Configuration', 'Add a new Widget');
      cy.get('#explorer_title_text').contains('Adding a new Widget');

      cy.get('#title').type('Test Widget');
      cy.get('#description').type('Test widget description');

      cy.get('button[data-id="repfilter_typ"]').click();
      cy.get('.dropdown-menu [data-original-index="1"] > a').click();

      cy.get('button[data-id="visibility_typ"]').scrollIntoView();
      cy.get('button[data-id="visibility_typ"]').click();
      cy.get('.dropdown-menu [data-original-index="1"] > a').click();

      cy.contains('User Roles').scrollIntoView();

      cy.interceptApi({
        alias: 'checkAuditorRole',
        urlPattern: '/report/widget_form_field_changed',
        triggerFn: () => cy.get('#form_role_visibility').contains('EvmRole-auditor').closest('td').find('input[type="checkbox"]').check(),
        waitOnlyIfRequestIntercepted: true,
      });

      cy.interceptApi({
        alias: 'checkDesktopRole',
        urlPattern: '/report/widget_form_field_changed',
        triggerFn: () => cy.get('#form_role_visibility').contains('EvmRole-desktop').closest('td').find('input[type="checkbox"]').check(),
        waitOnlyIfRequestIntercepted: true,
      });

      cy.get('#buttons_on > .btn-primary').click();
      cy.expect_flash(flashClassMap.success, 'was saved');

      cy.get('.clickable-row').contains('Test Widget').click();

      cy.get('#main_div').contains('Test Widget');
      cy.get('.visibility').contains('EvmRole-auditor');
      cy.get('.visibility').contains('EvmRole-desktop');
    });
  });
});
