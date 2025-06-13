/* eslint-disable no-undef */

describe('Settings > Application Settings > Details', () => {
  beforeEach(() => {
    cy.login();
    cy.intercept('POST', '/ops/accordion_select?id=rbac_accord').as('accordion');
    cy.menu('Settings', 'Application Settings');
    cy.get('[data-nodeid="0.0"].node-treeview-settings_tree').contains('ManageIQ Region').click();
    cy.get('#explorer_title_text');
  });

  describe('Settings Details Tab', () => {
    it('Click row and reroute', () => {
      cy.get('.bx--front-line').contains('Region 0').click({force: true});
      cy.get('.bx--label').contains('Description').should('exist');
      cy.get('[data-nodeid="0.0"].node-treeview-settings_tree').contains('ManageIQ Region').click();

      cy.get('.bx--front-line').contains('Analysis Profiles').click({force: true});
      cy.get('#explorer_title_text').contains('Settings Analysis Profiles').should('exist');
      cy.get('[data-nodeid="0.0"].node-treeview-settings_tree').contains('ManageIQ Region').click();

      cy.get('.bx--front-line').contains('Zones').click({force: true});
      cy.get('#explorer_title_text').contains('Settings Zones').should('exist');
      cy.get('[data-nodeid="0.0"].node-treeview-settings_tree').contains('ManageIQ Region').click();

      cy.get('.bx--front-line').contains('Schedules').click({force: true});
      cy.get('#explorer_title_text').contains('Settings Schedules').should('exist');
    });

    it('Updates region name when changed', () => {
      cy.get('.bx--front-line').contains('Region 0').click({force: true});
      cy.get('#description').clear().type('Region 1');
      cy.get('button.bx--btn.bx--btn--primary').contains('Save').should('not.be.disabled').click();
      cy.get('.bx--front-line').contains('Region 1').should('exist');

      // Clean up
      cy.get('.bx--front-line').contains('Region 1').click({force: true});
      cy.get('#description').clear().type('Region 0');
      cy.get('button.bx--btn.bx--btn--primary').contains('Save').should('not.be.disabled').click();
      cy.get('.bx--front-line').contains('Region 0').should('exist');
    });
  });
});
