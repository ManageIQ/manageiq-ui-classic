describe('Menu', () => {
  beforeEach(() => {
    cy.login();
  });

  it("menu items", () => {
    cy.menuItems()
      .then((menu) => {
        cy.log(menu);

        expect(menu.length > 9).to.equal(true);
        expect(menu[0].title).to.equal('Overview');
        expect(menu[0].items[1].title).to.equal('Reports');
        expect(menu[2].items[1].items[3].title).to.equal('Virtual Machines');
      });

    cy.menu('Overview')
      .get('widget-wrapper');

    cy.menu('Services')
      .expect_explorer_title('Active Services');

    cy.menu('Compute')
      .expect_show_list_title('Cloud Providers');

    cy.menu('Overview', 'Reports')
      .expect_explorer_title('All Saved Reports');

    cy.menu('Compute', 'Infrastructure', 'Virtual Machines')
      .expect_explorer_title('All VMs & Templates');

    // test it remembers the last Overview > * screen used
    cy.menu('Overview')
      .expect_explorer_title('All Saved Reports');
  });

  it.skip("all menu items lead to non-error screens", () => {
    //FIXME: remove .skip once graphql_explorer stops erroring
    //FIXME: ignore custom items

    const check = (item) => {
      //if (Math.random() > 0.2)
      //  return;

      cy.log('check', item);

      cy.visit(item.href)
        .get('[class*=miq-layout]');
    };

    const recurse = (items) => {
      items.forEach((item) => {
        recurse(item.items);

        if (! item.items.length) {
          // leaf node
          check(item);
        }
      });
    };

    cy.menuItems()
      .then((menu) => recurse(menu));
  });
});
