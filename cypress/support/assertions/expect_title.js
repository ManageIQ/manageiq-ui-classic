/* eslint-disable no-undef */

// text: String for the text that should be found within an explorer page title.
Cypress.Commands.add('expect_explorer_title', (text) => {
  return cy.get('#explorer_title_text').contains(text);
});

// text: String for the text that should be found within the show_list page title
Cypress.Commands.add('expect_show_list_title', (text) => {
  return cy.get('#main-content h1').contains(text);
});
