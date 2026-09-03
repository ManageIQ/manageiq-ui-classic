/* eslint-disable no-undef */
import { flashClassMap } from "../../../../../support/assertions/assertion_constants";

describe('Automation > Embedded Automate > Explorer > Schema Edit', () => {
  const navigateToSchemaTab = () => {
    cy.selectAccordionItem(['Datastore', 'SchemaTestDomain', 'SchemaTestNameSpace', 'SchemaTestClass']);
    cy.tabs({ tabLabel: 'Schema' });
  };

  const navigateToSchemaEdit = () => {
    navigateToSchemaTab();
    cy.toolbar('Configuration', 'Edit selected Schema');
    cy.expect_explorer_title('Editing Class Schema "SchemaTestClass"');
  };

  const selectAeTypeOrDataType = (dropdownId, optionText) => {
    cy.get(`#${dropdownId} button.cds--list-box__field`).click({ force: true });

    cy.get(`#${dropdownId} button.cds--list-box__field`)
      .should('have.attr', 'aria-expanded', 'true');

    cy.get('li.cds--list-box__menu-item')
      .contains(optionText)
      .should('be.visible')
      .click();
  };

  const getModalSaveButton = () =>
    cy.get('.cds--modal-container')
      .find('button[type="submit"]')
      .contains('Save');

  const clickModalSaveButton = () => {
    getModalSaveButton()
      .should('be.enabled')
      .click({ force: true });
  };

  const getModalCancelButton = () =>
    cy.get('.cds--modal-container')
      .find('button[type="button"]')
      .contains('Cancel');

  const getModalResetButton = () =>
    cy.get('.cds--modal-container')
      .find('button[type="button"]')
      .contains('Reset');

  // Gets a text input inside the modal by field id.
  const getModalInput = (inputId, inputType = 'text') =>
    cy.get(`.cds--modal-container form input[id="${inputId}"][type="${inputType}"]`);

  beforeEach(() => {
    // Create test data: Domain, Namespace, and Class
    cy.appFactories([
      ['create', 'miq_ae_domain', { name: 'SchemaTestDomain' }],
    ]).then(([domain]) => {
      cy.appFactories([
        ['create', 'miq_ae_namespace', { name: 'SchemaTestNameSpace', domain_id: domain.id }],
      ]).then(([namespace]) => {
        cy.appFactories([
          ['create', 'miq_ae_class', { name: 'SchemaTestClass', namespace_id: namespace.id }],
        ]);
      });
    });

    cy.login();
    cy.intercept('POST', '/ops/accordion_select?id=rbac_accord').as('accordion');
    cy.menu('Automation', 'Embedded Automate', 'Explorer');
    cy.expect_explorer_title('Datastore');

    navigateToSchemaEdit();
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  describe('Add New Schema Field', () => {
    it('should validate required fields and enable Save button only when form is valid', () => {
      cy.contains('button', 'Add a Field').click();

      // Only name filled — aetype still empty
      getModalInput('name').type('test_field');
      getModalSaveButton().should('be.disabled');

      selectAeTypeOrDataType('aetype', 'Attribute');
      getModalSaveButton().should('be.enabled');

      getModalInput('name').clear();
      getModalSaveButton().should('be.disabled');

      getModalInput('name').type('test_field');
      clickModalSaveButton();

      cy.get('.miq-data-table table tbody').should('contain', 'test_field');
    });

    it('should successfully add a new schema field with all fields populated', () => {
      cy.contains('button', 'Add a Field').click();

      getModalInput('name').type('test_field');
      selectAeTypeOrDataType('aetype', 'Method');
      selectAeTypeOrDataType('datatype', 'String');
      getModalInput('default_value').type('default_val');
      getModalInput('display_name').type('Complete Field');
      getModalInput('description').type('Test field description');
      getModalInput('substitute', 'checkbox').check({ force: true });
      getModalInput('collect').type('collect_value');
      getModalInput('message').clear().type('custom_message');
      getModalInput('on_entry').type('on_entry_method');
      getModalInput('on_exit').type('on_exit_method');
      getModalInput('on_error').type('on_error_method');
      getModalInput('max_retries').type('3');
      getModalInput('max_time').type('60');

      clickModalSaveButton();

      cy.get('.miq-data-table table tbody').should('contain', 'Complete Field (test_field)');
    });

    it('should cancel adding new field and close modal', () => {
      cy.contains('button', 'Add a Field').click();

      getModalInput('name').type('test_field');

      getModalCancelButton().click();

      cy.get('.miq-data-table table tbody').should('not.contain', 'test_field');
    });

    it('should reset form when clicking Reset button in add modal', () => {
      cy.contains('button', 'Add a Field').click();

      getModalInput('name').type('reset_test');
      selectAeTypeOrDataType('aetype', 'Method');
      getModalInput('display_name').type('Reset Test');

      getModalResetButton().click();

      getModalInput('name').should('have.value', '');
      getModalInput('display_name').should('have.value', '');
    });
  });

  describe('Edit Schema Field', () => {
    beforeEach(() => {
      // Add a field to edit
      cy.contains('button', 'Add a Field').click();
      getModalInput('name').type('editable_field');
      selectAeTypeOrDataType('aetype', 'Attribute');
      getModalInput('display_name').type('Editable Field');
      getModalInput('description').type('Original description');
      clickModalSaveButton();
    });

    it('should successfully update an existing field', () => {
      cy.get('.miq-data-table table tbody').contains('Editable Field').parents('tr').within(() => {
        cy.contains('button', 'Update').click();
      });

      getModalInput('display_name')
        .should('have.value', 'Editable Field')
        .clear()
        .type('Updated Field');
      getModalInput('description')
        .should('have.value', 'Original description')
        .clear()
        .type('Updated description');
      getModalInput('default_value').type('new_default');

      clickModalSaveButton();

      cy.get('.miq-data-table table tbody').should('contain', 'Updated Field');
      cy.get('.miq-data-table table tbody').should('not.contain', 'Editable Field (editable_field)');
    });

    it('should cancel editing and preserve original values', () => {
      cy.get('.miq-data-table table tbody').contains('Editable Field').parents('tr').within(() => {
        cy.contains('button', 'Update').click();
      });

      getModalInput('display_name').clear().type('Should Not Save');

      getModalCancelButton().click();

      cy.get('.miq-data-table table tbody').should('contain', 'Editable Field');
      cy.get('.miq-data-table table tbody').should('not.contain', 'Should Not Save');
    });

    it('should reset form to original values when clicking Reset in edit modal', () => {
      cy.get('.miq-data-table table tbody').contains('Editable Field').parents('tr').within(() => {
        cy.contains('button', 'Update').click();
      });

      getModalInput('display_name').clear().type('Modified');
      getModalInput('description').clear().type('Modified desc');

      getModalResetButton().click();

      getModalInput('display_name').should('have.value', 'Editable Field');
      getModalInput('description').should('have.value', 'Original description');
    });

    it('should successfully edit a previously saved schema field', () => {
      cy.getFormButtonByTypeWithText({ buttonText: 'Save', buttonType: 'submit' }).click();
      cy.expect_flash(flashClassMap.success, 'saved');

      // Verify redirected back to class view
      cy.expect_explorer_title('Automate Class "SchemaTestClass"');

      navigateToSchemaEdit();

      cy.get('.miq-data-table table tbody').contains('Editable Field').should('exist');

      cy.get('.miq-data-table table tbody').contains('Editable Field').parents('tr').within(() => {
        cy.contains('button', 'Update').click();
      });

      // Edit all available fields
      getModalInput('name').clear().type('updated_field_name');
      selectAeTypeOrDataType('aetype', 'Method');
      selectAeTypeOrDataType('datatype', 'String');
      getModalInput('default_value').clear().type('updated_default_value');
      getModalInput('display_name').clear().type('Updated Field Display');
      getModalInput('description').clear().type('Updated field description');
      getModalInput('substitute', 'checkbox').uncheck({ force: true });
      getModalInput('collect').clear().type('updated_collect_value');
      getModalInput('message').clear().type('updated_message');
      getModalInput('on_entry').clear().type('updated_on_entry');
      getModalInput('on_exit').clear().type('updated_on_exit');
      getModalInput('on_error').clear().type('updated_on_error');
      getModalInput('max_retries').clear().type('5');
      getModalInput('max_time').clear().type('120');

      clickModalSaveButton();

      cy.get('.miq-data-table table tbody').contains('Updated Field Display').should('exist');
      cy.get('.miq-data-table table tbody').contains('Updated Field Display').parents('tr').within(() => {
        cy.contains('Editable Field').should('not.exist');
      });

      cy.getFormButtonByTypeWithText({ buttonText: 'Save', buttonType: 'submit' }).click();
      cy.expect_flash(flashClassMap.success, 'saved');

      navigateToSchemaEdit();

      cy.get('.miq-data-table table tbody').contains('Updated Field Display').should('exist');

      // Open edit modal to verify all fields were saved correctly
      cy.get('.miq-data-table table tbody').contains('Updated Field Display').parents('tr').within(() => {
        cy.contains('button', 'Update').click();
      });

      // Verify all field values
      getModalInput('name').should('have.value', 'updated_field_name');
      getModalInput('display_name').should('have.value', 'Updated Field Display');
      getModalInput('description').should('have.value', 'Updated field description');
      getModalInput('substitute', 'checkbox').should('not.be.checked');
      getModalInput('collect').should('have.value', 'updated_collect_value');
      getModalInput('message').should('have.value', 'updated_message');
      getModalInput('on_entry').should('have.value', 'updated_on_entry');
      getModalInput('on_exit').should('have.value', 'updated_on_exit');
      getModalInput('on_error').should('have.value', 'updated_on_error');
      getModalInput('max_retries').should('have.value', '5');
      getModalInput('max_time').should('have.value', '120');

      getModalCancelButton().click();
    });
  });

  describe('Delete Schema Field', () => {
    beforeEach(() => {
      cy.contains('button', 'Add a Field').click();
      getModalInput('name').type('deletable_field');
      selectAeTypeOrDataType('aetype', 'Attribute');
      getModalInput('display_name').type('Deletable Field');
      clickModalSaveButton();
    });

    it('should delete newly added field before saving schema', () => {
      cy.contains('button', 'Add a Field').click();
      getModalInput('name').type('temp_field');
      selectAeTypeOrDataType('aetype', 'Method');
      clickModalSaveButton();

      cy.get('.miq-data-table table tbody').should('contain', 'Deletable Field');
      cy.get('.miq-data-table table tbody').should('contain', 'temp_field');

      cy.get('.miq-data-table table tbody').contains('temp_field').parents('tr').within(() => {
        cy.contains('button', 'Delete').click();
      });

      cy.get('.miq-data-table table tbody').should('contain', 'Deletable Field');
      cy.get('.miq-data-table table tbody').should('not.contain', 'temp_field');
    });

    it('should delete a previously saved schema field', () => {
      cy.getFormButtonByTypeWithText({ buttonText: 'Save', buttonType: 'submit' }).click();
      cy.expect_flash(flashClassMap.success, 'saved');

      navigateToSchemaEdit();

      cy.get('.miq-data-table table tbody').contains('Deletable Field').should('exist');

      cy.get('.miq-data-table table tbody').contains('Deletable Field').parents('tr').within(() => {
        cy.contains('button', 'Delete').click();
      });

      cy.get('.miq-data-table table tbody').contains('Deletable Field').should('not.exist');

      cy.getFormButtonByTypeWithText({ buttonText: 'Save', buttonType: 'submit' }).click();
      cy.expect_flash(flashClassMap.success, 'saved');

      navigateToSchemaEdit();
      cy.get('.miq-data-table table tbody').contains('Deletable Field').should('not.exist');
    });
  });

  describe('Schema Form Actions', () => {
    beforeEach(() => {
      // Add a test field
      cy.contains('button', 'Add a Field').click();
      getModalInput('name').type('test_field');
      selectAeTypeOrDataType('aetype', 'Attribute');
      clickModalSaveButton();
    });

    it('should reset schema to original state', () => {
      // Add another field
      cy.contains('button', 'Add a Field').click();
      getModalInput('name').type('field_to_reset');
      selectAeTypeOrDataType('aetype', 'Method');
      clickModalSaveButton();

      // Wait for the modal to fully close before interacting with the form-level Reset button.
      cy.get('.cds--modal').should('not.have.class', 'is-visible');

      cy.get('.miq-data-table table tbody').should('contain', 'test_field');
      cy.get('.miq-data-table table tbody').should('contain', 'field_to_reset');

      cy.getFormButtonByTypeWithText({ buttonText: 'Reset' }).click();

      cy.expect_flash(flashClassMap.warning, 'reset');

      cy.expect_explorer_title('Editing Class Schema "SchemaTestClass"');
    });

    it('should cancel schema editing', () => {
      cy.contains('button', 'Add a Field').click();
      getModalInput('name').type('cancelled_field');
      selectAeTypeOrDataType('aetype', 'State');
      clickModalSaveButton();

      // Wait for the modal to fully close before clicking the form-level Cancel button.
      cy.get('.cds--modal').should('not.have.class', 'is-visible');
      cy.getFormButtonByTypeWithText({ buttonText: 'Cancel' }).click();

      cy.expect_flash(flashClassMap.success, 'cancelled');

      // Verify redirected back to class view
      cy.expect_explorer_title('Automate Class "SchemaTestClass"');
    });
  });
});
