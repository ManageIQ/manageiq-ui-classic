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

// cy.login() - log in
// FIXME: use cy.request and inject cookie and localStorage.miqToken
Cypress.Commands.add("login", (user = 'admin', password = 'smartvm') => {
  cy.visit('/');

  cy.get('#user_name').type(user);
  cy.get('#user_password').type(password);
  return cy.get('#login').click();
});

// cy.menu('Compute', 'Infrastructure', 'VMs') - navigate the main menu
Cypress.Commands.add("menu", (...items) => {
  expect(items.length).to.be.within(1, 3);

  const selectors = [
    '#main-menu',
    '.nav-pf-secondary-nav',
    '.nav-pf-tertiary-nav',
  ];

  let ret = cy.get(`${selectors[0]} > ul > li`)
    .contains('a', items[0])
    .parent();

  items.forEach((item, index) => {
    if (index === 0) {
      return;
    }

    ret = ret.trigger('mouseover')
      .find(`${selectors[index]} > ul > li`)
      .contains('a', item)
      .parent();
  });

  return ret.click();
  // TODO support by id: cy.get('li[id=menu_item_provider_foreman]').click({ force: true });
});

// cy.menuItems() - returns an array of top level menu items with {title, href, items (array of children), selector, click() method}
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

// cy.toolbarItem('Configuration', 'Edit this VM') - return a toolbar button state
Cypress.Commands.add('toolbarItem', (...items) => {
  expect(items.length).to.be.within(1, 2);

  let ret = cy.get('#toolbar')
    .find(items[1] ? '.dropdown-toggle' : 'button')
    .contains(items[0]);

  if (items[1]) {
    ret = ret.siblings('.dropdown-menu')
      .find('a > span')
      .contains(items[1])
      .parents('a > span');
  }

  return ret.then((el) => {
    return {
      id: el[0].id,
      label: el.text().trim(),
      icon: el.find('i'),
      disabled: !items[1] ? !!el.prop('disabled') : !!el.parents('li').hasClass('disabled'),
    };
  });
});

// cy.toolbar('Configuration', 'Edit this VM') - click a toolbar button
// TODO {id: 'view_grid'|'view_tile'|'view_list'} for the view toolbar
// TODO {id: 'download_choice'}, .. for the download dropdown
// TODO: some alias for having %i.fa-download, .fa-refresh, .pficon-print, .fa-arrow-left
// TODO custom buttons
Cypress.Commands.add('toolbar', (...items) => {
  expect(items.length).to.be.within(1, 2);

  let ret = cy.get('#toolbar')
    .contains(items[1] ? '.dropdown-toggle' : 'button', items[0]);
    // by-id: #id on button instead of .contains

  ret = ret.then((el) => {
    assert.equal(!!el.prop('disabled'), false, "Parent toolbar button disabled");
    return el;
  });

  if (items[1]) {
    ret.click();

    // a doesn't react to click here, have to click the span
    ret = ret.siblings('.dropdown-menu')
      .find('a > span')
      .contains(items[1])
      .parents('a > span');
      // by-id: #id on the same span

    ret = ret.then((el) => {
      assert.equal(el.parents('li').hasClass('disabled'), false, "Child toolbar button disabled");
      return el;
    });
  }

  return ret.click();
  // TODO .dropdown-toggle#vm_lifecycle_choice
});

// assertions

Cypress.Commands.add("expect_explorer_title", (text) => {
  return cy.get('#explorer_title_text').contains(text);
});

Cypress.Commands.add("expect_show_list_title", (text) => {
  return cy.get('#main-content h1').contains(text);
});

// GTL related helpers
Cypress.Commands.add("gtl_error", () => {
  return cy.get('#miq-gtl-view > #flash_msg_div').should('be.visible');
});

Cypress.Commands.add("gtl_no_record", () => {
  return cy.get('#miq-gtl-view > div.no-record').should('be.visible');
});

Cypress.Commands.add("gtl_grid_click", (name) => {
  return cy.get('div.miq-tile-head > a').contains(name).click();
});

Cypress.Commands.add("gtl_tile_click", (name) => {
  return cy.get('div.card-content > div > div > ng-switch-when > a').contains(name).click();
});

Cypress.Commands.add("gtl_list_click", (name) => {
  return cy.get('#miq-gtl-view > miq-data-table > div > table').contains(name).click();
});

Cypress.Commands.add("gtl_click", (name) => {
  return cy.get('span[class="ng-binding ng-scope"]').contains(name).click();
});

Cypress.Commands.add("gtl", () => {
  return cy.get('[ng-controller="reportDataController as dataCtrl"]').find('div.no-record').should('not.exist');
});

Cypress.Commands.add("search_box", () => {
  return cy.get('#search_text').should('be.visible');
});

Cypress.Commands.add("no_search_box", () => {
  return cy.get('#search_text').should('not.be.visible');
});

Cypress.Commands.add("tab", (name) => {
  return cy.get("li > a[data-toggle=\"tab\"]").contains(name).click();
});
