/* eslint-disable no-undef */

/**
 * Command to verify that the GTL (Grid/Tile/List) view displays a "no records" message.
 * This assertion checks that the specified text is visible within the GTL view container.
 *
 * @param {Object} params - Parameters for the command
 * @param {string} [params.containsText='No records'] - The text to verify in the no records message
 * @returns {Cypress.Chainable} A Cypress chainable that asserts the text is visible
 * @example
 * // Check for default "No records" message
 * cy.expect_gtl_no_records_with_text();
 *
 * @example
 * // Check for custom message
 * cy.expect_gtl_no_records_with_text({ containsText: 'No items found' });
 */
Cypress.Commands.add(
  'expect_gtl_no_records_with_text',
  ({ containsText = 'No records' } = {}) => {
    return cy.contains('#miq-gtl-view', containsText).should('be.visible');
  }
);
