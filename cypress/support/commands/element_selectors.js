/* eslint-disable no-undef */

/**
 * Retrieves a form footer button by its name and type.
 *
 * @param {string} name - The name or text content of the button.
 * @param {string} [type='button'] - The HTML button type (e.g., 'button', 'submit', 'reset'). Defaults to 'button'.
 * @returns {Element} The matched button element.
 *
 * Example:
 *   cy.getFormFooterButtonByType('Save Changes');
 *   cy.getFormFooterButtonByType('Reset', 'reset');
 */
Cypress.Commands.add('getFormFooterButtonByType', (name, type = 'button') =>
  cy.contains(`#main-content .bx--btn-set button[type="${type}"]`, name)
);

/**
 * Retrieves a form input field by its ID and type.
 *
 * @param {string} inputId - The ID of the input field.
 * @param {string} [type='text'] - The HTML input type (e.g., 'text', 'email', 'password'). Defaults to 'text'.
 * @returns {Element} The matched input field element.
 *
 * Example:
 *   cy.getFormInputFieldById('name');
 *   cy.getFormInputFieldById('name', 'text');
 */
Cypress.Commands.add('getFormInputFieldById', (inputId, type = 'text') =>
  cy.get(`#main-content .bx--form input#${inputId}[type="${type}"]`)
);

/**
 * Retrieves a form label associated with a specific input field by its ID.
 *
 * @param {string} inputId - The ID of the input field.
 * @returns {Element} The matched label element.
 *
 * Example:
 *   cy.getFormLabelByInputId('name');
 */
Cypress.Commands.add('getFormLabelByInputId', (inputId) =>
  cy.get(`#main-content .bx--form label[for="${inputId}"]`)
);

/**
 * Retrieves a form select field by its ID.
 *
 * @param {string} selectId - The ID of the select field.
 * @returns {Element} The matched select field element.
 *
 * Example:
 *   cy.getFormSelectFieldById('select-scan-limit');
 */
Cypress.Commands.add('getFormSelectFieldById', (selectId) =>
  cy.get(`#main-content .bx--form select#${selectId}`)
);
