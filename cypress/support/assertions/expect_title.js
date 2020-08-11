Cypress.Commands.add("expect_explorer_title", (text) => {
  return cy.get('#explorer_title_text').contains(text);
});

Cypress.Commands.add("expect_show_list_title", (text) => {
  return cy.get('#main-content h1').contains(text);
});
