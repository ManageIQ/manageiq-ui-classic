/* eslint-disable no-undef */

describe('Automation > Embedded Automate > Simulation', () => {
  beforeEach(() => {
    cy.login();
    cy.intercept('POST', '/ops/accordion_select?id=rbac_accord').as('accordion');
    cy.menu('Automation', 'Embedded Automate', 'Simulation');
    cy.get('#resolve_form_div');
  });

  describe('Automate Simulation Form', () => {
    it('Resets the form', () => {
      cy.get('#object_request').type('Test Request');
      cy.get('#target_class').click();
      cy.get('[class="bx--list-box__menu-item__option"]').contains('User').click({force: true});

      cy.get('#selection_target').select('Administrator');
      cy.get('#left_div').scrollTo('bottom');
      cy.contains('button', 'Reset').click();

      cy.get('#object_request').should('not.contain', 'Test Request');
      cy.get('#target_class').should('have.value', '');
      cy.get('#selection_target').should('not.exist');
    });

    it('Submits the form', () => {
      cy.get('#object_request').type('Test Request');
      cy.get('#target_class').click();
      cy.get('[class="bx--list-box__menu-item__option"]').contains('User').click({force: true});

      cy.get('#selection_target').select('Administrator');
      cy.get('#left_div').scrollTo('bottom');

      cy.get('[name="attribute_1"]').type('attribute 1');
      cy.get('[name="attribute_2"]').type('attribute 2');
      cy.get('[name="attribute_3"]').type('attribute 3');
      cy.get('[name="attribute_4"]').type('attribute 4');

      cy.get('[name="value_1"]').type('value 1');
      cy.get('[name="value_2"]').type('value 2');
      cy.get('[name="value_3"]').type('value 3');
      cy.get('[name="value_4"]').type('value 4');

      cy.contains('button', 'Save').click();
    });
    it('Loads the second dropdown', () => {
      cy.get('#target_class').click();
      cy.get('[class="bx--list-box__menu-item__option"]').contains('User').click({force: true});
      cy.get('#selection_target').should('exist');
    });
  });
});
