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

    cy.toolbarItems('Add widget').then((list) => {
      newCard = list[0].text;
      list[0].button.click();
      cy.get('.card-pf').its('length').should('eq', defaultCards.length + 1);
      cy.get('.card-pf').then((cards) => {
        const nums = [...Array(cards.length).keys()];
        nums.forEach((index) => {
          newCards[index] = cards[index].firstChild.innerText;
        });
        expect(newCards).to.include(newCard);
      });
    });

    cy.get('.card-pf').then((cards) => {
      const nums = [...Array(cards.length - 1).keys()];
      nums.forEach((index) => {
        if (cards[index].firstChild.innerText === newCard) {
          cy.get(cards[index]).then((card) => {
            cy.get(card.children()[0].children[0].children[0]).click().then(() => {
              cy.get('.bx--overflow-menu-options').then((menuItems) => {
                cy.get(menuItems.children()[0]).click().then(() => {
                  cy.get('.is-visible > .bx--modal-container > .bx--modal-footer > .bx--btn--primary').click().then(() => {
                    cy.get('.card-pf').its('length').should('eq', defaultCards.length);
                    cy.get('.card-pf').then((cards) => {
                      const nums = [...Array(cards.length).keys()];
                      nums.forEach((index) => {
                        cy.get(cards[index]).contains(defaultCards[index]);
                      });
                    });
                  });
                });
              });
            });
          });
        }
      });
    });
  });

  it('Minimize a widget', () => {
    cy.get('.card-pf').then((cards) => {
      cy.get(cards[0]).then((card) => {
        cy.get(card.children()[0].children[0].children[0]).click().then(() => {
          cy.get('.bx--overflow-menu-options').then((menuItems) => {
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
  //       cy.get('.bx--overflow-menu-options').then((menuItems) => {
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
          cy.get('.bx--overflow-menu-options').then((menuItems) => {
            cy.get(menuItems.children()[4]).click().then(() => {
              cy.get('#zoomed_chart_div').contains(defaultCards[0]);
              cy.get('#lightbox-panel').then((div) => {
                expect(div[0].style.display).to.equal('block');
              });
            });
          });
        });
      });
    });
  });

  it('Refresh a widget', () => {
    cy.get('.card-pf').then((cards) => {
      cy.get(cards[0]).then((card) => {
        const newId = cards[0].children[1].id.split('_')[1].replace('w', '');
        cy.intercept('GET', `/dashboard/widget_chart_data/${newId}`).as('get');
        cy.get(card.children()[0].children[0].children[0]).click().then(() => {
          cy.get('.bx--overflow-menu-options').then((menuItems) => {
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
    cy.get('#dropdown-custom-2').click().then(() => {
      cy.get('.scrollable-options').then((list) => {
        cy.get(list.children()[0]).click();
      });
    });

    cy.get('#dropdown-custom-2').click().then(() => {
      cy.get('.scrollable-options').then((list) => {
        cy.get(list.children()[1]).click();
      });
    });

    cy.get('.card-pf').its('length').should('eq', defaultCards.length + 2);

    cy.intercept('POST', '/dashboard/reset_widgets').as('post');
    cy.get('.miq-toolbar-group > .btn').click();

    cy.wait('@post').then((getCall) => {
      expect(getCall.state).to.equal('Complete');
      expect(getCall.response).to.include({
        statusCode: 200,
      });
    });

    cy.get('.card-pf').then((cards) => {
      const nums = [...Array(cards.length).keys()];
      nums.forEach((index) => {
        cy.get(cards[index]).contains(defaultCards[index]);
      });
    });
  });
});
