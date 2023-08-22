/* eslint-disable no-undef */
Cypress.Commands.add('expect_text', (element, text) => {
  cy.get(element).then((value) => {
    expect(value[0].innerText).to.eq(text);
  });
});
