import { flashClassMap } from '../../../../../support/assertions/assertion_constants';

// Accordion / tree
const DATASTORE = 'Datastore';
const DOMAIN_NAME = 'TestDomain';
const NAMESPACE_NAME = 'TestNameSpace';

// Toolbar
const TOOLBAR_CONFIGURATION = 'Configuration';
const TOOLBAR_ADD_CLASS = 'Add a New Class';
const TOOLBAR_EDIT_CLASS = 'Edit this Class';
const TOOLBAR_REMOVE_CLASS = 'Remove this Class';
const TOOLBAR_COPY_CLASS = 'Copy this Class';
const TOOLBAR_COPY_SELECTED = 'Copy selected Classes';

// Form field IDs
const FIELD_NAME = 'name';
const FIELD_DISPLAY_NAME = 'display_name';
const FIELD_DESCRIPTION = 'description';

// Flash text snippets
const FLASH_ADDED = 'added';
const FLASH_SAVED = 'saved';
const FLASH_CANCELLED = 'cancelled';
const FLASH_RESET = 'reset';
const FLASH_DELETED = 'delete';

// Class data
const CLASS_NAME = 'TestClass';
const CLASS_DISPLAY_NAME = 'Test Class 0';
const CLASS_DESCRIPTION = 'This is a test class description';

/**
 * Verifies the properties tab rows for a given class.
 * @param {Object} opts
 * @param {string} opts.fqn         - Expected Fully Qualified Name value
 * @param {string} opts.name        - Expected Name value
 * @param {string} opts.displayName - Expected Display Name value
 * @param {string} opts.description - Expected Description value
 */
function verifyClassProperties({ fqn, name, displayName, description }) {
  cy.contains('.label_header', 'Fully Qualified Name')
    .siblings('.content_value').should('contain', fqn);
  cy.contains('.label_header', 'Name')
    .siblings('.content_value').should('contain', name);
  cy.contains('.label_header', 'Display Name')
    .siblings('.content_value').should('contain', displayName);
  cy.contains('.label_header', 'Description')
    .siblings('.content_value').should('contain', description);
  cy.contains('.label_header', 'Instances')
    .siblings('.content_value').should('contain', '0');
}

/**
 * Fills and submits the Add Class form.
 * @param {Object} opts
 * @param {string} opts.name        - Class name
 * @param {string} [opts.displayName] - Display name (optional)
 * @param {string} [opts.description] - Description (optional)
 */
function fillAndSubmitClassForm({ name, displayName = '', description = '' }) {
  cy.getFormInputFieldByIdAndType({ inputId: FIELD_NAME }).type(name);
  if (displayName) {
    cy.getFormInputFieldByIdAndType({ inputId: FIELD_DISPLAY_NAME }).type(displayName);
  }
  if (description) {
    cy.getFormInputFieldByIdAndType({ inputId: FIELD_DESCRIPTION }).type(description);
  }
  cy.getFormButtonByTypeWithText({ buttonText: 'Add', buttonType: 'submit' }).click();
}

/**
 * Selects two rows in the class table and opens the copy-selected form.
 */
