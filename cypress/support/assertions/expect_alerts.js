/* eslint-disable no-undef */
import { flashClassMap } from './assertion_constants';

/**
 * Custom Cypress command to validate flash messages.
 * @param {string} flashType - Type of flash. Use values from flashClassMap (e.g., flashClassMap.success, flashClassMap.error).
 * @param {string} [containsText] - Optional text that the flash-message should contain.
 * @returns {Cypress.Chainable} - The flash-message element if found, or an assertion failure.
 * @example
 * cy.expect_flash(flashClassMap.success);
 * cy.expect_flash(flashClassMap.error, 'failed');
 */
Cypress.Commands.add(
  'expect_flash',
  (flashType = flashClassMap.success, containsText) => {
    if (Object.values(flashClassMap).includes(flashType)) {
      const flashMessageElement = cy
        .get(`#main_div .alert-${flashType}`)
        .should('be.visible');

      if (containsText) {
        return flashMessageElement.should((flash) => {
          const actualText = flash.text().toLowerCase();
          expect(actualText).to.include(containsText.toLowerCase());
        });
      }

      return flashMessageElement;
    }

    // If an invalid flash type is passed, throw an error
    cy.logAndThrowError(
      `Invalid flash type: "${flashType}". Valid flash types are: ${Object.values(
        flashClassMap
      ).join(
        ', '
      )}. It is recommended to use flashClassMap values (e.g., flashClassMap.error, flashClassMap.success) to pass flash types.`
    );
  }
);

/**
 * Custom Cypress command to validate browser confirm alerts.
 * @param {Object} options - Options for the command.
 * @param {Function<Cypress.Chainable>} options.confirmTriggerFn - A function that triggers the confirm dialog.
 *                                                                 This function **must return a Cypress.Chainable**, like `cy.get(...).click()`,
 *                                                                 so that Cypress can properly wait and chain `.then()` afterward.
 *                                                                 @example
 *                                                                 cy.expect_browser_confirm_with_text({
 *                                                                    containsText: 'sure to proceed?',
 *                                                                    proceed: true,
 *                                                                    confirmTriggerFn: () => {
 *                                                                       return cy.get('[data-testid="delete"]').click()
 *                                                                    }
 *                                                                 });
 *                                                                 @example
 *                                                                 cy.expect_browser_confirm_with_text({
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
