// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

// FIXME: use cy.request and inject cookie and localStorage.miqToken
Cypress.Commands.add("login", (user = 'admin', password = 'smartvm') => {
  cy.visit('/');

  cy.get('#user_name').type(user);
  cy.get('#user_password').type(password);
  return cy.get('#login').click();
});

// cy.menu('Compute', 'Infrastructure', 'VMs') - navigate the main menu
Cypress.Commands.add("menu", (...items) => {
  expect(items.length > 0).to.equal(true);
  expect(items.length < 4).to.equal(true);

  const selectors = [
    '#main-menu',
    '.nav-pf-secondary-nav',
    '.nav-pf-tertiary-nav',
  ];

  let ret = cy;

  items.forEach((item, index) => {
    if (index > 0) {
      ret = ret.trigger('mouseover');
    }

    ret = ret
      .get(`${selectors[index]} > ul > li`)
      .contains('a', item);
  });

  return ret.click();
  // TODO support by id: cy.get('li[id=menu_item_provider_foreman]').click({ force: true });
});

// returns an array of top level menu items with {title, href, items (array of children), selector, click() method}
Cypress.Commands.add("menuItems", () => {
  const children = (parent, parentSelector, level, ...selectors) => {
    if (! parent)
      return [];

    const [selector, ...rest] = selectors;
    const items = [];
    parent.querySelectorAll(':scope > li > a').forEach((el, i) => {
      const itemSelector = `${parentSelector} > li:nth-child(${i + 1}) > a`;
      items.push({
        title: el.text.trim(),
        href: el.href,
        items: children(el.parentElement.querySelector(`${selector} > ul`), `${itemSelector.replace(/ > a$/, '')} > div > ul`, level + 1, ...rest),
        selector: itemSelector,
        click: () => cy.get(itemSelector).click({ force: true }),
      });
    });

    return items;
  };

  return cy.get('#maintab')
    .then((maintab) => children(maintab[0], '#maintab', 0, '.nav-pf-secondary-nav', '.nav-pf-tertiary-nav'));
});

// assertions

Cypress.Commands.add("expect_explorer_title", (text) => {
  return cy.get('#explorer_title_text').should((elem) => {
    expect(elem.text().trim()).to.equal(text);
  });
});

Cypress.Commands.add("expect_show_list_title", (text) => {
  return cy.get('#main-content h1').should((elem) => {
    expect(elem.text().trim()).to.equal(text);
  });
});
