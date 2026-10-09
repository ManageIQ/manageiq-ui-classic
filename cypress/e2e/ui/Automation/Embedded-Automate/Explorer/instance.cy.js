import { flashClassMap } from '../../../../../support/assertions/assertion_constants';

// Accordion / tree
const DATASTORE = 'Datastore';
const DOMAIN_NAME = 'TestDomain';
const NAMESPACE_NAME = 'TestNamespace';
const CLASS_NAME = 'TestClass';

// Toolbar
const TOOLBAR_CONFIGURATION = 'Configuration';
const TOOLBAR_ADD_INSTANCE = 'Add a New Instance';
const TOOLBAR_EDIT_INSTANCE = 'Edit this Instance';
const TOOLBAR_COPY_INSTANCE = 'Copy this Instance';
const TOOLBAR_COPY_SELECTED = 'Copy selected Instances';

// Form field IDs
const FIELD_NAME = 'name';
const FIELD_DISPLAY_NAME = 'display_name';
const FIELD_DESCRIPTION = 'description';

// Flash text snippets
const FLASH_ADDED = 'added';
const FLASH_SAVED = 'saved';
const FLASH_CANCELLED = 'cancelled';
const FLASH_RESET = 'reset';

// Source instance data
const SOURCE_INSTANCE_NAME = 'source_instance';
const SOURCE_INSTANCE_DISPLAY = 'Source Instance';
const SOURCE_INSTANCE_DESC = 'Instance to copy';

/**
 * Navigates to the class Instances tab and opens the Add Instance form.
 */
function openAddInstanceForm() {
  cy.selectAccordionItem([DATASTORE, DOMAIN_NAME, NAMESPACE_NAME, CLASS_NAME]);
  cy.tabs({ tabLabel: 'Instances' });
  cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_ADD_INSTANCE);
}

/**
 * Selects two rows in the instances table and opens the copy-selected form.
 */
