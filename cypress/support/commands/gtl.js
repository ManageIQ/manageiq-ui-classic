/* eslint-disable no-undef */

Cypress.Commands.add('gtl_error', () => {
  return cy.get('#miq-gtl-view > #flash_msg_div').should('be.visible');
});

Cypress.Commands.add('gtl_no_record', () => {
  return cy.get('#miq-gtl-view > div.no-record').should('be.visible');
});

Cypress.Commands.add('gtlGetTable', () => {
  return cy.get('#miq-gtl-view > .miq-data-table > .miq-data-table > .bx--data-table-content > table');
});

// columns: Array of 0-based indexes of the columns to read (e.g. [1, 2, 3] will return all row data from columns 1, 2, and 3).
Cypress.Commands.add('gtlGetRows', (columns) => {
  const rowsData = [];
  cy.gtlGetTable().get('tr.clickable-row').then((rows) => {
    const numRows = [...Array(rows.length).keys()];
    numRows.forEach((index) => {
      const rowData = [];
      columns.forEach((column) => {
        rowData.push(rows[index].children[column].innerText);
      });
      rowsData.push(rowData);
    });
  }).then(() => {
    return rowsData;
  });
});

// columns: Array of `{ title: String, number: Integer }`. `title` is the string you want to find in the table to click on `number` is the column that string is found in.
// (e.g. `[{title: 'Default', number: '1'}, {title: 'Compute', number: '2'}]` will click on a row in the GTL table with 'Default' in column 1 and 'Compute' in column 2.
// Using just `[{title: 'Default', number: '1'}]` will click on the first row found in the GTL table with 'Default' in column 1).
Cypress.Commands.add('gtlClickRow', (columns) => {
  let rowToClick;

  cy.gtlGetTable().get('tr.clickable-row').then((rows) => {
    const numRows = [...Array(rows.length).keys()];
    numRows.forEach((index) => {
      let click = true;
      columns.forEach((column) => {
        if (rows[index].children[column.number].innerText !== column.title) {
          click = false;
        }
      });
      if (click) {
        rowToClick = rows[index];
      }
    });
  }).then(() => {
    cy.get(rowToClick).click();
  });
});
