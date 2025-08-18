/* eslint-disable no-undef */

// selectId: String of the ID of the select element to interact with.
// optionToSelect: String of the option to select from the dropdown.
Cypress.Commands.add('changeSelect', (selectId, optionToSelect) => {
  cy.get(`#${selectId}`).click();
  cy.get('.bx--list-box__menu-item__option').then((options) => {
    const optionArray = Cypress.$.makeArray(options);
    const match = optionArray.find((el) => el.innerText.trim() === optionToSelect);
    if (match) {
      cy.wrap(match).click();
    } else {
      throw new Error('No match');
    }
  });
});
