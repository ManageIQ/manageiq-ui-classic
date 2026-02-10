/**
 * Selects and clicks a tab element by its label text.
 *
 * This command finds a tab element within a tablist that contains the specified label text
 * and automatically clicks it to navigate to the tab. It requires a tabLabel parameter and 
 * will throw an error if none is provided.
 *
 * @param {Object} options - The options object
 * @param {string} options.tabLabel - The text content of the tab to select
 * @returns {Cypress.Chainable} - A Cypress chainable element representing the selected tab
 * @example
 * // Select and click the "Details" tab
 * cy.tabs({ tabLabel: 'Details' });
 *
 * // Select, click, and verify the "Settings" tab content appears
 * cy.tabs({ tabLabel: 'Settings' })
 *   .then(() => {
 *     cy.get('.settings-panel').should('be.visible');
 *   });
 *
 * // Select a tab and verify it has the active class after clicking
 * cy.tabs({ tabLabel: 'Properties' })
 *   .should('have.class', 'active');
 */
Cypress.Commands.add('tabs', ({ tabLabel = '' }) => {
  if (!tabLabel) {
    cy.logAndThrowError(`cy.tabs: required object key missing - tabLabel`);
  }
  return cy.contains(`[role="tablist"] [role="tab"]`, tabLabel).click();
});
