/* eslint-disable no-undef */

// headers: Array of strings of length 7 for the chargeback rates table headers to check.
// rows: Array of form: [String, [...String], [...String], [...String], [...String], [...String], String]. This is the row data you want to check.
Cypress.Commands.add('expect_rates_table', (headers, rows) => {
  // Verify header titles
  cy.get('thead > tr > :nth-child(1)').contains(headers[0]);
  cy.get('thead > tr > :nth-child(2)').contains(headers[1]);
  cy.get('thead > tr > :nth-child(3)').contains(headers[2]);
  cy.get('thead > tr > :nth-child(4)').contains(headers[3]);
  cy.get('thead > tr > :nth-child(5)').contains(headers[4]);
  cy.get('thead > tr > :nth-child(6)').contains(headers[5]);
  cy.get('thead > tr > :nth-child(7)').contains(headers[6]);

  let rowCounter = 1;
  let columns = Array.from({length: headers.length}, (_, i) => i + 1);

  // Loop through each row and verify column values one row at a time
  rows.forEach((row) => {
    // Loop through range and rate columns and verify values
    columns.forEach((column) => {
      if (column === 1 || column === headers.length) {
        // Verify group or units column value
        cy.expect_text(`:nth-child(${rowCounter}) > :nth-child(${column}) > .cell > .bx--front-line`, row[column - 1]);
      } else {
        // Verify remaining column values
        cy.get(`:nth-child(${rowCounter}) > :nth-child(${column}) > .cell > .array_list > .list_row`).then((values) => {
          const numRows = [...Array(values.length).keys()];
          expect(numRows.length).to.eq(row[column - 1].length);
          numRows.forEach((index) => {
            expect(values[index].innerText).to.eq(row[column - 1][index]);
          });
        });
      }
    });
    rowCounter += 1;
  });
});
