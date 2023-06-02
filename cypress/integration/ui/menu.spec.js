/* eslint-disable no-undef */

describe('Menu', () => {
  beforeEach(() => {
    cy.login();
  });

  it('menu items', () => {
    cy.menuItems()
      .then((menu) => {
        cy.log(menu);

        expect(menu.length === 9).to.equal(true);
        expect(menu[0].title).to.equal('Overview');
        expect(menu[0].items[1].title).to.equal('Reports');
        expect(menu[2].items[1].items[3].title).to.equal('Virtual Machines');
      });

    cy.menu('Overview', 'Dashboard')
      .get('#main-menu');

    cy.menu('Overview', 'Reports')
      .expect_explorer_title('All Saved Reports');

    cy.menu('Services', 'My Services')
      .expect_explorer_title('Services');

    cy.menu('Compute', 'Clouds', 'Providers')
      .expect_show_list_title('Cloud Providers');

    cy.menu('Compute', 'Infrastructure', 'Virtual Machines')
      .expect_explorer_title('All VMs & Templates');
  });

  it('all menu items lead to non-error screens', () => {
    // FIXME: remove .skip once graphql_explorer stops erroring
    // FIXME: ignore custom items

    const check = (item) => {
      // if (Math.random() > 0.2)
      //  return;

      cy.log('check', item);

      if (item.href === 'http://localhost:3000/miq_policy_rsop' || item.href === 'https://www.manageiq.org/docs/' || item.href === 'https://www.manageiq.org/') {
        return null;
      }
      if (item.href) {
        cy.visit(item.href).get('[class*=miq-layout]');
        return null;
      }
    };

    const recurse = (items) => {
      items.forEach((item) => {
        if (item.items) {
          recurse(item.items);
        } else {
          // leaf node
          check(item);
        }
      });
    };

    cy.menuItems()
      .then((menu) => recurse(menu));
  });
});
