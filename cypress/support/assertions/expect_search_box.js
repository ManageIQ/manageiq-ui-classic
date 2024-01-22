/* eslint-disable no-undef */

Cypress.Commands.add('expect_search_box', () => {
  return cy.get('#search_text').should('be.visible');
});

Cypress.Commands.add('expect_no_search_box', () => {
  return cy.get('#search_text').should('not.exist');
});
