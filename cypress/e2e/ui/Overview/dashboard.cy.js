/* eslint-disable no-undef */

describe('Overview > Dashboard Tests', () => {
  const defaultCards = [];

  beforeEach(() => {
    cy.login();
    cy.menu('Overview', 'Dashboard');
  });

  it('Dashboard loads correctly', () => {
    cy.get('#main-menu');
    cy.get('.card-pf').then((cards) => {
      const nums = [...Array(cards.length).keys()];
      nums.forEach((index) => {
        defaultCards[index] = cards[index].firstChild.innerText;
      });
    });
  });

  it('Default dashboard widgets loaded', () => {
    cy.get('.card-pf').then((cards) => {
      const nums = [...Array(cards.length).keys()];
      nums.forEach((index) => {
        cy.get(cards[index]).contains(defaultCards[index]);
      });
    });
  });

  it('Add and remove a widget', () => {
    const newCards = [];
    let newCard = '';

    cy.intercept('POST', '/dashboard/widget_add*').as('widgetAdd');
    cy.intercept('GET', '/dashboard/show*').as('dashboardReload');
    cy.intercept('POST', '/dashboard/widget_close*').as('widgetClose');

    cy.toolbarItems('Add widget').then((list) => {
      newCard = list[0].text;
      list[0].button.click();
    });

    cy.wait('@widgetAdd');
    cy.wait('@dashboardReload');
    cy.get('.card-pf').its('length').should('eq', defaultCards.length + 1);
    cy.get('.card-pf').then((cards) => {
      const nums = [...Array(cards.length).keys()];
      nums.forEach((index) => {
        newCards[index] = cards[index].firstChild.innerText;
      });
      expect(newCards).to.include(newCard);
    });

    cy.get('.card-pf').then((cards) => {
      const nums = [...Array(cards.length - 1).keys()];
      nums.forEach((index) => {
        if (cards[index].firstChild.innerText === newCard) {
          cy.get(cards[index]).then((card) => {
            cy.get(card.children()[0].children[0].children[0]).click().then(() => {
              cy.get('.cds--overflow-menu-options').then((menuItems) => {
                cy.get(menuItems.children()[0]).click().then(() => {
                  cy.expect_modal({ modalContentExpectedTexts: ['want to remove'], targetFooterButtonText: 'OK' });
                });
              });
            });
          });
        }
      });
    });

    cy.wait('@widgetClose');
    cy.get('.card-pf').its('length').should('eq', defaultCards.length);
    cy.get('.card-pf').then((cards) => {
      const nums = [...Array(cards.length).keys()];
      nums.forEach((index) => {
        cy.get(cards[index]).contains(defaultCards[index]);
      });
    });
  });

  it('Minimize a widget', () => {
    cy.get('.card-pf').then((cards) => {
      cy.get(cards[0]).then((card) => {
        cy.get(card.children()[0].children[0].children[0]).click().then(() => {
          cy.get('.cds--overflow-menu-options').then((menuItems) => {
            cy.get(menuItems.children()[1]).click().then(() => {
              expect(card.children()[1].style.display).to.equal('none');
            });
          });
        });
      });
    });

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
    cy.get('.card-pf').then((cards) => {
      cy.get(cards[0]).then((card) => {
        cy.get(card.children()[0].children[0].children[0]).click().then(() => {
          cy.get('.cds--overflow-menu-options').then((menuItems) => {
            cy.get(menuItems.children()[4]).click();
          });
        });
      });
    });
    cy.get('#lightbox-panel').should('have.css', 'display', 'block');
    cy.get('#zoomed_chart_div', { timeout: 10000 }).should('contain', defaultCards[0]);
  });

  it('Refresh a widget', () => {
    cy.get('.card-pf').then((cards) => {
      cy.get(cards[0]).then((card) => {
        const newId = cards[0].children[1].id.split('_')[1].replace('w', '');
        cy.intercept('GET', `/dashboard/widget_chart_data/${newId}`).as('get');
        cy.get(card.children()[0].children[0].children[0]).click().then(() => {
          cy.get('.cds--overflow-menu-options').then((menuItems) => {
            cy.get(menuItems.children()[5]).click().then(() => {
              cy.wait('@get').then((getCall) => {
                expect(getCall.state).to.equal('Complete');
                expect([200, 304]).to.include(getCall.response.statusCode);
              });
            });
          });
        });
      });
    });
  });

  it('Reset dashboard back to default widgets', () => {
    cy.intercept('POST', '/dashboard/widget_add*').as('widgetAdd');
    cy.intercept('GET', '/dashboard/show*').as('dashboardReload');

    cy.get('#dropdown-custom-2').click().then(() => {
      cy.get('.scrollable-options').then((list) => {
        cy.get(list.children()[0]).click();
      });
    });
    cy.wait('@widgetAdd');
    cy.wait('@dashboardReload');

    cy.get('#dropdown-custom-2').click().then(() => {
      cy.get('.scrollable-options').then((list) => {
        cy.get(list.children()[1]).click();
      });
    });
    cy.wait('@widgetAdd');
    cy.wait('@dashboardReload');

    cy.get('.card-pf').its('length').should('eq', defaultCards.length + 2);

    cy.interceptApi({
      alias: 'resetWidgets',
      method: 'POST',
      urlPattern: '/dashboard/reset_widgets',
      triggerFn: () => {
        cy.get('.miq-toolbar-group > .btn').click();
      },
      onApiResponse: (interception) => {
        expect(interception.state).to.equal('Complete');
        expect(interception.response.statusCode).to.equal(200);
      }
    });

    cy.wait('@dashboardReload');

    cy.get('.card-pf').then((cards) => {
      const nums = [...Array(cards.length).keys()];
      nums.forEach((index) => {
        cy.get(cards[index]).contains(defaultCards[index]);
      });
    });
  });
});
