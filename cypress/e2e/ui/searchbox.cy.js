/* eslint-disable no-undef */
describe('Search box', () => {
  beforeEach(() => {
    cy.login();
  });

  it('Menu search', () => {
    cy.menu('Overview', 'Dashboard');
    cy.get('.menu-search').get('input').type('Catalog');
    cy.get('.menu-results').contains('Results 1');
    cy.get('.menu-results').get('#menu_item_catalogs');
  });

  it('Is present on list view page', () => {
    cy.menu('Compute', 'Clouds', 'Providers');
    cy.expect_search_box();
  });

  it('Is present on explorer page', () => {
    cy.menu('Services', 'Workloads');
    cy.expect_search_box();
  });

  it('Is not present on non-list page', () => {
    cy.menu('Overview', 'Dashboard');
    cy.expect_no_search_box();
  });

  it('Is not present on list view page', () => {
    cy.menu('Control', 'Alerts');
    cy.expect_no_search_box();
  });
});
