/* eslint-disable no-undef */

const flashClassMap = {
  warning: 'warning',
  error: 'danger',
  info: 'info',
  success: 'success',
};

/**
 * Custom Cypress command to validate flash messages.
 * @param {string} alertType - Type of alert (success, warning, error, info).
 * @param {string} [containsText] - Optional text that the alert should contain.
 * @returns {Cypress.Chainable} - The alert element if found, or an assertion failure.
 */
Cypress.Commands.add(
  'expect_flash',
  (flashType = flashClassMap.success, containsText) => {
    const alertClassName = flashClassMap[flashType] || flashClassMap.success;
    const alert = cy
      .get(`#main_div #flash_msg_div .alert-${alertClassName}`)
      .should('be.visible');

    if (containsText) {
      return alert.should(($el) => {
        const actualText = $el.text().toLowerCase();
        expect(actualText).to.include(containsText.toLowerCase());
      });
    }

    return alert;
  }
);

/**
 * Custom Cypress command to validate browser confirm alerts.
 * @param {Object} options - Options for the command.
 * @param {Function<Cypress.Chainable>} options.confirmTriggerFn - A function that triggers the confirm dialog.
 *                                                                 This function **must return a Cypress.Chainable**, like `cy.get(...).click()`,
 *                                                                 so that Cypress can properly wait and chain `.then()` afterward.
 *                                                                 @example
 *                                                                 cy.expectBrowserConfirm({
 *                                                                    containsText: 'sure to proceed?',
 *                                                                    proceed: true,
 *                                                                    confirmTriggerFn: () => {
 *                                                                       return cy.get('[data-testid="delete"]').click()
 *                                                                    }
 *                                                                 });
 *                                                                 @example
 *                                                                 cy.expectBrowserConfirm({
 *                                                                    confirmTriggerFn: () => cy.contains('deleted').click()
 *                                                                 });
 * @param {string} [options.containsText] - Optional text that the confirm alert should contain.
 * @param {boolean} [options.proceed=true] - Whether to proceed with the confirm (true = OK, false = Cancel).
 */
Cypress.Commands.add(
  'expect_browser_confirm_with_text',
  ({ confirmTriggerFn, containsText, proceed = true }) => {
    let alertTriggered = false;
    cy.on('window:confirm', (actualText) => {
      alertTriggered = true;
      if (containsText) {
        expect(actualText.toLowerCase()).to.include(containsText.toLowerCase());
      }
      return proceed; // true = OK, false = Cancel
    });
    // Fires the event that triggers the confirm dialog
    confirmTriggerFn().then(() => {
      expect(alertTriggered, 'Expected browser confirm alert to be triggered')
        .to.be.true;
    });
  }
);
