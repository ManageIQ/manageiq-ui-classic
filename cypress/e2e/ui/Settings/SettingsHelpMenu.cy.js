/* eslint-disable no-undef */

describe('Settings > Application Settings > Settings', () => {
  beforeEach(() => {
    cy.login();
    cy.intercept('POST', '/ops/accordion_select?id=rbac_accord').as('accordion');
    cy.menu('Settings', 'Application Settings');
  });

  describe('Help Menu Form', () => {
    beforeEach(() => {
      cy.contains('ManageIQ Region').click({ force: true });
      cy.contains('Help Menu').click({ force: true });
    });

    it('Changes menu title', () => {
      cy.get('[name="item_label_1"]').clear({ force: true });
      cy.get('[name="item_label_1"]').type('changed', {force: true});
      cy.contains('Save').click({ force: true });
      cy.get('[name="item_label_1"]').should('have.value', 'changed');
      cy.get('[name="item_label_1"]').clear();
      cy.contains('Save').click({ force: true });
    });

    it('Changes url', () => {
      cy.get('[name="url_1"]').clear({ force: true });
      cy.get('[name="url_1"]').type('changed', {force: true});
      cy.contains('Save').click({ force: true });
      cy.get('[name="url_1"]').should('have.value', 'changed');
      cy.get('[name="url_1"]').clear();
      cy.contains('Save').click({ force: true });
    });

    it('Changes dropdown', () => {
      cy.get('#select_dropdown_1').invoke('val', 'default').trigger('change', { force: true });
      cy.contains('Save').click({ force: true });
      cy.get('[name="select_dropdown_1"]').should('have.value', 'default');
      cy.get('[name="select_dropdown_1"]').select('new_window', { force: true });
      cy.contains('Save').click({ force: true });
    });
  });
});
