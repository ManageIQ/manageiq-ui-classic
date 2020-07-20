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

Cypress.Commands.add("gtl", () => {
  cy.get('#miq-gtl-view').then($gtlTile => {
    if ($gtlTile.find("miq-tile-view").length > 0) {
      return cy.get("div[pf-card-view] > .card-view-pf > .card");
    }  else {
      return cy.get('#miq-gtl-view > miq-data-table > div > table');
    };
  });
});

Cypress.Commands.add("gtl_click", (name) => {
  cy.gtl().contains(name).click()
});

// Searchbox related helpers
Cypress.Commands.add("search_box", () => {
  return cy.get('#search_text').should('be.visible');
});

Cypress.Commands.add("no_search_box", () => {
  return cy.get('#search_text').should('not.be.visible');
});
