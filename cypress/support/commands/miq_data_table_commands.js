/* eslint-disable no-undef */

/**
 * @fileoverview
 * This file contains Cypress commands for interacting with data tables in the ManageIQ UI.
 */

/**
 * Command to select table rows that contain any of the specified text values.
 * This command iterates through each text in the array and finds the corresponding row.
 * If any text is not found in the table, it throws an error immediately.
 *
 * @param {Object} params - Parameters for the command
 * @param {Array<string>} params.textArray - Array of text values to match against table rows
 */
Cypress.Commands.add('selectTableRowsByText', ({ textArray = [] }) => {
  if (!textArray || !textArray.length) {
    cy.logAndThrowError('textArray is required');
  }

  cy.get('.miq-data-table table tbody tr').then(($rows) => {
    const rows = Array.from($rows);
    textArray.forEach((textToFind, textItemIndex) => {
      const textFoundInTable = rows.some((row, rowIndex) => {
        const $row = Cypress.$(row);

        // Skip already selected rows
        if ($row.hasClass('bx--data-table--selected')) {
          return false;
        }

        const cells = Array.from($row.find('td'));
        const textFoundInRow = cells.some(
          (cell) => cell.innerText.trim() === textToFind // if true will break the cell loop, if false will continue to next cell
        );

        // If text is found in this row, select it & break the row loop
        if (textFoundInRow) {
          cy.log(`Found text "${textToFind}" (index: ${textItemIndex}) in row ${rowIndex + 1}`);
          cy.wrap($row).find('.bx--checkbox-label').click();
          return true;
        }

        return false; // Continue to next row
      });

      // After checking all rows, if the text wasn't found, throw an error and terminate
      if (!textFoundInTable) {
        cy.logAndThrowError(
          `Text "${textToFind}" (index: ${textItemIndex}) was not found in the table`
        );
      }
    });
  });
});
