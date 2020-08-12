// Searchbox related helpers
Cypress.Commands.add("search_box", () => {
  return cy.get('#search_text').should('be.visible');
});

Cypress.Commands.add("no_search_box", () => {
  return cy.get('#search_text').should('not.be.visible');
});
