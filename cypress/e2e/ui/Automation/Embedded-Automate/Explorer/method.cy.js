import { flashClassMap } from '../../../../../support/assertions/assertion_constants';

// Accordion / tree
const DATASTORE = 'Datastore';
const DOMAIN_NAME = 'TestDomain';
const NAMESPACE_NAME = 'TestNamespace';
const CLASS_NAME = 'TestClass';

// Toolbar
const TOOLBAR_CONFIGURATION = 'Configuration';
const TOOLBAR_COPY_METHOD = 'Copy this Method';
const TOOLBAR_COPY_SELECTED = 'Copy selected Methods';

// Flash text snippets
const FLASH_SAVED = 'saved';
const FLASH_CANCELLED = 'cancelled';

// Method display names used in verification
const SOURCE_METHOD_DISPLAY = 'Source Method';
const TARGET_METHOD_DISPLAY = 'Target Method';

/**
 * Selects both methods in the Methods tab and opens the copy-selected form.
 */
function selectBothMethodsAndOpenCopyForm() {
  cy.selectAccordionItem([DATASTORE, DOMAIN_NAME, NAMESPACE_NAME, CLASS_NAME]);
  cy.tabs({ tabLabel: 'Methods' });
  cy.get('#methods .miq-data-table table tbody tr').should('have.length.at.least', 2).then((rows) => {
    cy.wrap(rows).eq(0).find('.cds--checkbox-label').click();
    cy.wrap(rows).eq(1).find('.cds--checkbox-label').click();
  });
  cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_COPY_SELECTED);

  // Assert the selected-items table shows 2 rows and no new_name field
  cy.get('.ae-selected-items-table').should('be.visible');
  cy.get('.ae-selected-items-table tbody tr').should('have.length', 2);
  cy.get('input#new_name').should('not.exist');
}

/**
 * Copies multiple methods to a target domain/namespace and verifies the result.
 * @param {Object} opts
 * @param {string} opts.targetDomain    - Domain to copy into
 * @param {string} opts.targetNamespace - Namespace to copy into
 * @param {boolean} [opts.changeDomain] - Whether to select a different domain in the form (default false)
 */
function copyMultipleMethodsAndVerify({ targetDomain, targetNamespace, changeDomain = false }) {
  selectBothMethodsAndOpenCopyForm();

  cy.getFormButtonByTypeWithText({ buttonText: 'Copy', buttonType: 'submit' }).should('be.disabled');

  if (changeDomain) {
    cy.getFormSelectFieldById({ selectId: 'domain' }).select(targetDomain);
  }

  cy.getFormInputFieldByIdAndType({ inputId: 'override_source', inputType: 'checkbox' }).uncheck({ force: true });
  cy.selectNamespaceFromTree({ domainName: targetDomain, namespaceName: targetNamespace });

  cy.getFormButtonByTypeWithText({ buttonText: 'Copy', buttonType: 'submit' }).should('not.be.disabled');
  cy.getFormButtonByTypeWithText({ buttonText: 'Copy', buttonType: 'submit' }).click();

  cy.expect_flash(flashClassMap.success, FLASH_SAVED);

  cy.selectAccordionItem([DATASTORE, targetDomain, targetNamespace, CLASS_NAME]);
  cy.tabs({ tabLabel: 'Methods' });
  cy.get('#methods .miq-data-table table tbody')
    .should('contain', SOURCE_METHOD_DISPLAY)
    .and('contain', TARGET_METHOD_DISPLAY);
}

