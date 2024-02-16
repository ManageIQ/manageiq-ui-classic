/* eslint-disable no-undef */

// title: String of the accordion title for the accordian panel to open.
Cypress.Commands.add('accordion', (title) => {
  cy.get('#main-content'); // ensure screen loads first
  let ret = cy.get('#accordion')
    .find('.panel-title a')
    .contains(new RegExp(`^${title}$`));

  ret.then((el) => {
    // Do not collapse if already expanded
    if (el.is('.collapsed')) {
      el.trigger('click');
    }
    return el;
  });

  return ret.parents('.panel');
});

// name: String of the record in the accordion panel to click.
Cypress.Commands.add('accordionItem', (name) => {
  cy.get('#main-content'); // ensure screen loads first

  cy.get('.list-group-item').contains(name).click();
});
