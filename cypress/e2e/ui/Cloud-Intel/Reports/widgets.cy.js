/* eslint-disable no-undef */
import { flashClassMap } from '../../../../support/assertions/assertion_constants';

describe('Cloud Intel > Reports > Widgets', () => {
  beforeEach(() => {
    cy.login();
    cy.menu('Overview', 'Reports');
    cy.get('#explorer_title_text');
    cy.accordion('Dashboard Widgets');
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  describe('Widget Creation', () => {
    it('Creates a new widget with role visibility', () => {
      cy.selectAccordionItem(['All Widgets', 'Reports']);
      cy.toolbar('Configuration', 'Add a new Widget');
      cy.get('#explorer_title_text').contains('Adding a new Widget');

      cy.get('#title').type('Test Widget');
      cy.get('#description').type('Test widget description');

      cy.interceptApi({
        alias: 'filterChanged',
        urlPattern: '/report/widget_form_field_changed',
        triggerFn: () => {
          cy.get('button[data-id="filter_typ"]').click();
          cy.get('button[data-id="filter_typ"]').parent().find('.dropdown-menu [data-original-index="1"] > a').click();
        },
        waitOnlyIfRequestIntercepted: true,
      });

      cy.interceptApi({
        alias: 'subfilterChanged',
        urlPattern: '/report/widget_form_field_changed',
        triggerFn: () => {
          cy.get('button[data-id="subfilter_typ"]').click();
          cy.get('button[data-id="subfilter_typ"]').parent().find('.dropdown-menu [data-original-index="1"] > a').click();
        },
        waitOnlyIfRequestIntercepted: true,
      });

      cy.interceptApi({
        alias: 'reportChanged',
        urlPattern: '/report/widget_form_field_changed',
        triggerFn: () => {
          cy.get('button[data-id="repfilter_typ"]').click();
          cy.get('button[data-id="repfilter_typ"]').parent().find('.dropdown-menu [data-original-index="1"] > a').click();
        },
        waitOnlyIfRequestIntercepted: true,
      });

      cy.get('button[data-id="chosen_pivot1"]').should('be.visible').and('not.be.disabled');
      cy.get('button[data-id="chosen_pivot1"]').click();
      cy.get('button[data-id="chosen_pivot1"]').parent().find('.dropdown-menu [data-original-index="1"] > a').click();

      cy.interceptApi({
        alias: 'visibilityChanged',
        urlPattern: '/report/widget_form_field_changed',
        triggerFn: () => {
          cy.get('button[data-id="visibility_typ"]').scrollIntoView();
          cy.get('button[data-id="visibility_typ"]').click();
          cy.get('button[data-id="visibility_typ"]').parent().find('.dropdown-menu [data-original-index="1"] > a').click();
        },
        waitOnlyIfRequestIntercepted: true,
      });

      cy.contains('User Roles').scrollIntoView();
      cy.get('#form_role_visibility').find('input[type="checkbox"][id^="roles_"]').should('have.length.at.least', 2);

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
      cy.get('#main_div').contains('EvmRole-auditor');
      cy.get('#main_div').contains('EvmRole-desktop');
    });

    it('Creates a new widget with group visibility', () => {
      cy.selectAccordionItem(['All Widgets', 'Reports']);
      cy.toolbar('Configuration', 'Add a new Widget');
      cy.get('#explorer_title_text').contains('Adding a new Widget');

      cy.get('#title').type('Test Widget Group');
      cy.get('#description').type('Test widget with group visibility');

      cy.interceptApi({
        alias: 'filterChanged',
        urlPattern: '/report/widget_form_field_changed',
        triggerFn: () => {
          cy.get('button[data-id="filter_typ"]').click();
          cy.get('button[data-id="filter_typ"]').parent().find('.dropdown-menu [data-original-index="1"] > a').click();
        },
        waitOnlyIfRequestIntercepted: true,
      });

      cy.interceptApi({
        alias: 'subfilterChanged',
        urlPattern: '/report/widget_form_field_changed',
        triggerFn: () => {
          cy.get('button[data-id="subfilter_typ"]').click();
          cy.get('button[data-id="subfilter_typ"]').parent().find('.dropdown-menu [data-original-index="1"] > a').click();
        },
        waitOnlyIfRequestIntercepted: true,
      });

      cy.interceptApi({
        alias: 'reportChanged',
        urlPattern: '/report/widget_form_field_changed',
        triggerFn: () => {
          cy.get('button[data-id="repfilter_typ"]').click();
          cy.get('button[data-id="repfilter_typ"]').parent().find('.dropdown-menu [data-original-index="1"] > a').click();
        },
        waitOnlyIfRequestIntercepted: true,
      });

      cy.get('button[data-id="chosen_pivot1"]').should('be.visible').and('not.be.disabled');
      cy.get('button[data-id="chosen_pivot1"]').click();
      cy.get('button[data-id="chosen_pivot1"]').parent().find('.dropdown-menu [data-original-index="1"] > a').click();

      cy.interceptApi({
        alias: 'visibilityChanged',
        urlPattern: '/report/widget_form_field_changed',
        triggerFn: () => {
          cy.get('button[data-id="visibility_typ"]').scrollIntoView();
          cy.get('button[data-id="visibility_typ"]').click();
          cy.get('button[data-id="visibility_typ"]').parent().find('.dropdown-menu [data-original-index="2"] > a').click();
        },
        waitOnlyIfRequestIntercepted: true,
      });

      cy.contains('Groups').scrollIntoView();
      cy.get('#form_role_visibility').find('input[type="checkbox"][id^="groups_"]').should('have.length.at.least', 2);

      cy.interceptApi({
        alias: 'checkFirstGroup',
        urlPattern: '/report/widget_form_field_changed',
        triggerFn: () => cy.get('#form_role_visibility').find('input[type="checkbox"][id^="groups_"]').eq(0).check(),
        waitOnlyIfRequestIntercepted: true,
      });

      cy.interceptApi({
        alias: 'checkSecondGroup',
        urlPattern: '/report/widget_form_field_changed',
        triggerFn: () => cy.get('#form_role_visibility').find('input[type="checkbox"][id^="groups_"]').eq(1).check(),
        waitOnlyIfRequestIntercepted: true,
      });

      cy.get('#form_role_visibility').find('input[type="checkbox"][id^="groups_"]').eq(0).closest('td').invoke('text').then((group1Text) => {
        cy.get('#form_role_visibility').find('input[type="checkbox"][id^="groups_"]').eq(1).closest('td').invoke('text').then((group2Text) => {
          const group1 = group1Text.trim();
          const group2 = group2Text.trim();

          cy.get('#buttons_on > .btn-primary').click();
          cy.expect_flash(flashClassMap.success, 'was saved');

          cy.get('.clickable-row').contains('Test Widget Group').click();

          cy.get('#main_div').contains('Test Widget Group');
          cy.get('#main_div').contains(group1);
          cy.get('#main_div').contains(group2);
        });
      });
    });
  });
});
