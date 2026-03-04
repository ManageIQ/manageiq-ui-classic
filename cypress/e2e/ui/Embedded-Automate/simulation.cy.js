/* eslint-disable no-undef */

describe('Automation > Embedded Automate > Simulation', () => {
  beforeEach(() => {
    cy.login();
    cy.menu('Automation', 'Embedded Automate', 'Simulation');
    cy.get('#resolve_form_div').should('be.visible');
  });

  describe('Automate Simulation Form', () => {
    it('Resets the form', () => {
      // Fill out form values
      cy.getFormInputFieldByIdAndType({ inputId: 'object_request' }).type('Test Request');
      cy.changeSelect('target_class', 'User');
      cy.getFormSelectFieldById({ selectId: 'target_id_User' }).select('Administrator');

      // Click reset button
      cy.getFormButtonByTypeWithText({ buttonText: 'Reset' }).scrollIntoView().click();

      // Make sure values get reset to initial values
      cy.getFormInputFieldByIdAndType({ inputId: 'object_request' }).should('not.contain', 'Test Request');
      cy.getFormInputFieldByIdAndType({ inputId: 'target_class' }).should('have.value', '');
      cy.getFormSelectFieldById({ selectId: 'target_id_undefined' }).should('not.exist');
    });

    it('Submits the form', () => {
      // Fill out form values for request, target class and target id
      cy.getFormInputFieldByIdAndType({ inputId: 'object_request' }).type('TestRequest');
      cy.changeSelect('target_class', 'User');
      cy.getFormSelectFieldById({ selectId: 'target_id_User' }).select('Administrator');

      // Fill out attribute values
      cy.getFormButtonByTypeWithText({ buttonText: 'Add' }).click();
      cy.getFormInputFieldByIdAndType({ inputId: 'attrs[0].attribute' }).type('attribute 1');
      cy.getFormInputFieldByIdAndType({ inputId: 'attrs[0].value' }).type('value 1');

      cy.getFormButtonByTypeWithText({ buttonText: 'Add' }).click();
      cy.getFormInputFieldByIdAndType({ inputId: 'attrs[1].attribute' }).type('attribute 2');
      cy.getFormInputFieldByIdAndType({ inputId: 'attrs[1].value' }).type('value 2');

      cy.getFormButtonByTypeWithText({ buttonText: 'Add' }).click();
      cy.getFormInputFieldByIdAndType({ inputId: 'attrs[2].attribute' }).type('attribute 3');
      cy.getFormInputFieldByIdAndType({ inputId: 'attrs[2].value' }).type('value 3');

      cy.getFormButtonByTypeWithText({ buttonText: 'Add' }).click();
      cy.getFormInputFieldByIdAndType({ inputId: 'attrs[3].attribute' }).type('attribute 4');
      cy.getFormInputFieldByIdAndType({ inputId: 'attrs[3].value' }).type('value 4');

      // Click the save button
      cy.getFormButtonByTypeWithText({ buttonText: 'Save', buttonType: 'submit' }).click();

      // Clear the notifications if there are any
      cy.get('body').then($body => {
        if ($body.find('.toast-pf').length) {
          cy.get(':nth-child(1) > .toast-pf > :nth-child(2)').click();
        }
      });

      // Check if the tree view renders
      cy.get('.cds--accordion__content');

      // Expand the tree view
      cy.get('.fa').click();

      // Check the tree view for all the correct values and attributes entered in the form
      cy.get('.indent-0 > span').contains('ManageIQ/System / PROCESS / Request');
      cy.get('span').contains('instance = Request').should('be.visible');

      cy.get('span').contains('attribute 1').parent().find('.fa').click();
      cy.get('span').contains('name = attribute 1').should('be.visible');
      cy.get('span').contains('value 1').should('be.visible');

      cy.get('span').contains('attribute 2').parent().find('.fa').click();
      cy.get('span').contains('name = attribute 2').should('be.visible');
      cy.get('span').contains('value 2').should('be.visible');

      cy.get('span').contains('attribute 3').parent().find('.fa').click();
      cy.get('span').contains('name = attribute 3').should('be.visible');
      cy.get('span').contains('value 3').should('be.visible');

      cy.get('span').contains('attribute 4').parent().find('.fa').click();
      cy.get('span').contains('name = attribute 4').should('be.visible');
      cy.get('span').contains('value 4').should('be.visible');

      cy.get('span').contains('message').parent().find('.fa').click();
      cy.get('span').contains('name = message').should('be.visible');
      cy.get('span').contains('create').should('be.visible');

      cy.get('span').contains('request').parent().find('.fa').click();
      cy.get('span').contains('name = request').should('be.visible');
      cy.get('span').contains('TestRequest').should('be.visible');

      // Click the Xml View tab and make sure the xml view renders
      cy.tabs({ tabLabel: 'Xml View' });
      cy.get('#xml_holder');

      // Click the Object info tab and make sure the object info renders with all the correct values
      cy.tabs({ tabLabel: 'Object info'});
      cy.get('.expand').should('contain', '/SYSTEM/PROCESS/Request')
        .and('contain', 'attribute%201=value%201')
        .and('contain', 'attribute%202=value%202')
        .and('contain', 'attribute%203=value%203')
        .and('contain', 'attribute%204=value%204')
        .and('contain', 'message=create')
        .and('contain', 'request=TestRequest');
    });
  });
});
