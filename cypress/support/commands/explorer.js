// cy.accordion('Catalog Items') - click accordion, unless already expanded
Cypress.Commands.add('accordion', (text) => {
  cy.get('#main-content');  // ensure screen loads first

  let ret = cy.get('#accordion')
    .find('.panel-title a')
    .contains(new RegExp(`^${text}$`))

  ret.then((el) => {
    // do not collapse if expanded
    if (el.is('.collapsed')) {
      el.click();
    }
    return el;
  });

  return ret.parents('.panel');
});
