/* eslint-disable no-undef */

const primary = '#main-menu nav.primary';
const secondary = 'div[role="presentation"] > .bx--side-nav__items';

// cy.menu('Compute', 'Infrastructure', 'VMs') - navigate the main menu
Cypress.Commands.add('menu', (...items) => {
  expect(items.length).to.be.within(1, 3);

  let ret = cy.get(`${primary} > ul > li`)
    .contains('a > span', items[0])
    .click();

  if (items.length === 2) {
    ret = cy.get(`${secondary} > li`)
      .contains('a > span', items[1])
      .click();
  }

  if (items.length === 3) {
    ret = cy.get(`${secondary} > li`)
      .contains('.bx--side-nav__submenu', items[1])
      .click()
      .parent()
      .contains('a > span', items[2])
      .click();
  }

  return ret;
  // TODO support by id: cy.get('li[id=menu_item_provider_foreman]').click({ force: true });
});

// cy.menuItems() - returns an array of top level menu items with {title, href, items (array of children)}
Cypress.Commands.add('menuItems', () => {
  const menuItems = [];
  cy.get(`${primary} > ul > li`).each(($li) => {
    const tempItem = {};
    tempItem.title = $li.text();
    const children = [];
    let subChildren = [];
    if ($li.text() !== 'Logout') {
      cy.get($li).click().then(() => {
        cy.get(`${secondary} > li`).each(($li) => {
          if ($li[0].className === 'bx--side-nav__item') {
            const parent = $li.children().children()[0].innerText;
            cy.get($li).click().then(() => {
              $li.children()[1].children.forEach((child) => {
                subChildren.push({ title: child.innerText, href: child.children[0].href });
              });
              children.push({title: parent, items: subChildren });
              subChildren = [];
            });
          } else {
            children.push({title: $li.text(), href: $li.children()[0].href});
          }
        });
        tempItem.items = children;
      });
    }
    menuItems.push(tempItem);
  }).then(() => {
    return menuItems;
  });
});
