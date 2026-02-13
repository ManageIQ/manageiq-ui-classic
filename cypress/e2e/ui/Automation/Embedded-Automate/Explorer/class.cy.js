/* eslint-disable no-undef */
import { flashClassMap } from "../../../../../support/assertions/assertion_constants";

describe('Automation > Embedded Automate > Explorer', () => {
  beforeEach(() => {
    cy.appFactories([
      ['create', 'miq_ae_domain', {name: 'TestDomain'}],
    ]).then((results) => {
      cy.appFactories([
        ['create', 'miq_ae_namespace', {name: 'TestNameSpace', domain_id: results[0].id}]
      ])
    });

    cy.login();
    cy.intercept('POST', '/ops/accordion_select?id=rbac_accord').as('accordion');
    cy.menu('Automation', 'Embedded Automate', 'Explorer');
    cy.expect_explorer_title('Datastore');
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  describe('Class Form', () => {
    it('Cancel button works on the form', () => {
      // Clicks the Cancel button on the create class form
      cy.selectAccordionItem(['Datastore', 'TestDomain', 'TestNameSpace']);
      cy.toolbar('Configuration', 'Add a New Class');
      cy.getFormButtonByTypeWithText({ buttonText: 'Cancel' }).click(); // clicks Cancel button

      // Make sure that the cancel button redirects back to the namespace page
      cy.expect_explorer_title('Automate Namespace "TestNameSpace"');
      cy.expect_flash(flashClassMap.warning, 'cancelled');
      cy.expect_flash(flashClassMap.info, 'empty');
    });

    it('Reset button works on the form', () => {
      // Creates a Class
      cy.selectAccordionItem(['Datastore', 'TestDomain', 'TestNameSpace']);
      cy.toolbar('Configuration', 'Add a New Class');
      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type('TestClass');
      cy.getFormInputFieldByIdAndType({ inputId: 'display_name' }).type('Test Class 0');
      cy.getFormInputFieldByIdAndType({ inputId: 'description' }).type('This is a test class description');
      cy.getFormButtonByTypeWithText({ buttonText: 'Add', buttonType: 'submit' }).click();

      // Check for the success message
      cy.expect_flash(flashClassMap.success, 'added');

      // Navigate to the Properties tab of the class just created
      cy.selectAccordionItem(['Datastore', 'TestDomain', 'TestNameSpace', /Test Class 0/]);
      cy.tabs({ tabLabel: 'Properties' });

      // Edits the class
      cy.toolbar('Configuration', 'Edit this Class');
      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type('Edit');
      cy.getFormInputFieldByIdAndType({ inputId: 'display_name' }).clear().type('Edited Test Class');
      cy.getFormInputFieldByIdAndType({ inputId: 'description' }).clear().type('Edited test class description');

      // Click Reset Button
      cy.getFormButtonByTypeWithText({ buttonText: 'Reset' }).click();

      // Verify that the form was reset
      cy.expect_flash(flashClassMap.warning, 'reset');
      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).should('have.value', 'TestClass');
      cy.getFormInputFieldByIdAndType({ inputId: 'display_name' }).should('have.value', 'Test Class 0');
      cy.getFormInputFieldByIdAndType({ inputId: 'description' }).should('have.value', 'This is a test class description');

      // Click Cancel button
      cy.getFormButtonByTypeWithText({ buttonText: 'Cancel' }).click();

      // Removes class
      cy.toolbar('Configuration', 'Remove this Class');

      // Verify that the class was removed
      cy.expect_flash(flashClassMap.success, 'delete');
      cy.expect_flash(flashClassMap.info, 'empty');
    });

    it('Form validation works', () => {
      // Try to create a Class with an invalid name
      cy.selectAccordionItem(['Datastore', 'TestDomain', 'TestNameSpace']);

      cy.toolbar('Configuration', 'Add a New Class');
      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type('Test Class');
      cy.getFormInputFieldByIdAndType({ inputId: 'display_name' }).type('Test Class 0');
      cy.getFormInputFieldByIdAndType({ inputId: 'description' }).type('This is a test class description');

      // Verify that error message appears
      cy.expect_inline_field_errors({ containsText: 'Name may contain only alphanumeric and _ . - characters' });
      cy.getFormButtonByTypeWithText({ buttonText: 'Add', buttonType: 'submit' }).should('be.disabled');

      // Enter a valid name
      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).clear().type('TestClass');
      cy.getFormButtonByTypeWithText({ buttonText: 'Add', buttonType: 'submit' }).click();
      cy.expect_flash(flashClassMap.success, 'added');

      // Navigate to the Properties tab of the class just created
      cy.selectAccordionItem(['Datastore', 'TestDomain', 'TestNameSpace', /Test Class 0/]);
      cy.tabs({ tabLabel: 'Properties' });

      // Verify that the class created correctly
      cy.get(':nth-child(1) > .label_header').contains('Fully Qualified Name');
      cy.get(':nth-child(1) > .content_value').contains('/TestDomain/TestNameSpace/TestClass');
      cy.get(':nth-child(2) > .label_header').contains('Name');
      cy.get(':nth-child(2) > .content_value').contains('TestClass');
      cy.get(':nth-child(3) > .label_header').contains('Display Name');
      cy.get(':nth-child(3) > .content_value').contains('Test Class 0');
      cy.get(':nth-child(4) > .label_header').contains('Description');
      cy.get(':nth-child(4) > .content_value').contains('This is a test class description');
      cy.get(':nth-child(5) > .label_header').contains('Instances');
      cy.get(':nth-child(5) > .content_value').contains('0');

      cy.selectAccordionItem(['Datastore', 'TestDomain', 'TestNameSpace']);

      // Try to create a Class with the same name
      cy.toolbar('Configuration', 'Add a New Class');
      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type('TestClass');
      cy.getFormButtonByTypeWithText({ buttonText: 'Add', buttonType: 'submit' }).click();

      // Verify that error message appears
      cy.expect_flash(flashClassMap.error, 'taken');

      // Enter a new name
      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).clear().type('NewTestClass');
      cy.getFormInputFieldByIdAndType({ inputId: 'display_name' }).type('Test Class 1');
      cy.getFormInputFieldByIdAndType({ inputId: 'description' }).type('This is a test class description');
      cy.getFormButtonByTypeWithText({ buttonText: 'Add', buttonType: 'submit' }).click();

      // Check for the success message
      cy.expect_flash(flashClassMap.success, 'added');

      // Navigate to the Properties tab of the class just created
      cy.selectAccordionItem(['Datastore', 'TestDomain', 'TestNameSpace', /Test Class 1/]);
      cy.tabs({ tabLabel: 'Properties' });

      // Verify that the class created correctly
      cy.get(':nth-child(1) > .label_header').contains('Fully Qualified Name');
      cy.get(':nth-child(1) > .content_value').contains('/TestDomain/TestNameSpace/NewTestClass');
      cy.get(':nth-child(2) > .label_header').contains('Name');
      cy.get(':nth-child(2) > .content_value').contains('NewTestClass');
      cy.get(':nth-child(3) > .label_header').contains('Display Name');
      cy.get(':nth-child(3) > .content_value').contains('Test Class 1');
      cy.get(':nth-child(4) > .label_header').contains('Description');
      cy.get(':nth-child(4) > .content_value').contains('This is a test class description');
      cy.get(':nth-child(5) > .label_header').contains('Instances');
      cy.get(':nth-child(5) > .content_value').contains('0');

      // Removes class
      cy.toolbar('Configuration', 'Remove this Class');

      // Verify that the class was removed
      cy.expect_flash(flashClassMap.success, 'delete');

      // Navigate to the Properties tab of the first class just created
      cy.selectAccordionItem(['Datastore', 'TestDomain', 'TestNameSpace', /Test Class 0/]);

      // Removes class
      cy.toolbar('Configuration', 'Remove this Class');

      // Verify that the class was removed
      cy.expect_flash(flashClassMap.success, 'delete');
      cy.expect_flash(flashClassMap.info, 'empty');
    });

    it('Creates and edits an automate class', () => {
      // Creates a Class
      cy.selectAccordionItem(['Datastore', 'TestDomain', 'TestNameSpace']);
      cy.toolbar('Configuration', 'Add a New Class');
      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type('TestClass');
      cy.getFormInputFieldByIdAndType({ inputId: 'display_name' }).type('Test Class 0');
      cy.getFormInputFieldByIdAndType({ inputId: 'description' }).type('This is a test class description');
      cy.getFormButtonByTypeWithText({ buttonText: 'Add', buttonType: 'submit' }).click();

      // Check for the success message
      cy.expect_flash(flashClassMap.success, 'added');

      // Navigate to the Properties tab of the class just created
      cy.selectAccordionItem(['Datastore', 'TestDomain', 'TestNameSpace', /Test Class 0/]);
      cy.tabs({ tabLabel: 'Properties' });

      // Verify that the class created correctly
      cy.get(':nth-child(1) > .label_header').contains('Fully Qualified Name');
      cy.get(':nth-child(1) > .content_value').contains('/TestDomain/TestNameSpace/TestClass');
      cy.get(':nth-child(2) > .label_header').contains('Name');
      cy.get(':nth-child(2) > .content_value').contains('TestClass');
      cy.get(':nth-child(3) > .label_header').contains('Display Name');
      cy.get(':nth-child(3) > .content_value').contains('Test Class 0');
      cy.get(':nth-child(4) > .label_header').contains('Description');
      cy.get(':nth-child(4) > .content_value').contains('This is a test class description');
      cy.get(':nth-child(5) > .label_header').contains('Instances');
      cy.get(':nth-child(5) > .content_value').contains('0');

      // Edits the class
      cy.toolbar('Configuration', 'Edit this Class');
      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type('Edit');
      cy.getFormInputFieldByIdAndType({ inputId: 'display_name' }).clear().type('Edited Test Class');
      cy.getFormInputFieldByIdAndType({ inputId: 'description' }).clear().type('Edited test class description');
      cy.getFormButtonByTypeWithText({ buttonText: 'Save', buttonType: 'submit' }).click();

      // Navigate to the Properties tab of the class just edited
      cy.tabs({ tabLabel: 'Properties' });

      // Verify that the class edited correctly
      cy.get(':nth-child(1) > .label_header').contains('Fully Qualified Name');
      cy.get(':nth-child(1) > .content_value').contains('/TestDomain/TestNameSpace/TestClassEdit');
      cy.get(':nth-child(2) > .label_header').contains('Name');
      cy.get(':nth-child(2) > .content_value').contains('TestClassEdit');
      cy.get(':nth-child(3) > .label_header').contains('Display Name');
      cy.get(':nth-child(3) > .content_value').contains('Edited Test Class');
      cy.get(':nth-child(4) > .label_header').contains('Description');
      cy.get(':nth-child(4) > .content_value').contains('Edited test class description');
      cy.get(':nth-child(5) > .label_header').contains('Instances');
      cy.get(':nth-child(5) > .content_value').contains('0');

      // Removes class
      cy.toolbar('Configuration', 'Remove this Class');

      // Verify that the class was removed
      cy.expect_flash(flashClassMap.success, 'delete');
      cy.expect_flash(flashClassMap.info, 'empty');
    });
  });
});
