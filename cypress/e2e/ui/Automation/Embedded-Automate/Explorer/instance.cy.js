import { flashClassMap } from '../../../../../support/assertions/assertion_constants';

describe('Automation > Embedded Automate > Explorer > Instance', () => {
  beforeEach(() => {
    cy.appFactories([
      ['create', 'miq_ae_domain', { name: 'TestDomain' }],
    ]).then((results) => {
      cy.appFactories([
        ['create', 'miq_ae_namespace', { name: 'TestNamespace', domain_id: results[0].id }],
      ]).then((namespaceResults) => {
        cy.appFactories([
          ['create', 'miq_ae_class', { name: 'TestClass', namespace_id: namespaceResults[0].id }],
        ]);
      });
    });

    cy.login();
    cy.menu('Automation', 'Embedded Automate', 'Explorer');
    cy.expect_explorer_title('Datastore');
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  describe('Add Instance', () => {
    it('should create a new instance successfully', () => {
      cy.selectAccordionItem(['Datastore', 'TestDomain', 'TestNamespace', 'TestClass']);
      cy.tabs({ tabLabel: 'Instances' });
      cy.toolbar('Configuration', 'Add a New Instance');

      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type('test_instance');
      cy.getFormInputFieldByIdAndType({ inputId: 'display_name' }).type('Test Instance');
      cy.getFormInputFieldByIdAndType({ inputId: 'description' }).type('Test instance description');

      cy.getFormButtonByTypeWithText({ buttonText: 'Add', buttonType: 'submit' }).click();

      cy.expect_flash(flashClassMap.success, 'added');
    });

    it('should handle cancel button', () => {
      cy.selectAccordionItem(['Datastore', 'TestDomain', 'TestNamespace', 'TestClass']);
      cy.tabs({ tabLabel: 'Instances' });
      cy.toolbar('Configuration', 'Add a New Instance');

      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type('test_instance');
      cy.getFormButtonByTypeWithText({ buttonText: 'Cancel' }).click();

      // Verify redirect back to class
      cy.expect_explorer_title('Automate Class "TestClass"');
      cy.expect_flash(flashClassMap.warning, 'cancelled');
    });
  });

  describe('Edit Instance', () => {
    beforeEach(() => {
      // Create an instance to edit
      cy.selectAccordionItem(['Datastore', 'TestDomain', 'TestNamespace', 'TestClass']);
      cy.tabs({ tabLabel: 'Instances' });
      cy.toolbar('Configuration', 'Add a New Instance');
      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type('edit_test_instance');
      cy.getFormInputFieldByIdAndType({ inputId: 'display_name' }).type('Edit Test Instance');
      cy.getFormInputFieldByIdAndType({ inputId: 'description' }).type('Original description');
      cy.getFormButtonByTypeWithText({ buttonText: 'Add', buttonType: 'submit' }).click();
      cy.expect_flash(flashClassMap.success, 'added');
    });

    it('should edit an existing instance successfully', () => {
      cy.selectAccordionItem(['Datastore', 'TestDomain', 'TestNamespace', 'TestClass', /Edit Test Instance/]);
      cy.toolbar('Configuration', 'Edit this Instance');

      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).clear().type('edited_instance');
      cy.getFormInputFieldByIdAndType({ inputId: 'display_name' }).clear().type('Edited Instance');
      cy.getFormInputFieldByIdAndType({ inputId: 'description' }).clear().type('Updated description');

      cy.getFormButtonByTypeWithText({ buttonText: 'Save', buttonType: 'submit' }).click();

      cy.expect_flash(flashClassMap.success, 'saved');
    });

    it('should disable save button when no changes are made', () => {
      cy.selectAccordionItem(['Datastore', 'TestDomain', 'TestNamespace', 'TestClass', /Edit Test Instance/]);
      cy.toolbar('Configuration', 'Edit this Instance');

      cy.getFormButtonByTypeWithText({ buttonText: 'Save', buttonType: 'submit' }).should('be.disabled');

      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).clear().type('modified_name');

      cy.getFormButtonByTypeWithText({ buttonText: 'Save', buttonType: 'submit' }).should('not.be.disabled');

      cy.getFormButtonByTypeWithText({ buttonText: 'Reset' }).click();

      cy.getFormButtonByTypeWithText({ buttonText: 'Save', buttonType: 'submit' }).should('be.disabled');
    });

    it('should handle reset button on edit form', () => {
      cy.selectAccordionItem(['Datastore', 'TestDomain', 'TestNamespace', 'TestClass', /Edit Test Instance/]);
      cy.toolbar('Configuration', 'Edit this Instance');

      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).clear().type('modified_name');
      cy.getFormInputFieldByIdAndType({ inputId: 'display_name' }).clear().type('Modified Display');

      cy.getFormButtonByTypeWithText({ buttonText: 'Reset' }).click();

      cy.expect_flash(flashClassMap.warning, 'reset');

      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).should('have.value', 'edit_test_instance');
      cy.getFormInputFieldByIdAndType({ inputId: 'display_name' }).should('have.value', 'Edit Test Instance');
      cy.getFormInputFieldByIdAndType({ inputId: 'description' }).should('have.value', 'Original description');

      cy.get('h3').contains('Main Info').should('be.visible');
    });
  });

  describe('Copy Instance', () => {
    beforeEach(() => {
      // Create an instance to copy
      cy.selectAccordionItem(['Datastore', 'TestDomain', 'TestNamespace', 'TestClass']);
      cy.tabs({ tabLabel: 'Instances' });
      cy.toolbar('Configuration', 'Add a New Instance');
      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type('source_instance');
      cy.getFormInputFieldByIdAndType({ inputId: 'display_name' }).type('Source Instance');
      cy.getFormInputFieldByIdAndType({ inputId: 'description' }).type('Instance to copy');
      cy.getFormButtonByTypeWithText({ buttonText: 'Add', buttonType: 'submit' }).click();
      cy.expect_flash(flashClassMap.success, 'added');
    });

    it('should copy instance to same class', () => {
      cy.selectAccordionItem(['Datastore', 'TestDomain', 'TestNamespace', 'TestClass', /Source Instance/]);
      cy.toolbar('Configuration', 'Copy this Instance');

      cy.get('form').should('contain', 'Source Instance');

      cy.getFormInputFieldByIdAndType({ inputId: 'new_name' }).type('copied_instance');

      cy.getFormButtonByTypeWithText({ buttonText: 'Copy', buttonType: 'submit' }).click();

      cy.expect_flash(flashClassMap.success, 'saved');
    });

    it('should copy instance to different class when copy to same path is unchecked', () => {
      cy.selectAccordionItem(['Datastore', 'TestDomain', 'TestNamespace', 'TestClass', /Source Instance/]);
      cy.toolbar('Configuration', 'Copy this Instance');

      cy.getFormInputFieldByIdAndType({ inputId: 'override_source', inputType: 'checkbox' }).uncheck({ force: true });

      cy.get('input#namespace').should('be.visible');
      cy.get('input#namespace').clear().type('TestDomain/TestNamespace/TargetClass');

      cy.getFormInputFieldByIdAndType({ inputId: 'new_name' }).type('copied_to_different_class');

      cy.getFormButtonByTypeWithText({ buttonText: 'Copy', buttonType: 'submit' }).click();

      cy.expect_flash(flashClassMap.success, 'saved');
    });

    it('should copy instance with override existing option', () => {
      cy.selectAccordionItem(['Datastore', 'TestDomain', 'TestNamespace', 'TestClass']);
      cy.tabs({ tabLabel: 'Instances' });
      cy.toolbar('Configuration', 'Add a New Instance');
      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type('target_instance');
      cy.getFormInputFieldByIdAndType({ inputId: 'display_name' }).type('Target Instance');
      cy.getFormButtonByTypeWithText({ buttonText: 'Add', buttonType: 'submit' }).click();
      cy.expect_flash(flashClassMap.success, 'added');

      cy.selectAccordionItem(['Datastore', 'TestDomain', 'TestNamespace', 'TestClass', /Source Instance/]);
      cy.toolbar('Configuration', 'Copy this Instance');

      cy.getFormInputFieldByIdAndType({ inputId: 'new_name' }).type('target_instance');
      cy.getFormInputFieldByIdAndType({ inputId: 'override_existing', inputType: 'checkbox' }).check({ force: true });

      cy.getFormButtonByTypeWithText({ buttonText: 'Copy', buttonType: 'submit' }).click();

      cy.expect_flash(flashClassMap.success, 'saved');
    });

    it('should handle cancel on copy form', () => {
      cy.selectAccordionItem(['Datastore', 'TestDomain', 'TestNamespace', 'TestClass', /Source Instance/]);
      cy.toolbar('Configuration', 'Copy this Instance');

      cy.getFormButtonByTypeWithText({ buttonText: 'Cancel' }).click();

      cy.expect_flash(flashClassMap.warning, 'cancelled');
    });
  });
});
