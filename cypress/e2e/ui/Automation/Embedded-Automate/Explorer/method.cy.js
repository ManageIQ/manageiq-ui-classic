import { flashClassMap } from '../../../../../support/assertions/assertion_constants';

describe('Automation > Embedded Automate > Explorer > Method Workflows', () => {
  beforeEach(() => {
    cy.appFactories([
      ['create', 'miq_ae_domain', { name: 'TestDomain' }],
    ]).then((domainData) => {
      cy.appFactories([
        ['create', 'miq_ae_namespace', { name: 'TestNamespace', domain_id: domainData[0].id }],
      ]).then((nsData) => {
        cy.appFactories([
          ['create', 'miq_ae_class', { name: 'TestClass', namespace_id: nsData[0].id }],
        ]).then((classData) => {
          cy.appFactories([
            [
              'create',
              'miq_ae_method',
              {
                name: 'source_method',
                display_name: 'Source Method',
                class_id: classData[0].id,
                scope: 'class',
                language: 'ruby',
                location: 'inline',
              },
            ],
            [
              'create',
              'miq_ae_method',
              {
                name: 'target_method',
                display_name: 'Target Method',
                class_id: classData[0].id,
                scope: 'class',
                language: 'ruby',
                location: 'inline',
              },
            ],
          ]);
        });
      });
    });

    cy.login();
    cy.menu('Automation', 'Embedded Automate', 'Explorer');
    cy.expect_explorer_title('Datastore');
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  describe('Copy Method', () => {
    it('should copy method to same class', () => {
      cy.selectAccordionItem(['Datastore', 'TestDomain', 'TestNamespace', 'TestClass', /Source Method/]);
      cy.toolbar('Configuration', 'Copy this Method');

      cy.get('form').should('contain', 'Source Method');

      cy.getFormInputFieldByIdAndType({ inputId: 'new_name' }).type('copied_method');

      cy.getFormButtonByTypeWithText({ buttonText: 'Copy', buttonType: 'submit' }).click();

      cy.expect_flash(flashClassMap.success, 'saved');
    });

    it('should show namespace selector and copy method to different namespace when copy to same path is unchecked', () => {
      cy.selectAccordionItem(['Datastore', 'TestDomain', 'TestNamespace', 'TestClass', /Source Method/]);
      cy.toolbar('Configuration', 'Copy this Method');

      cy.getFormInputFieldByIdAndType({ inputId: 'override_source', inputType: 'checkbox' }).uncheck({ force: true });

      cy.get('input#namespace').should('be.visible');
      cy.get('input#namespace').clear().type('TestDomain/TestNamespace/TargetClass');

      cy.getFormInputFieldByIdAndType({ inputId: 'new_name' }).type('copied_to_different_namespace');

      cy.getFormButtonByTypeWithText({ buttonText: 'Copy', buttonType: 'submit' }).click();

      cy.expect_flash(flashClassMap.success, 'saved');
    });

    it('should copy method with override existing option', () => {
      cy.selectAccordionItem(['Datastore', 'TestDomain', 'TestNamespace', 'TestClass', /Source Method/]);
      cy.toolbar('Configuration', 'Copy this Method');

      cy.getFormInputFieldByIdAndType({ inputId: 'new_name' }).type('target_method');
      cy.getFormInputFieldByIdAndType({ inputId: 'override_existing', inputType: 'checkbox' }).check({ force: true });

      cy.getFormButtonByTypeWithText({ buttonText: 'Copy', buttonType: 'submit' }).click();

      cy.expect_flash(flashClassMap.success, 'saved');
    });

    it('should handle cancel on copy form', () => {
      cy.selectAccordionItem(['Datastore', 'TestDomain', 'TestNamespace', 'TestClass', /Source Method/]);
      cy.toolbar('Configuration', 'Copy this Method');

      cy.getFormButtonByTypeWithText({ buttonText: 'Cancel' }).click();

      cy.expect_flash(flashClassMap.warning, 'cancelled');
    });
  });
});
