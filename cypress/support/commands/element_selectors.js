/**
 * Retrieves a form footer button by its text content and type using an object parameter.
 *
 * @param {Object} options - The options object.
 * @param {string} options.buttonText - The text content of the button (required).
 * @param {string} [options.buttonType='button'] - The HTML button type (e.g., 'button', 'submit', 'reset'). Defaults to 'button'.
 * @param {string} [options.buttonWrapperClass='bx--btn-set'] - The CSS class of the wrapper element containing the buttons. Defaults to 'bx--btn-set'.
 * @returns {Element} The matched button element.
 * @throws {Error} If buttonText is not provided.
 *
 * Example:
 *   cy.getFormFooterButtonByTypeWithText({ buttonText: 'Save Changes' });
 *   cy.getFormFooterButtonByTypeWithText({ buttonText: 'Submit', buttonType: 'submit' });
 *   cy.getFormFooterButtonByTypeWithText({ buttonText: 'Cancel', buttonWrapperClass: 'custom-wrapper' });
 */
Cypress.Commands.add(
  'getFormFooterButtonByTypeWithText',
  ({ buttonType = 'button', buttonText, buttonWrapperClass = 'bx--btn-set' } = {}) => {
    if (!buttonText) {
      cy.logAndThrowError('buttonText is required');
    }
    return cy.contains(
      `#main-content .${buttonWrapperClass} button[type="${buttonType}"]`,
      buttonText
    );
  }
);

/**
 * Retrieves a form input field by its ID and type using an object parameter.
 *
 * @param {Object} options - The options object.
 * @param {string} options.inputId - The ID of the input field (required).
 * @param {string} [options.inputType='text'] - The HTML input inputType (e.g., 'text', 'email', 'password'). Defaults to 'text'.
 * @returns {Element} The matched input field element.
 * @throws {Error} If inputId is not provided.
 *
 * Example:
 *   cy.getFormInputFieldByIdAndType({ inputId: 'name' });
 *   cy.getFormInputFieldByIdAndType({ inputId: 'password', inputType: 'password' });
 */
Cypress.Commands.add(
  'getFormInputFieldByIdAndType',
  ({ inputId, inputType = 'text' }) => {
    if (!inputId) {
      cy.logAndThrowError('inputId is required');
    }
    return cy.get(
      `#main-content form input[id="${inputId}"][type="${inputType}"]`
    );
  }
);

/**
 * Retrieves a form label associated with a specific input field by its 'for' attribute.
 *
 * @param {Object} options - The options object.
 * @param {string} options.forValue - The value of the 'for' attribute that matches the input field's ID (required).
 * @returns {Element} The matched label element.
 * @throws {Error} If forValue is not provided.
 *
 * Example:
 *   cy.getFormLabelByForAttribute({ forValue: 'name' });
 */
Cypress.Commands.add('getFormLabelByForAttribute', ({ forValue }) => {
  if (!forValue) {
    cy.logAndThrowError('forValue is required');
  }
  return cy.get(`#main-content form label[for="${forValue}"]`);
});

/**
 * Retrieves a form legend element by its text content.
 *
 * @param {Object} options - The options object.
 * @param {string} options.legendText - The text content of the legend element (required).
 * @returns {Element} The matched legend element.
 * @throws {Error} If legendText is not provided.
 *
 * Example:
 *   cy.getFormLegendByText({ legendText: 'Personal Information' });
 *   cy.getFormLegendByText({ legendText: 'Payment Details' });
 */
Cypress.Commands.add('getFormLegendByText', ({ legendText }) => {
  if (!legendText) {
    cy.logAndThrowError('legendText is required');
  }
  return cy.contains('#main-content form legend.bx--label', legendText);
});

/**
 * Retrieves a form select field by its ID using an object parameter.
 *
 * @param {Object} options - The options object.
 * @param {string} options.selectId - The ID of the select field (required).
 * @returns {Element} The matched select field element.
 * @throws {Error} If selectId is not provided.
 *
 * Example:
 *   cy.getFormSelectFieldById({ selectId: 'select-scan-limit' });
 */
Cypress.Commands.add('getFormSelectFieldById', ({ selectId }) => {
  if (!selectId) {
    cy.logAndThrowError('selectId is required');
  }
  return cy.get(`#main-content form select[id="${selectId}"]`);
});

/**
 * Retrieves a form textarea field by its ID using an object parameter.
 *
 * @param {Object} options - The options object.
 * @param {string} options.textareaId - The ID of the textarea field (required).
 * @returns {Element} The matched textarea field element.
 * @throws {Error} If textareaId is not provided.
 *
 * Example:
 *   cy.getFormTextareaById({ textareaId: 'default.auth_key' });
 */
Cypress.Commands.add('getFormTextareaById', ({ textareaId }) => {
  if (!textareaId) {
    cy.logAndThrowError('textareaId is required');
  }
  return cy.get(`#main-content form textarea[id="${textareaId}"]`);
});