describe('Automation > Embedded Automate > Explorer > Method Workflows', () => {
  beforeEach(() => {
    cy.appFactories([
      ['create', 'miq_ae_domain', { name: DOMAIN_NAME }],
    ]).then(([domain]) => {
      cy.appFactories([
        ['create', 'miq_ae_namespace', { name: NAMESPACE_NAME, domain_id: domain.id }],
      ]).then(([ns]) => {
        cy.appFactories([
          ['create', 'miq_ae_class', { name: CLASS_NAME, namespace_id: ns.id }],
        ]).then(([cls]) => {
          cy.appFactories([
            [
              'create',
              'miq_ae_method',
              {
                name: 'source_method',
                display_name: SOURCE_METHOD_DISPLAY,
                class_id: cls.id,
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
                display_name: TARGET_METHOD_DISPLAY,
                class_id: cls.id,
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
      cy.selectAccordionItem([DATASTORE, DOMAIN_NAME, NAMESPACE_NAME, CLASS_NAME, /Source Method/]);
      cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_COPY_METHOD);

      cy.get('form').should('contain', SOURCE_METHOD_DISPLAY);
      cy.getFormInputFieldByIdAndType({ inputId: 'new_name' }).type('copied_method');
      cy.getFormButtonByTypeWithText({ buttonText: 'Copy', buttonType: 'submit' }).click();

      cy.expect_flash(flashClassMap.success, FLASH_SAVED);

      cy.selectAccordionItem([DATASTORE, DOMAIN_NAME, NAMESPACE_NAME, CLASS_NAME]);
      cy.tabs({ tabLabel: 'Methods' });
      cy.get('#methods .miq-data-table table tbody tr').should('have.length', 3);
      cy.selectAccordionItem([DATASTORE, DOMAIN_NAME, NAMESPACE_NAME, CLASS_NAME, /copied_method/]);
    });

    it('should copy method to a different namespace', () => {
      cy.appFactories([
        ['create', 'miq_ae_domain', { name: 'TargetDomain' }],
      ]).then(([domain]) => {
        cy.appFactories([
          ['create', 'miq_ae_namespace', { name: 'TargetNamespace', domain_id: domain.id }],
        ]);
      });

      cy.selectAccordionItem([DATASTORE, DOMAIN_NAME, NAMESPACE_NAME, CLASS_NAME, /Source Method/]);
      cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_COPY_METHOD);

      cy.getFormSelectFieldById({ selectId: 'domain' }).select('TargetDomain');
      cy.getFormInputFieldByIdAndType({ inputId: 'override_source', inputType: 'checkbox' }).uncheck({ force: true });
      cy.selectNamespaceFromTree({ domainName: 'TargetDomain', namespaceName: 'TargetNamespace' });
      cy.getFormButtonByTypeWithText({ buttonText: 'Copy', buttonType: 'submit' }).click();

      cy.expect_flash(flashClassMap.success, FLASH_SAVED);

      cy.selectAccordionItem([DATASTORE, 'TargetDomain', 'TargetNamespace', CLASS_NAME]);
      cy.tabs({ tabLabel: 'Methods' });
      cy.get('#methods .miq-data-table table tbody').should('contain', SOURCE_METHOD_DISPLAY);
      cy.selectAccordionItem([DATASTORE, 'TargetDomain', 'TargetNamespace', CLASS_NAME, /Source Method/]);
    });

    it('should copy method with override existing option', () => {
      cy.selectAccordionItem([DATASTORE, DOMAIN_NAME, NAMESPACE_NAME, CLASS_NAME, /Source Method/]);
      cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_COPY_METHOD);

      cy.getFormInputFieldByIdAndType({ inputId: 'new_name' }).type('target_method');
      cy.getFormInputFieldByIdAndType({ inputId: 'override_existing', inputType: 'checkbox' }).check({ force: true });
      cy.getFormButtonByTypeWithText({ buttonText: 'Copy', buttonType: 'submit' }).click();

      cy.expect_flash(flashClassMap.success, FLASH_SAVED);

      // After override, target_method is overwritten; verify 2 methods remain
      cy.selectAccordionItem([DATASTORE, DOMAIN_NAME, NAMESPACE_NAME, CLASS_NAME]);
      cy.tabs({ tabLabel: 'Methods' });
      cy.get('#methods .miq-data-table table tbody tr').should('have.length', 2);
      cy.selectAccordionItem([DATASTORE, DOMAIN_NAME, NAMESPACE_NAME, CLASS_NAME, /target_method/]);
    });

    it('should copy multiple methods to a different namespace in the same domain', () => {
      cy.appEval("MiqAeDomain.find_by(name: 'TestDomain').id").then((domainId) => {
        cy.appFactories([
          ['create', 'miq_ae_namespace', { name: 'TargetNamespace', domain_id: domainId }],
        ]).then(() => {
          copyMultipleMethodsAndVerify({
            targetDomain: DOMAIN_NAME,
            targetNamespace: 'TargetNamespace',
            changeDomain: false,
          });
        });
      });
    });

    it('should copy multiple methods to a different domain', () => {
      cy.appFactories([
        ['create', 'miq_ae_domain', { name: 'TargetDomain2' }],
      ]).then(([domain]) => {
        cy.appFactories([
          ['create', 'miq_ae_namespace', { name: 'TargetNamespace2', domain_id: domain.id }],
        ]).then(() => {
          copyMultipleMethodsAndVerify({
            targetDomain: 'TargetDomain2',
            targetNamespace: 'TargetNamespace2',
            changeDomain: true,
          });
        });
      });
    });

    it('should handle cancel on copy form', () => {
      cy.selectAccordionItem([DATASTORE, DOMAIN_NAME, NAMESPACE_NAME, CLASS_NAME, /Source Method/]);
      cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_COPY_METHOD);

      cy.getFormButtonByTypeWithText({ buttonText: 'Cancel' }).click();

      cy.expect_flash(flashClassMap.warning, FLASH_CANCELLED);
    });
  });
});
