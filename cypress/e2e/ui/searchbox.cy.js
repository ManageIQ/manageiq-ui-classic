/* eslint-disable no-undef */
describe('Search box', () => {
  beforeEach(() => {
    cy.viewport(1280, 800);
    cy.login();
  });

  it('menu search', () => {
    cy.get('.menu-search').get('input').type('Catalog');
    cy.get('.menu-results').contains('Results 1');
    cy.get('.menu-results').get('#menu_item_catalogs');
  });

  it('is present on list view page', () => {
    cy.menu('Compute', 'Clouds', 'Providers');
    cy.get('#search_text').first().click();
    cy.search_box();
  });

  it('is present on explorer page', () => {
    cy.menu('Services', 'Workloads');
    cy.get('div[class=panel-heading]').first().click();
    cy.search_box();
  });

  it('is not present on non-list page', () => {
    cy.menu('Overview', 'Dashboard');
    cy.no_search_box();
  });

  it('is not present on list view page', () => {
    cy.menu('Control', 'Alerts');
    cy.no_search_box();
  });
});
