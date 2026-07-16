// Selectors
const WIDGET_MENU_OPTION_SELECTOR = '.cds--overflow-menu-options .cds--overflow-menu-options__btn';

function assertNoSpinnersAreRendered() {
  cy.get('body').find('.loadingSpinner').should('not.exist');
  cy.get('body').find('#spinner_div').should('not.be.visible');
}

describe('Overview > Dashboard Tests', () => {
  const defaultCards = [];

  beforeEach(() => {
    cy.login();
    cy.menu('Overview', 'Dashboard');
    assertNoSpinnersAreRendered();
    cy.get('.card-pf').then((cards) => {
      const nums = [...Array(cards.length).keys()];
      nums.forEach((index) => {
        defaultCards[index] = cards[index].firstChild.innerText;
      });
    });
  });

  it('Default dashboard widgets loaded', () => {
    cy.get('.card-pf')
      .should('have.length', defaultCards.length)
      .then((cards) => {
        const nums = [...Array(cards.length).keys()];
        nums.forEach((index) => {
          cy.get(cards[index]).contains(defaultCards[index]);
        });
      });
  });


  it('Minimize a widget', () => {
    cy.get('.card-pf')
      .eq(0)
      .within(() => {
        cy.get('button.widget-overflow-menu').click();
      });
    cy.contains(WIDGET_MENU_OPTION_SELECTOR, 'Minimize').click();
    cy.get('.card-pf')
      .eq(0)
      .children()
      .eq(1)
      .should('have.css', 'display', 'none');

  // TODO: Fix the maximize test
  // cy.get('.card-pf').then((cards) => {
  //   cy.get(cards[0]).then((card) => {
  //     cy.get(card.children()[0].children[0].children[0]).click().then(() => {
  //       cy.get('.cds--overflow-menu-options').then((menuItems) => {
  //         cy.get(menuItems.children()[1]).click().then(() => {
  //           expect(card.children()[1].style.display).to.equal('block');
  //         });
  //       });
  //     });
  //   });
  // });
  });

  it('Zoom a widget', () => {
    cy.get('.card-pf')
      .eq(0)
      .within(() => {
        cy.get('button.widget-overflow-menu').click();
      });
    cy.contains(WIDGET_MENU_OPTION_SELECTOR, 'Zoom in').click();
    cy.get('#lightbox-panel').should('have.css', 'display', 'block');
    cy.get('#zoomed_chart_div .card-pf-heading .card-pf-title').should(
      'contain',
      defaultCards[0]
    );
  });

  it('Refresh a widget', () => {
    cy.get('.card-pf')
      .eq(0)
      .within(() => {
        cy.get('button.widget-overflow-menu').click();
        cy.root()
          .children()
          .eq(1)
          .invoke('attr', 'id')
          .then((id) => {
            const widgetId = id.split('_')[1].replace('w', '');
            cy.intercept('GET', `/dashboard/widget_chart_data/${widgetId}`).as(
              'refreshWidget'
            );
          });
      });
    cy.contains(WIDGET_MENU_OPTION_SELECTOR, 'Refresh').click();
    cy.wait('@refreshWidget').then((refreshWidgetResponse) => {
      expect([200, 304]).to.include(refreshWidgetResponse.response.statusCode);
    });
    // TODO: replace with expect_flash command
    cy.get('.alert-success').contains('was refreshed');
  });

  describe('Verify add, remove, and reset actions', () => {
    it('Add and remove a widget', () => {
      const newCards = [];
      let newCard = '';

      cy.intercept('POST', '/dashboard/widget_add*').as('widgetAdd');
      cy.intercept('GET', '/dashboard/show*').as('dashboardReload');
      cy.intercept('POST', '/dashboard/widget_close*').as('widgetClose');

      cy.get('#dashboard-add-widget-menu')
        .click()
        .then(() => {
          cy.get('.scrollable-options').then((list) => {
            newCard = list.children()[0].innerText;
            cy.get(list.children()[0]).click();
          });
        });

      cy.wait('@widgetAdd');
      cy.wait('@dashboardReload').then(() => {
        assertNoSpinnersAreRendered();
      });
      cy.get('.card-pf')
        .its('length')
        .should('eq', defaultCards.length + 1);
      cy.get('.card-pf').then((cards) => {
        const nums = [...Array(cards.length).keys()];
        nums.forEach((index) => {
          newCards[index] = cards[index].firstChild.innerText;
        });
        expect(newCards).to.include(newCard);

        // Find and click the widget that was just added
        cy.contains('.card-pf', newCard).within(() => {
          cy.get('button.widget-overflow-menu').click();
        });
        cy.contains(WIDGET_MENU_OPTION_SELECTOR, 'Remove Widget')
          .should('be.visible')
          .click();
      });

      // Interact with the modal
      cy.expect_modal({
        modalContentExpectedTexts: ['want to remove'],
        targetFooterButtonText: 'OK',
      });
      // TODO: replace with expect_flash command
      cy.get('.alert-success').contains('removed');

      cy.wait('@widgetClose').then(() => {
        assertNoSpinnersAreRendered();
      });
      cy.get('.card-pf').its('length').should('eq', defaultCards.length);
      cy.get('.card-pf').then((cards) => {
        const nums = [...Array(cards.length).keys()];
        nums.forEach((index) => {
          cy.get(cards[index]).contains(defaultCards[index]);
        });
      });
    });

    it('Reset dashboard back to default widgets', () => {
      cy.intercept('POST', '/dashboard/widget_add*').as('widgetAdd');
      cy.intercept('GET', '/dashboard/show*').as('dashboardReload');

      cy.get('#dashboard-add-widget-menu')
        .click()
        .then(() => {
          cy.get('.scrollable-options').then((list) => {
            cy.get(list.children()[0]).click();
          });
        });
      cy.wait('@widgetAdd');
      cy.wait('@dashboardReload').then(() => {
        assertNoSpinnersAreRendered();
      });

      cy.get('#dashboard-add-widget-menu')
        .click()
        .then(() => {
          cy.get('.scrollable-options').then((list) => {
            cy.get(list.children()[1]).click();
          });
        });
      cy.wait('@widgetAdd');
      cy.wait('@dashboardReload').then(() => {
        assertNoSpinnersAreRendered();
      });

      cy.get('.card-pf')
        .its('length')
        .should('eq', defaultCards.length + 2);

      cy.interceptApi({
        alias: 'resetWidgets',
        method: 'POST',
        urlPattern: '/dashboard/reset_widgets',
        triggerFn: () => {
          cy.get('#reset-dashboard-button').click();
        },
        onApiResponse: (interception) => {
          expect(interception.state).to.equal('Complete');
          expect(interception.response.statusCode).to.equal(200);
        },
      });

      cy.wait('@dashboardReload').then(() => {
        assertNoSpinnersAreRendered();
      });

      cy.get('.card-pf').then((cards) => {
        const nums = [...Array(cards.length).keys()];
        nums.forEach((index) => {
          cy.get(cards[index]).contains(defaultCards[index]);
        });
      });
    });

    afterEach(() => {
      cy.appDbState('restore');
    });
  }); 
});
