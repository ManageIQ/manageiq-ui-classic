/* eslint-disable no-undef */

describe('Overview > Dashboard Tests', () => {
  const defaultCards = [];
  let newCard = '';

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

    cy.wait(5000);
    cy.get('.card-pf').then((cards) => {
      expect(cards.length).to.equal(defaultCards.length + 2);
    });

    cy.intercept('POST', '/dashboard/reset_widgets').as('post');
    cy.get('.miq-toolbar-group > .btn').click();
    cy.wait(5000);

    cy.get('@post').then((getCall) => {
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

  it('Can add a widget', () => {
    const newCards = [];
    cy.get('#dropdown-custom-2').click().then(() => {
      cy.get('.scrollable-options').then((list) => {
        newCard = list.children()[0].innerText.trim();
        cy.get(list.children()[0]).click().then(() => {
          cy.wait(5000);
          cy.get('.card-pf').then((cards) => {
            const nums = [...Array(cards.length).keys()];
            nums.forEach((index) => {
              newCards[index] = cards[index].firstChild.innerText;
            });
            expect(newCards).to.include(newCard);
          });
        });
      });
    });
  });

  it('Can minimize a widget', () => {
    cy.get('.card-pf').then((cards) => {
      const nums = [...Array(cards.length).keys()];
      nums.forEach((index) => {
        if (cards[index].firstChild.innerText === newCard) {
          cy.get(cards[index]).then((card) => {
            cy.get(card.children()[0].children[0].children[0]).click().then(() => {
              cy.get('.bx--overflow-menu-options').then((menuItems) => {
                cy.get(menuItems.children()[1]).click().then(() => {
                  expect(card.children()[1].style.display).to.equal('none');
                });
              });
            });
          });
        }
      });
    });
  });

  it('Can zoom a widget', () => {
    cy.get('#lightbox-panel').then((div) => {
      expect(div[0].style.display).to.equal('');
    });
    cy.get('.card-pf').then((cards) => {
      const nums = [...Array(cards.length).keys()];
      nums.forEach((index) => {
        if (cards[index].firstChild.innerText === newCard) {
          cy.get(cards[index]).then((card) => {
            cy.get(card.children()[0].children[0].children[0]).click().then(() => {
              cy.get('.bx--overflow-menu-options').then((menuItems) => {
                cy.get(menuItems.children()[2]).click().then(() => {
                  cy.get('#zoomed_chart_div').contains(newCard);
                  cy.get('#lightbox-panel').then((div) => {
                    expect(div[0].style.display).to.equal('block');
                  });
                });
              });
            });
          });
        }
      });
    });
  });

  it('Can refresh a widget', () => {
    cy.get('.card-pf').then((cards) => {
      cy.intercept('GET', '/dashboard/widget_chart_data/1').as('get');
      const nums = [...Array(cards.length).keys()];
      nums.forEach((index) => {
        if (cards[index].firstChild.innerText === newCard) {
          cy.get(cards[index]).then((card) => {
            cy.get(card.children()[0].children[0].children[0]).click().then(() => {
              cy.get('.bx--overflow-menu-options').then((menuItems) => {
                cy.get(menuItems.children()[3]).click().then(() => {
                  cy.wait(5000);
                  cy.get('@get').then((getCall) => {
                    expect(getCall.state).to.equal('Complete');
                    expect(getCall.response).to.include({statusCode: 304});
                  });
                });
              });
            });
          });
        }
      });
    });
  });

  it('Can remove a widget', () => {
    cy.get('.card-pf').then((cards) => {
      const nums = [...Array(cards.length - 1).keys()];
      nums.forEach((index) => {
        if (cards[index].firstChild.innerText === newCard) {
          cy.get(cards[index]).then((card) => {
            cy.get(card.children()[0].children[0].children[0]).click().then(() => {
              cy.get('.bx--overflow-menu-options').then((menuItems) => {
                cy.get(menuItems.children()[0]).click().then(() => {
                  cy.wait(10000);
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
        }
      });
    });
  });
});
