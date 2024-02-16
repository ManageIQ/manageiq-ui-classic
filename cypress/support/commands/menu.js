/* eslint-disable no-undef */

const primary = '#main-menu nav.primary';
const secondary = 'div[role="presentation"] > .bx--side-nav__items';

// items: Strings with at least 2 to a maximum of 3. These are the strings for the side bar menu names to click.
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
    cy.get('div[role="presentation"] > .bx--side-nav__items').then((a) => {
      const subMenuIndices = [...Array(a.children().length).keys()];
      subMenuIndices.forEach((index) => { // Loop through second layer menu items
        if (a.children()[index].children[0].innerText === items[1]) { // Check if current second layer menu item is the one we want
          if (a.children()[index].className.includes('item--active')) { // Check if third layer menu is already open
            cy.get(a.children()[index]).contains('a > span', items[2]).click();
          } else { // If third layer menu is not already open then we need to open it
            ret = cy.get(`${secondary} > li`)
              .contains('.bx--side-nav__submenu', items[1])
              .click()
              .parent()
              .contains('a > span', items[2])
              .click();
          }
        }
      });
    });
  }

  return ret;
});

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
