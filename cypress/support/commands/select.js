/* eslint-disable no-undef */

// selectId: String of the ID of the select element to interact with.
// optionToSelect: String of the option to select from the dropdown.
Cypress.Commands.add('changeSelect', (selectId, optionToSelect) => {
  // First, get the select element and store its text
  let selectElementText = '';
  cy.get(`[id="${selectId}"]`).then((selectElement) => {
    // Get the currently displayed text in the select element
    selectElementText = selectElement.text().trim();
    // Click to open the dropdown
    cy.wrap(selectElement).click();
  }).then(() => {
    // Now find the options and try to select the requested one
    cy.get('.bx--list-box__menu-item__option').then((options) => {
      const optionArray = Cypress.$.makeArray(options);
      const match = optionArray.find((el) => el.innerText.trim() === optionToSelect);

      if (match) {
        cy.wrap(match).click();
      } else {
        // Include both the requested option and the select element's text in the error
        cy.logAndThrowError(
          `Could not find "${optionToSelect}" in select element with text "${selectElementText}"`
        );
      }
    });
  });
});
