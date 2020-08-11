// cy.menu('Compute', 'Infrastructure', 'VMs') - navigate the main menu
Cypress.Commands.add("menu", (...items) => {
  expect(items.length).to.be.within(1, 3);

  const primary = '#main-menu nav.primary';
  const secondary = '#main-menu nav.secondary';

  let ret = cy.get(`${primary} > ul > li`)
    .contains('a > span', items[0])
    .parent().parent()
    .click();

  if (items.length === 2) {
    ret = cy.get(`${secondary} > ul > li`)
      .contains('a > span', items[1])
      .parent().parent()
      .click();
  }

  if (items.length === 3) {
    ret = cy.get(`${secondary} > ul > li`)
      .contains('button > span', items[1])
      .parent().parent()
      .click()
      .find(`ul > li`)
      .contains('a > span', items[2])
      .parent().parent()
      .click();
  }

  return ret;
  // TODO support by id: cy.get('li[id=menu_item_provider_foreman]').click({ force: true });
});

// cy.menuItems() - returns an array of top level menu items with {title, href, items (array of children)}
Cypress.Commands.add("menuItems", () => {
  cy.get('#main-menu nav.primary'); // Wait for menu to appear
  return cy.window().then((window) => window.ManageIQ.menu);
});