function selectBothInstancesAndOpenCopyForm() {
  cy.selectAccordionItem([DATASTORE, DOMAIN_NAME, NAMESPACE_NAME, CLASS_NAME]);
  cy.tabs({ tabLabel: 'Instances' });
  cy.get('#instances .miq-data-table table tbody tr').should('have.length.at.least', 2).then((rows) => {
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
 * Copies multiple instances to a target domain/namespace and verifies the result.
 * @param {Object} opts
 * @param {string} opts.targetDomain    - Domain to copy into
 * @param {string} opts.targetNamespace - Namespace to copy into
 * @param {boolean} [opts.changeDomain] - Whether to select a different domain in the form (default false)
 */
function copyMultipleInstancesAndVerify({ targetDomain, targetNamespace, changeDomain = false }) {
  selectBothInstancesAndOpenCopyForm();

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
  cy.tabs({ tabLabel: 'Instances' });
  cy.get('#instances .miq-data-table table tbody')
    .should('contain', SOURCE_INSTANCE_DISPLAY)
    .and('contain', 'Source Instance 2');
}

describe('Automation > Embedded Automate > Explorer > Instance', () => {
  beforeEach(() => {
    cy.appFactories([
      ['create', 'miq_ae_domain', { name: DOMAIN_NAME }],
    ]).then(([domain]) => {
      cy.appFactories([
        ['create', 'miq_ae_namespace', { name: NAMESPACE_NAME, domain_id: domain.id }],
      ]).then(([ns]) => {
        cy.appFactories([
          ['create', 'miq_ae_class', { name: CLASS_NAME, namespace_id: ns.id }],
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
    it('should reject an invalid name and keep the Add button disabled', () => {
      openAddInstanceForm();

      cy.getFormInputFieldByIdAndType({ inputId: FIELD_NAME }).type('invalid name');
      cy.getFormButtonByTypeWithText({ buttonText: 'Add', buttonType: 'submit' }).click();

      cy.expect_inline_field_errors({ containsText: 'Name may contain only alphanumeric and _ . - characters' });
      cy.getFormButtonByTypeWithText({ buttonText: 'Add', buttonType: 'submit' }).should('be.disabled');

      cy.getFormInputFieldByIdAndType({ inputId: FIELD_NAME }).clear().type('valid_name');
      cy.getFormButtonByTypeWithText({ buttonText: 'Add', buttonType: 'submit' }).should('not.be.disabled');
    });

    it('should create a new instance successfully', () => {
      openAddInstanceForm();

      cy.getFormInputFieldByIdAndType({ inputId: FIELD_NAME }).type('test_instance');
      cy.getFormInputFieldByIdAndType({ inputId: FIELD_DISPLAY_NAME }).type('Test Instance');
      cy.getFormInputFieldByIdAndType({ inputId: FIELD_DESCRIPTION }).type('Test instance description');
      cy.getFormButtonByTypeWithText({ buttonText: 'Add', buttonType: 'submit' }).click();

      cy.expect_flash(flashClassMap.success, FLASH_ADDED);

      cy.selectAccordionItem([DATASTORE, DOMAIN_NAME, NAMESPACE_NAME, CLASS_NAME]);
      cy.tabs({ tabLabel: 'Instances' });
      cy.get('.miq-data-table table tbody').should('contain', 'Test Instance');
      cy.selectAccordionItem([DATASTORE, DOMAIN_NAME, NAMESPACE_NAME, CLASS_NAME, /Test Instance/]);
      cy.get('#main-content').should('contain', 'Test Instance');

      // Navigate to the edit form to verify display name and description were persisted
      cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_EDIT_INSTANCE);
      cy.getFormInputFieldByIdAndType({ inputId: FIELD_DISPLAY_NAME }).should('have.value', 'Test Instance');
      cy.getFormInputFieldByIdAndType({ inputId: FIELD_DESCRIPTION }).should('have.value', 'Test instance description');
    });

    it('should handle cancel button', () => {
      openAddInstanceForm();

      cy.getFormInputFieldByIdAndType({ inputId: FIELD_NAME }).type('test_instance');
      cy.getFormButtonByTypeWithText({ buttonText: 'Cancel' }).click();

      cy.expect_explorer_title('Automate Class "TestClass"');
      cy.expect_flash(flashClassMap.warning, FLASH_CANCELLED);
    });
  });

  describe('Edit Instance', () => {
    beforeEach(() => {
      openAddInstanceForm();
      cy.getFormInputFieldByIdAndType({ inputId: FIELD_NAME }).type('edit_test_instance');
      cy.getFormInputFieldByIdAndType({ inputId: FIELD_DISPLAY_NAME }).type('Edit Test Instance');
      cy.getFormInputFieldByIdAndType({ inputId: FIELD_DESCRIPTION }).type('Original description');
      cy.getFormButtonByTypeWithText({ buttonText: 'Add', buttonType: 'submit' }).click();
      cy.expect_flash(flashClassMap.success, FLASH_ADDED);
    });

    it('should edit an existing instance successfully', () => {
      cy.selectAccordionItem([DATASTORE, DOMAIN_NAME, NAMESPACE_NAME, CLASS_NAME, /Edit Test Instance/]);
      cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_EDIT_INSTANCE);

      cy.getFormInputFieldByIdAndType({ inputId: FIELD_NAME }).clear().type('edited_instance');
      cy.getFormInputFieldByIdAndType({ inputId: FIELD_DISPLAY_NAME }).clear().type('Edited Instance');
      cy.getFormInputFieldByIdAndType({ inputId: FIELD_DESCRIPTION }).clear().type('Updated description');
      cy.getFormButtonByTypeWithText({ buttonText: 'Save', buttonType: 'submit' }).click();

      cy.expect_flash(flashClassMap.success, FLASH_SAVED);

      cy.selectAccordionItem([DATASTORE, DOMAIN_NAME, NAMESPACE_NAME, CLASS_NAME]);
      cy.tabs({ tabLabel: 'Instances' });
      cy.get('.miq-data-table table tbody').should('contain', 'Edited Instance').and('not.contain', 'Edit Test Instance');
      cy.selectAccordionItem([DATASTORE, DOMAIN_NAME, NAMESPACE_NAME, CLASS_NAME, /Edited Instance/]);
      cy.get('#main-content').should('contain', 'Edited Instance');

      // Navigate to the edit form to verify updated display name and description were persisted
      cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_EDIT_INSTANCE);
      cy.getFormInputFieldByIdAndType({ inputId: FIELD_DISPLAY_NAME }).should('have.value', 'Edited Instance');
      cy.getFormInputFieldByIdAndType({ inputId: FIELD_DESCRIPTION }).should('have.value', 'Updated description');
    });

    it('should disable save button when no changes are made', () => {
      cy.selectAccordionItem([DATASTORE, DOMAIN_NAME, NAMESPACE_NAME, CLASS_NAME, /Edit Test Instance/]);
      cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_EDIT_INSTANCE);

      cy.getFormButtonByTypeWithText({ buttonText: 'Save', buttonType: 'submit' }).should('be.disabled');

      cy.getFormInputFieldByIdAndType({ inputId: FIELD_NAME }).clear().type('modified_name');
      cy.getFormButtonByTypeWithText({ buttonText: 'Save', buttonType: 'submit' }).should('not.be.disabled');

      cy.getFormButtonByTypeWithText({ buttonText: 'Reset' }).click();
      cy.getFormButtonByTypeWithText({ buttonText: 'Save', buttonType: 'submit' }).should('be.disabled');
    });

    it('should handle reset button on edit form', () => {
      cy.selectAccordionItem([DATASTORE, DOMAIN_NAME, NAMESPACE_NAME, CLASS_NAME, /Edit Test Instance/]);
      cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_EDIT_INSTANCE);

      cy.getFormInputFieldByIdAndType({ inputId: FIELD_NAME }).clear().type('modified_name');
      cy.getFormInputFieldByIdAndType({ inputId: FIELD_DISPLAY_NAME }).clear().type('Modified Display');
      cy.getFormButtonByTypeWithText({ buttonText: 'Reset' }).click();

      cy.expect_flash(flashClassMap.warning, FLASH_RESET);

      cy.getFormInputFieldByIdAndType({ inputId: FIELD_NAME }).should('have.value', 'edit_test_instance');
      cy.getFormInputFieldByIdAndType({ inputId: FIELD_DISPLAY_NAME }).should('have.value', 'Edit Test Instance');
      cy.getFormInputFieldByIdAndType({ inputId: FIELD_DESCRIPTION }).should('have.value', 'Original description');

      cy.get('h3').contains('Main Info').should('be.visible');
    });
  });

  describe('Instance Fields', () => {
    it('should edit a field value from the fields table and save', () => {
      cy.appEval(`
        cls = MiqAeClass.find_by(name: 'TestClass')
        cls.ae_fields.create!(name: 'test_field', aetype: 'attribute', datatype: 'string', priority: 1)
        MiqAeInstance.create!(name: 'field_edit_instance', class_id: cls.id)
        nil
      `);

      cy.selectAccordionItem([DATASTORE, DOMAIN_NAME, NAMESPACE_NAME, CLASS_NAME, /field_edit_instance/]);
      cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_EDIT_INSTANCE);

      cy.get('h3').contains('Fields').should('be.visible');
      cy.get('.ae-instance-fields-table').should('be.visible');

      cy.get('.ae-instance-fields-table').contains('button', 'Edit').first().click();

      cy.get('.cds--modal.is-visible').should('be.visible');
      cy.get('.cds--modal.is-visible').contains('test_field').should('be.visible');

      cy.get('.cds--modal.is-visible form input[id="value"]').clear().type('my_test_value');
      cy.get('.cds--modal.is-visible').contains('button', 'Update').click();

      cy.get('.cds--modal.is-visible').should('not.exist');
      cy.get('.ae-instance-fields-table').contains('my_test_value').should('be.visible');

      cy.getFormButtonByTypeWithText({ buttonText: 'Save', buttonType: 'submit' }).click();
      cy.expect_flash(flashClassMap.success, FLASH_SAVED);

      cy.selectAccordionItem([DATASTORE, DOMAIN_NAME, NAMESPACE_NAME, CLASS_NAME, /field_edit_instance/]);
      cy.get('#instance_fields_div').should('contain', 'my_test_value');
    });
  });

  describe('Copy Instance', () => {
    beforeEach(() => {
      openAddInstanceForm();
      cy.getFormInputFieldByIdAndType({ inputId: FIELD_NAME }).type(SOURCE_INSTANCE_NAME);
      cy.getFormInputFieldByIdAndType({ inputId: FIELD_DISPLAY_NAME }).type(SOURCE_INSTANCE_DISPLAY);
      cy.getFormInputFieldByIdAndType({ inputId: FIELD_DESCRIPTION }).type(SOURCE_INSTANCE_DESC);
      cy.getFormButtonByTypeWithText({ buttonText: 'Add', buttonType: 'submit' }).click();
      cy.expect_flash(flashClassMap.success, FLASH_ADDED);
    });

    it('should copy instance to same class', () => {
      cy.selectAccordionItem([DATASTORE, DOMAIN_NAME, NAMESPACE_NAME, CLASS_NAME, /Source Instance/]);
      cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_COPY_INSTANCE);

      cy.get('form').should('contain', SOURCE_INSTANCE_DISPLAY);
      cy.getFormInputFieldByIdAndType({ inputId: 'new_name' }).type('copied_instance');
      cy.getFormButtonByTypeWithText({ buttonText: 'Copy', buttonType: 'submit' }).click();

      cy.expect_flash(flashClassMap.success, FLASH_SAVED);

      cy.tabs({ tabLabel: 'Instances' });
      cy.get('#instances .miq-data-table table tbody tr').should('have.length', 2);
      cy.selectAccordionItem([DATASTORE, DOMAIN_NAME, NAMESPACE_NAME, CLASS_NAME, /copied_instance/]);

      // Verify the copy preserved display name and description from the source instance
      cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_EDIT_INSTANCE);
      cy.getFormInputFieldByIdAndType({ inputId: FIELD_DISPLAY_NAME }).should('have.value', SOURCE_INSTANCE_DISPLAY);
      cy.getFormInputFieldByIdAndType({ inputId: FIELD_DESCRIPTION }).should('have.value', SOURCE_INSTANCE_DESC);
    });

    it('should copy instance to a different namespace', () => {
      cy.appFactories([
        ['create', 'miq_ae_domain', { name: 'TargetDomain' }],
      ]).then(([domain]) => {
        cy.appFactories([
          ['create', 'miq_ae_namespace', { name: 'TargetNamespace', domain_id: domain.id }],
        ]);
      });

      cy.selectAccordionItem([DATASTORE, DOMAIN_NAME, NAMESPACE_NAME, CLASS_NAME, /Source Instance/]);
      cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_COPY_INSTANCE);

      cy.getFormSelectFieldById({ selectId: 'domain' }).select('TargetDomain');
      cy.getFormInputFieldByIdAndType({ inputId: 'override_source', inputType: 'checkbox' }).uncheck({ force: true });
      cy.selectNamespaceFromTree({ domainName: 'TargetDomain', namespaceName: 'TargetNamespace' });
      cy.getFormButtonByTypeWithText({ buttonText: 'Copy', buttonType: 'submit' }).click();

      cy.expect_flash(flashClassMap.success, FLASH_SAVED);

      cy.selectAccordionItem([DATASTORE, 'TargetDomain', 'TargetNamespace', CLASS_NAME]);
      cy.tabs({ tabLabel: 'Instances' });
      cy.get('#instances .miq-data-table table tbody').should('contain', SOURCE_INSTANCE_DISPLAY);
      cy.selectAccordionItem([DATASTORE, 'TargetDomain', 'TargetNamespace', CLASS_NAME, /Source Instance/]);

      // Verify the copy preserved display name and description from the source instance
      cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_EDIT_INSTANCE);
      cy.getFormInputFieldByIdAndType({ inputId: FIELD_DISPLAY_NAME }).should('have.value', SOURCE_INSTANCE_DISPLAY);
      cy.getFormInputFieldByIdAndType({ inputId: FIELD_DESCRIPTION }).should('have.value', SOURCE_INSTANCE_DESC);
    });

    it('should copy instance with override existing option', () => {
      // Create the target instance via factory so setup stays out of the UI
      cy.appEval(`
        cls = MiqAeClass.find_by(name: 'TestClass')
        MiqAeInstance.create!(name: 'target_instance', display_name: 'Target Instance', class_id: cls.id)
        nil
      `);

      cy.selectAccordionItem([DATASTORE, DOMAIN_NAME, NAMESPACE_NAME, CLASS_NAME, /Source Instance/]);
      cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_COPY_INSTANCE);

      cy.getFormInputFieldByIdAndType({ inputId: 'new_name' }).type('target_instance');
      cy.getFormInputFieldByIdAndType({ inputId: 'override_existing', inputType: 'checkbox' }).check({ force: true });
      cy.getFormButtonByTypeWithText({ buttonText: 'Copy', buttonType: 'submit' }).click();

      cy.expect_flash(flashClassMap.success, FLASH_SAVED);

      cy.tabs({ tabLabel: 'Instances' });
      cy.get('#instances .miq-data-table table tbody tr').should('have.length', 2);
      cy.selectAccordionItem([DATASTORE, DOMAIN_NAME, NAMESPACE_NAME, CLASS_NAME, /target_instance/]);
    });

    it('should copy multiple instances to a different namespace in the same domain', () => {
      cy.appEval("MiqAeDomain.find_by(name: 'TestDomain').id").then((domainId) => {
        cy.appFactories([
          ['create', 'miq_ae_namespace', { name: 'TargetNamespace', domain_id: domainId }],
        ]);
      });

      // Create source_instance_2 via UI so the GTL table renders it immediately
      openAddInstanceForm();
      cy.getFormInputFieldByIdAndType({ inputId: FIELD_NAME }).type('source_instance_2');
      cy.getFormInputFieldByIdAndType({ inputId: FIELD_DISPLAY_NAME }).type('Source Instance 2');
      cy.getFormButtonByTypeWithText({ buttonText: 'Add', buttonType: 'submit' }).click();
      cy.expect_flash(flashClassMap.success, FLASH_ADDED);

      copyMultipleInstancesAndVerify({
        targetDomain: DOMAIN_NAME,
        targetNamespace: 'TargetNamespace',
        changeDomain: false,
      });
    });

    it('should copy multiple instances to a different domain', () => {
      cy.appFactories([
        ['create', 'miq_ae_domain', { name: 'TargetDomain2' }],
      ]).then(([domain]) => {
        cy.appFactories([
          ['create', 'miq_ae_namespace', { name: 'TargetNamespace2', domain_id: domain.id }],
        ]);
      });

      // Create source_instance_2 via UI so the GTL table renders it immediately
      openAddInstanceForm();
      cy.getFormInputFieldByIdAndType({ inputId: FIELD_NAME }).type('source_instance_2');
      cy.getFormInputFieldByIdAndType({ inputId: FIELD_DISPLAY_NAME }).type('Source Instance 2');
      cy.getFormButtonByTypeWithText({ buttonText: 'Add', buttonType: 'submit' }).click();
      cy.expect_flash(flashClassMap.success, FLASH_ADDED);

      copyMultipleInstancesAndVerify({
        targetDomain: 'TargetDomain2',
        targetNamespace: 'TargetNamespace2',
        changeDomain: true,
      });
    });

    it('should handle cancel on copy form', () => {
      cy.selectAccordionItem([DATASTORE, DOMAIN_NAME, NAMESPACE_NAME, CLASS_NAME, /Source Instance/]);
      cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_COPY_INSTANCE);

      cy.getFormButtonByTypeWithText({ buttonText: 'Cancel' }).click();

      cy.expect_flash(flashClassMap.warning, FLASH_CANCELLED);
    });
  });
});