function selectBothClassesAndOpenCopyForm() {
  cy.selectAccordionItem([DATASTORE, DOMAIN_NAME, NAMESPACE_NAME]);
  cy.get('.miq-data-table table tbody tr').should('have.length.at.least', 2).then((rows) => {
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
 * Copies multiple classes to a target domain/namespace and verifies the result.
 * Handles both same-domain (no domain select needed) and cross-domain scenarios.
 * @param {Object} opts
 * @param {string} opts.targetDomain     - Domain to copy into
 * @param {string} opts.targetNamespace  - Namespace to copy into
 * @param {boolean} [opts.changeDomain]  - Whether to select a different domain in the form (default false)
 */
function copyMultipleClassesAndVerify({ targetDomain, targetNamespace, changeDomain = false }) {
  selectBothClassesAndOpenCopyForm();

  cy.getFormButtonByTypeWithText({ buttonText: 'Copy', buttonType: 'submit' }).should('be.disabled');

  if (changeDomain) {
    cy.getFormSelectFieldById({ selectId: 'domain' }).select(targetDomain);
  }

  cy.getFormInputFieldByIdAndType({ inputId: 'override_source', inputType: 'checkbox' }).uncheck({ force: true });
  cy.selectNamespaceFromTree({ domainName: targetDomain, namespaceName: targetNamespace });

  cy.getFormButtonByTypeWithText({ buttonText: 'Copy', buttonType: 'submit' }).should('not.be.disabled');
  cy.getFormButtonByTypeWithText({ buttonText: 'Copy', buttonType: 'submit' }).click();

  cy.expect_flash(flashClassMap.success, FLASH_SAVED);

  cy.selectAccordionItem([DATASTORE, targetDomain, targetNamespace]);
  cy.get('.miq-data-table table tbody')
    .should('contain', CLASS_NAME)
    .and('contain', 'TestClass2');
}

describe('Automation > Embedded Automate > Explorer', () => {
  beforeEach(() => {
    cy.appFactories([
      ['create', 'miq_ae_domain', { name: DOMAIN_NAME }],
    ]).then(([domain]) => {
      cy.appFactories([
        ['create', 'miq_ae_namespace', { name: NAMESPACE_NAME, domain_id: domain.id }],
      ]);
    });

    cy.login();
    cy.menu('Automation', 'Embedded Automate', 'Explorer');
    cy.expect_explorer_title('Datastore');
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  describe('Class Form', () => {
    it('Cancel button works on the form', () => {
      cy.selectAccordionItem([DATASTORE, DOMAIN_NAME, NAMESPACE_NAME]);
      cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_ADD_CLASS);
      cy.getFormButtonByTypeWithText({ buttonText: 'Cancel' }).click();

      cy.expect_explorer_title('Automate Namespace "TestNameSpace"');
      cy.expect_flash(flashClassMap.warning, FLASH_CANCELLED);
      cy.expect_flash(flashClassMap.info, 'empty');
    });

    it('Reset button works on the form', () => {
      cy.selectAccordionItem([DATASTORE, DOMAIN_NAME, NAMESPACE_NAME]);
      cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_ADD_CLASS);
      fillAndSubmitClassForm({ name: CLASS_NAME, displayName: CLASS_DISPLAY_NAME, description: CLASS_DESCRIPTION });
      cy.expect_flash(flashClassMap.success, FLASH_ADDED);

      cy.selectAccordionItem([DATASTORE, DOMAIN_NAME, NAMESPACE_NAME, /Test Class 0/]);
      cy.tabs({ tabLabel: 'Properties' });
      cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_EDIT_CLASS);

      cy.getFormInputFieldByIdAndType({ inputId: FIELD_NAME }).type('Edit');
      cy.getFormInputFieldByIdAndType({ inputId: FIELD_DISPLAY_NAME }).clear().type('Edited Test Class');
      cy.getFormInputFieldByIdAndType({ inputId: FIELD_DESCRIPTION }).clear().type('Edited test class description');

      cy.getFormButtonByTypeWithText({ buttonText: 'Reset' }).click();

      cy.expect_flash(flashClassMap.warning, FLASH_RESET);
      cy.getFormInputFieldByIdAndType({ inputId: FIELD_NAME }).should('have.value', CLASS_NAME);
      cy.getFormInputFieldByIdAndType({ inputId: FIELD_DISPLAY_NAME }).should('have.value', CLASS_DISPLAY_NAME);
      cy.getFormInputFieldByIdAndType({ inputId: FIELD_DESCRIPTION }).should('have.value', CLASS_DESCRIPTION);

      cy.getFormButtonByTypeWithText({ buttonText: 'Cancel' }).click();

      cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_REMOVE_CLASS);
      cy.expect_flash(flashClassMap.success, FLASH_DELETED);
      cy.expect_flash(flashClassMap.info, 'empty');
    });

    it('Form validation works', () => {
      cy.selectAccordionItem([DATASTORE, DOMAIN_NAME, NAMESPACE_NAME]);

      // Invalid name (contains space) should show error and disable Add
      cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_ADD_CLASS);
      cy.getFormInputFieldByIdAndType({ inputId: FIELD_NAME }).type('Test Class');
      cy.getFormInputFieldByIdAndType({ inputId: FIELD_DISPLAY_NAME }).type(CLASS_DISPLAY_NAME);
      cy.getFormInputFieldByIdAndType({ inputId: FIELD_DESCRIPTION }).type(CLASS_DESCRIPTION);

      cy.expect_inline_field_errors({ containsText: 'Name may contain only alphanumeric and _ . - characters' });
      cy.getFormButtonByTypeWithText({ buttonText: 'Add', buttonType: 'submit' }).should('be.disabled');

      // Fix the name and submit
      cy.getFormInputFieldByIdAndType({ inputId: FIELD_NAME }).clear().type(CLASS_NAME);
      cy.getFormButtonByTypeWithText({ buttonText: 'Add', buttonType: 'submit' }).click();
      cy.expect_flash(flashClassMap.success, FLASH_ADDED);

      // Verify class properties
      cy.selectAccordionItem([DATASTORE, DOMAIN_NAME, NAMESPACE_NAME, /Test Class 0/]);
      cy.tabs({ tabLabel: 'Properties' });
      verifyClassProperties({
        fqn: `/TestDomain/TestNameSpace/${CLASS_NAME}`,
        name: CLASS_NAME,
        displayName: CLASS_DISPLAY_NAME,
        description: CLASS_DESCRIPTION,
      });

      // Duplicate name should show error
      cy.selectAccordionItem([DATASTORE, DOMAIN_NAME, NAMESPACE_NAME]);
      cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_ADD_CLASS);
      cy.getFormInputFieldByIdAndType({ inputId: FIELD_NAME }).type(CLASS_NAME);
      cy.getFormButtonByTypeWithText({ buttonText: 'Add', buttonType: 'submit' }).click();
      cy.expect_flash(flashClassMap.error, 'taken');

      // New unique name succeeds
      cy.getFormInputFieldByIdAndType({ inputId: FIELD_NAME }).clear().type('NewTestClass');
      cy.getFormInputFieldByIdAndType({ inputId: FIELD_DISPLAY_NAME }).type('Test Class 1');
      cy.getFormInputFieldByIdAndType({ inputId: FIELD_DESCRIPTION }).type(CLASS_DESCRIPTION);
      cy.getFormButtonByTypeWithText({ buttonText: 'Add', buttonType: 'submit' }).click();
      cy.expect_flash(flashClassMap.success, FLASH_ADDED);

      cy.selectAccordionItem([DATASTORE, DOMAIN_NAME, NAMESPACE_NAME, /Test Class 1/]);
      cy.tabs({ tabLabel: 'Properties' });
      verifyClassProperties({
        fqn: '/TestDomain/TestNameSpace/NewTestClass',
        name: 'NewTestClass',
        displayName: 'Test Class 1',
        description: CLASS_DESCRIPTION,
      });

      // Clean up both classes
      cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_REMOVE_CLASS);
      cy.expect_flash(flashClassMap.success, FLASH_DELETED);

      cy.selectAccordionItem([DATASTORE, DOMAIN_NAME, NAMESPACE_NAME, /Test Class 0/]);
      cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_REMOVE_CLASS);
      cy.expect_flash(flashClassMap.success, FLASH_DELETED);
      cy.expect_flash(flashClassMap.info, 'empty');
    });

    it('Creates and edits an automate class', () => {
      cy.selectAccordionItem([DATASTORE, DOMAIN_NAME, NAMESPACE_NAME]);
      cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_ADD_CLASS);
      fillAndSubmitClassForm({ name: CLASS_NAME, displayName: CLASS_DISPLAY_NAME, description: CLASS_DESCRIPTION });
      cy.expect_flash(flashClassMap.success, FLASH_ADDED);

      cy.selectAccordionItem([DATASTORE, DOMAIN_NAME, NAMESPACE_NAME, /Test Class 0/]);
      cy.tabs({ tabLabel: 'Properties' });
      verifyClassProperties({
        fqn: `/TestDomain/TestNameSpace/${CLASS_NAME}`,
        name: CLASS_NAME,
        displayName: CLASS_DISPLAY_NAME,
        description: CLASS_DESCRIPTION,
      });

      // Edit the class
      cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_EDIT_CLASS);
      cy.getFormInputFieldByIdAndType({ inputId: FIELD_NAME }).type('Edit');
      cy.getFormInputFieldByIdAndType({ inputId: FIELD_DISPLAY_NAME }).clear().type('Edited Test Class');
      cy.getFormInputFieldByIdAndType({ inputId: FIELD_DESCRIPTION }).clear().type('Edited test class description');
      cy.getFormButtonByTypeWithText({ buttonText: 'Save', buttonType: 'submit' }).click();

      cy.tabs({ tabLabel: 'Properties' });
      verifyClassProperties({
        fqn: '/TestDomain/TestNameSpace/TestClassEdit',
        name: 'TestClassEdit',
        displayName: 'Edited Test Class',
        description: 'Edited test class description',
      });

      cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_REMOVE_CLASS);
      cy.expect_flash(flashClassMap.success, FLASH_DELETED);
      cy.expect_flash(flashClassMap.info, 'empty');
    });
  });

  describe('Class Tabs', () => {
    beforeEach(() => {
      cy.selectAccordionItem([DATASTORE, DOMAIN_NAME, NAMESPACE_NAME]);
      cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_ADD_CLASS);
      fillAndSubmitClassForm({ name: CLASS_NAME, displayName: CLASS_DISPLAY_NAME, description: CLASS_DESCRIPTION });
      cy.expect_flash(flashClassMap.success, FLASH_ADDED);
      cy.selectAccordionItem([DATASTORE, DOMAIN_NAME, NAMESPACE_NAME, /Test Class 0/]);
    });

    it('displays AE class tabs and switches between them with correct content', () => {
      cy.get('#ae-class-tabs-wrapper').should('be.visible');
      cy.get('.miq_custom_tabs').should('be.visible');
      cy.expect_explorer_title('Automate Class "Test Class 0"');

      // Default tab is Instances
      cy.get('#instances').should('be.visible');

      cy.contains('button', 'Methods').should('be.visible').click();
      cy.get('#methods').should('be.visible');
      cy.contains('No methods found').should('be.visible');

      cy.contains('button', 'Properties').should('be.visible').click();
      cy.get('#props').should('be.visible');
      cy.get('.label_header').contains('Name');
      cy.get('.content_value').contains(CLASS_NAME);
      cy.get('.label_header').contains('Description');
      cy.get('.content_value').contains(CLASS_DESCRIPTION);

      cy.contains('button', 'Schema').should('be.visible').click();
      cy.get('#schema').should('be.visible');
      cy.contains('No schema found').should('be.visible');

      cy.contains('button', 'Instances').should('be.visible').click();
      cy.get('#instances').should('be.visible');
    });

    it('resets to default tab when navigating away and back to the class', () => {
      cy.contains('button', 'Properties').should('be.visible').click();
      cy.get('#props').should('be.visible');

      cy.selectAccordionItem([DATASTORE, DOMAIN_NAME, NAMESPACE_NAME]);
      cy.selectAccordionItem([DATASTORE, DOMAIN_NAME, NAMESPACE_NAME, /Test Class 0/]);

      cy.get('#ae-class-tabs-wrapper').should('be.visible');
      cy.get('.miq_custom_tabs').should('be.visible');
      cy.get('#instances').should('be.visible');
    });
  });

  describe('Copy Class', () => {
    beforeEach(() => {
      cy.selectAccordionItem([DATASTORE, DOMAIN_NAME, NAMESPACE_NAME]);
      cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_ADD_CLASS);
      cy.getFormInputFieldByIdAndType({ inputId: FIELD_NAME }).type(CLASS_NAME);
      cy.getFormButtonByTypeWithText({ buttonText: 'Add', buttonType: 'submit' }).click();
      cy.expect_flash(flashClassMap.success, FLASH_ADDED);
    });

    it('should copy class to same domain with a new name', () => {
      cy.selectAccordionItem([DATASTORE, DOMAIN_NAME, NAMESPACE_NAME, /TestClass/]);
      cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_COPY_CLASS);

      cy.get('form').should('contain', DOMAIN_NAME);
      cy.getFormInputFieldByIdAndType({ inputId: 'new_name' }).type('CopiedClass');
      cy.getFormButtonByTypeWithText({ buttonText: 'Copy', buttonType: 'submit' }).click();

      cy.expect_flash(flashClassMap.success, FLASH_SAVED);

      cy.selectAccordionItem([DATASTORE, DOMAIN_NAME, NAMESPACE_NAME]);
      cy.get('.miq-data-table table tbody').should('contain', 'CopiedClass').and('contain', CLASS_NAME);
      cy.selectAccordionItem([DATASTORE, DOMAIN_NAME, NAMESPACE_NAME, /CopiedClass/]);
    });

    it('should copy class to a different namespace', () => {
      cy.appFactories([
        ['create', 'miq_ae_domain', { name: 'TargetDomain' }],
      ]).then(([domain]) => {
        cy.appFactories([
          ['create', 'miq_ae_namespace', { name: 'TargetNameSpace', domain_id: domain.id }],
        ]);
      });

      cy.selectAccordionItem([DATASTORE, DOMAIN_NAME, NAMESPACE_NAME, /TestClass/]);
      cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_COPY_CLASS);

      cy.getFormSelectFieldById({ selectId: 'domain' }).select('TargetDomain');
      cy.getFormInputFieldByIdAndType({ inputId: 'override_source', inputType: 'checkbox' }).uncheck({ force: true });
      cy.selectNamespaceFromTree({ domainName: 'TargetDomain', namespaceName: 'TargetNameSpace' });
      cy.getFormButtonByTypeWithText({ buttonText: 'Copy', buttonType: 'submit' }).click();

      cy.expect_flash(flashClassMap.success, FLASH_SAVED);

      cy.selectAccordionItem([DATASTORE, 'TargetDomain', 'TargetNameSpace']);
      cy.get('.miq-data-table table tbody').should('contain', CLASS_NAME);
      cy.selectAccordionItem([DATASTORE, 'TargetDomain', 'TargetNameSpace', /TestClass/]);
    });

    it('should copy multiple classes to a different namespace in the same domain', () => {
      cy.appEval("MiqAeDomain.find_by(name: 'TestDomain').id").then((domainId) => {
        cy.appFactories([
          ['create', 'miq_ae_namespace', { name: 'TargetNameSpace', domain_id: domainId }],
        ]);
      });

      // Create TestClass2 via UI so the GTL table renders it immediately
      cy.selectAccordionItem([DATASTORE, DOMAIN_NAME, NAMESPACE_NAME]);
      cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_ADD_CLASS);
      cy.getFormInputFieldByIdAndType({ inputId: FIELD_NAME }).type('TestClass2');
      cy.getFormButtonByTypeWithText({ buttonText: 'Add', buttonType: 'submit' }).click();
      cy.expect_flash(flashClassMap.success, FLASH_ADDED);

      copyMultipleClassesAndVerify({
        targetDomain: DOMAIN_NAME,
        targetNamespace: 'TargetNameSpace',
        changeDomain: false,
      });
    });

    it('should copy multiple classes to a different domain', () => {
      cy.appFactories([
        ['create', 'miq_ae_domain', { name: 'TargetDomain2' }],
      ]).then(([domain]) => {
        cy.appFactories([
          ['create', 'miq_ae_namespace', { name: 'TargetNameSpace2', domain_id: domain.id }],
        ]);
      });

      // Create TestClass2 via UI so the GTL table renders it immediately
      cy.selectAccordionItem([DATASTORE, DOMAIN_NAME, NAMESPACE_NAME]);
      cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_ADD_CLASS);
      cy.getFormInputFieldByIdAndType({ inputId: FIELD_NAME }).type('TestClass2');
      cy.getFormButtonByTypeWithText({ buttonText: 'Add', buttonType: 'submit' }).click();
      cy.expect_flash(flashClassMap.success, FLASH_ADDED);

      copyMultipleClassesAndVerify({
        targetDomain: 'TargetDomain2',
        targetNamespace: 'TargetNameSpace2',
        changeDomain: true,
      });
    });

    it('should handle cancel on copy form', () => {
      cy.selectAccordionItem([DATASTORE, DOMAIN_NAME, NAMESPACE_NAME, /TestClass/]);
      cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_COPY_CLASS);

      cy.getFormButtonByTypeWithText({ buttonText: 'Cancel' }).click();

      cy.expect_flash(flashClassMap.warning, FLASH_CANCELLED);
    });
  });
});
