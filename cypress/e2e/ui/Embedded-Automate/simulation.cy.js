/* eslint-disable no-undef */

describe('Automation > Embedded Automate > Simulation', () => {
  beforeEach(() => {
    cy.login();
    cy.menu('Automation', 'Embedded Automate', 'Simulation');
    cy.get('#resolve_form_div').should('be.visible');
  });

  describe('Automate Simulation Form', () => {
    it('Resets the form', () => {
      cy.getFormInputFieldByIdAndType({ inputId: 'object_request' }).type('Test Request');
      cy.changeSelect('target_class', 'User');

      cy.getFormSelectFieldById({ selectId: 'selection_target' }).select('Administrator');
      cy.getFormButtonByTypeWithText({ buttonText: 'Reset' }).scrollIntoView().click();

      cy.getFormInputFieldByIdAndType({ inputId: 'object_request' }).should('not.contain', 'Test Request');
      cy.getFormInputFieldByIdAndType({ inputId: 'target_class' }).should('have.value', '');
      cy.getFormSelectFieldById({ selectId: 'selection_target' }).should('not.exist');
    });

    it.only('Submits the form', () => {
      cy.get('#object_request').type('TestRequest');
      cy.get('#target_class').click();
      cy.get('[class="bx--list-box__menu-item__option"]').contains('User').click({force: true});

      cy.getFormSelectFieldById({ selectId: 'selection_target' }).select('Administrator');

      cy.getFormInputFieldByIdAndType({ inputId: 'attribute_1' }).type('attribute 1');
      cy.getFormInputFieldByIdAndType({ inputId: 'attribute_2' }).type('attribute 2');
      cy.getFormInputFieldByIdAndType({ inputId: 'attribute_3' }).type('attribute 3');
      cy.getFormInputFieldByIdAndType({ inputId: 'attribute_4' }).type('attribute 4');

      cy.getFormInputFieldByIdAndType({ inputId: 'value_1' }).type('value 1');
      cy.getFormInputFieldByIdAndType({ inputId: 'value_2' }).type('value 2');
      cy.getFormInputFieldByIdAndType({ inputId: 'value_3' }).type('value 3');
      cy.getFormInputFieldByIdAndType({ inputId: 'value_4' }).type('value 4');

      // cy.contains('button', 'Save').click();

      // cy.get('.bx--tabs__nav-item--selected > .bx--tabs--scrollable__nav-link');
      // cy.get('[class=bx--accordion__title').contains('Tree View');
      // cy.get('[class="react-tree-view');
    });

    it('Loads the second dropdown', () => {
      cy.changeSelect('target_class', 'User');
      cy.getFormSelectFieldById({ selectId: 'selection_target' }).should('exist');
    });
  });
});
