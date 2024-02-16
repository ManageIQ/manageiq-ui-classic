/* eslint-disable no-undef */

// element: String for the Cypress selector to get a specific element on the screen.
// text: String for the text that should be found within the selected element.
Cypress.Commands.add('expect_text', (element, text) => {
  cy.get(element).then((value) => {
    expect(value[0].innerText).to.eq(text);
  });
});
