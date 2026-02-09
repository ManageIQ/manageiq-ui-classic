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
      `cy.expect_flash: Invalid flash type: "${flashType}". Valid flash types are: ${Object.values(
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
    cy.once('window:confirm', (actualText) => {
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

/**
 * Custom Cypress command to validate and interact with modal dialogs.
 * This command verifies the modal content and clicks a specified button in the modal footer.
 *
 * @param {Object} options - Options for the command.
 * @param {string} [options.modalHeaderText] - Optional text to verify in the modal header.
 * @param {string[]} [options.modalContentExpectedTexts] - Optional array of text strings that should be present in the modal content.
 * @param {string} options.targetFooterButtonText - Text of the button in the modal footer to click (required).
 *
 * @example
 * // Verify a confirmation modal and click "Confirm"
 * cy.expect_modal({
 *   modalHeaderText: 'Confirmation',
 *   modalContentExpectedTexts: ['Are you sure you want to proceed?'],
 *   targetFooterButtonText: 'Confirm'
 * });
 *
 * @example
 * // Verify a modal with multiple content texts and click "Cancel"
 * cy.expect_modal({
 *   modalHeaderText: 'Warning',
 *   modalContentExpectedTexts: [
 *     'action cannot be undone',
 *     'data will be permanently deleted'
 *   ],
 *   targetFooterButtonText: 'Cancel'
 * });
 *
 * @example
 * // Just click "OK" in a modal without verifying content
 * cy.expect_modal({
 *   targetFooterButtonText: 'OK'
 * });
 */
Cypress.Commands.add(
  'expect_modal',
  ({
    modalHeaderText,
    modalContentExpectedTexts = [],
    targetFooterButtonText,
  }) => {
    if (!targetFooterButtonText) {
      cy.logAndThrowError(
        'cy.expect_modal: targetFooterButtonText must be provided to identify the button that dismisses the modal'
      );
    }

    if (modalHeaderText) {
      cy.get('.cds--modal-container .cds--modal-header').should((header) => {
        const headerText = header.text().toLowerCase();
        expect(headerText).to.include(modalHeaderText.toLowerCase());
      });
    }

    if (modalContentExpectedTexts && modalContentExpectedTexts.length) {
      modalContentExpectedTexts.forEach((text) => {
        cy.get('.cds--modal-container .cds--modal-content').should((content) => {
          const contentText = content.text().toLowerCase();
          expect(contentText).to.include(text.toLowerCase());
        });
      });
    }

    return cy
      .contains(
        '.cds--modal-container .cds--modal-footer button',
        targetFooterButtonText
      )
      .click();
  }
);

/**
 * Custom Cypress command to validate inline field error messages.
 * @param {Object} options - Options for the command.
 * @param {string} options.containsText - Text that the error message should contain. This parameter is required.
 * @returns {Cypress.Chainable} - The error message element if found, or an assertion failure.
 * @example
 * cy.expect_inline_field_errors({ containsText: 'blank' });
 * cy.expect_inline_field_errors({ containsText: 'taken' });
 */
Cypress.Commands.add('expect_inline_field_errors', ({ containsText }) => {
  if (!containsText) {
    cy.logAndThrowError('cy.expect_inline_field_errors: required object key missing - containsText');
  }
  return cy
    .contains('#name-error-msg', containsText)
    .scrollIntoView()
    .should('be.visible');
});
