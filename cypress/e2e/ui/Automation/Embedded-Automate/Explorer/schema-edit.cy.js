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

  const getModalSaveButton = () => {
    return cy.get('.cds--modal-container')
      .find('button[type="submit"]')
      .contains('Save');
  };

  const clickModalSaveButton = () => {
    cy.wait(500); // Wait for form validation
    getModalSaveButton()
      .should('be.enabled')
      .click({ force: true });
  };

  const getModalCancelButton = () => {
    return cy.get('.cds--modal-container')
      .find('button[type="button"]')
      .contains('Cancel');
  };

  const getModalResetButton = () => {
    return cy.get('.cds--modal-container')
      .find('button[type="button"]')
      .contains('Reset');
  };

  beforeEach(() => {
    // Create test data: Domain, Namespace, and Class
    cy.appFactories([
      ['create', 'miq_ae_domain', { name: 'SchemaTestDomain' }],
    ]).then((results) => {
      cy.appFactories([
        ['create', 'miq_ae_namespace', { name: 'SchemaTestNameSpace', domain_id: results[0].id }]
      ]).then((namespaceResults) => {
        cy.appFactories([
          ['create', 'miq_ae_class', { name: 'SchemaTestClass', namespace_id: namespaceResults[0].id }]
        ]);
      });
    });

    cy.login();
    cy.intercept('POST', '/ops/accordion_select?id=rbac_accord').as('accordion');
    cy.menu('Automation', 'Embedded Automate', 'Explorer');
    cy.expect_explorer_title('Datastore');

    // Navigate to the Schema tab and edit
    navigateToSchemaEdit();
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  describe('Add New Schema Field', () => {
    it('should validate required fields and enable Save button only when form is valid', () => {
      cy.get('button').contains('Add a Field').click();
      
      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type('test_field');
      getModalSaveButton().should('be.disabled');

      cy.getFormSelectFieldById({ selectId: 'aetype' }).select('attribute');
      getModalSaveButton().should('be.enabled');

      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).clear();
      getModalSaveButton().should('be.disabled');

      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type('test_field');
      clickModalSaveButton();
            
      cy.get('.miq-data-table table tbody').should('contain', 'test_field');
    });

    it('should successfully add a new schema field with all fields populated', () => {
      cy.get('button').contains('Add a Field').click();
      
      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type('test_field');
      cy.getFormSelectFieldById({ selectId: 'aetype' }).select('method');
      cy.getFormSelectFieldById({ selectId: 'datatype' }).select('string');
      cy.getFormInputFieldByIdAndType({ inputId: 'default_value' }).type('default_val');
      cy.getFormInputFieldByIdAndType({ inputId: 'display_name' }).type('Complete Field');
      cy.getFormInputFieldByIdAndType({ inputId: 'description' }).type('Test field description');
      cy.getFormInputFieldByIdAndType({ inputId: 'substitute', inputType: 'checkbox' }).check({ force: true });
      cy.getFormInputFieldByIdAndType({ inputId: 'collect' }).type('collect_value');
      cy.getFormInputFieldByIdAndType({ inputId: 'message' }).clear().type('custom_message');
      cy.getFormInputFieldByIdAndType({ inputId: 'on_entry' }).type('on_entry_method');
      cy.getFormInputFieldByIdAndType({ inputId: 'on_exit' }).type('on_exit_method');
      cy.getFormInputFieldByIdAndType({ inputId: 'on_error' }).type('on_error_method');
      cy.getFormInputFieldByIdAndType({ inputId: 'max_retries' }).type('3');
      cy.getFormInputFieldByIdAndType({ inputId: 'max_time' }).type('60');
      
      clickModalSaveButton();
      
      cy.get('.miq-data-table table tbody').should('contain', 'Complete Field (test_field)');
    });

    it('should cancel adding new field and close modal', () => {
      cy.get('button').contains('Add a Field').click();
      
      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type('test_field');
      
      getModalCancelButton().click();
            
      cy.get('.miq-data-table table tbody').should('not.contain', 'test_field');
    });

    it('should reset form when clicking Reset button in add modal', () => {
      cy.get('button').contains('Add a Field').click();
      
      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type('reset_test');
      cy.getFormSelectFieldById({ selectId: 'aetype' }).select('method');
      cy.getFormInputFieldByIdAndType({ inputId: 'display_name' }).type('Reset Test');
      
      getModalResetButton().click();
      
      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).should('have.value', '');
      cy.getFormInputFieldByIdAndType({ inputId: 'display_name' }).should('have.value', '');
    });
  });

  describe('Edit Schema Field', () => {
    beforeEach(() => {
      // Add a field to edit
      cy.get('button').contains('Add a Field').click();
      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type('editable_field');
      cy.getFormSelectFieldById({ selectId: 'aetype' }).select('attribute');
      cy.getFormInputFieldByIdAndType({ inputId: 'display_name' }).type('Editable Field');
      cy.getFormInputFieldByIdAndType({ inputId: 'description' }).type('Original description');
      clickModalSaveButton();
    });

    it('should open edit modal with pre-populated values', () => {
      cy.get('.miq-data-table table tbody').contains('Editable Field').parents('tr').within(() => {
        cy.contains('button', 'Update').click();
      });
      
      cy.get('.cds--modal-container').should('be.visible');
      cy.get('.cds--modal-header').should('contain', 'Edit Field');
      
      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).should('have.value', 'editable_field');
      cy.getFormInputFieldByIdAndType({ inputId: 'display_name' }).should('have.value', 'Editable Field');
      cy.getFormInputFieldByIdAndType({ inputId: 'description' }).should('have.value', 'Original description');
    });

    it('should successfully update an existing field', () => {
      cy.get('.miq-data-table table tbody').contains('Editable Field').parents('tr').within(() => {
        cy.contains('button', 'Update').click();
      });
      
      cy.getFormInputFieldByIdAndType({ inputId: 'display_name' }).clear().type('Updated Field');
      cy.getFormInputFieldByIdAndType({ inputId: 'description' }).clear().type('Updated description');
      cy.getFormInputFieldByIdAndType({ inputId: 'default_value' }).type('new_default');
      
      clickModalSaveButton();
      
      cy.get('.miq-data-table table tbody').should('contain', 'Updated Field');
      cy.get('.miq-data-table table tbody').should('not.contain', 'Editable Field');
    });

    it('should cancel editing and preserve original values', () => {
      cy.get('.miq-data-table table tbody').contains('Editable Field').parents('tr').within(() => {
        cy.contains('button', 'Update').click();
      });
      
      cy.getFormInputFieldByIdAndType({ inputId: 'display_name' }).clear().type('Should Not Save');
      
      getModalCancelButton().click();
      
      cy.get('.miq-data-table table tbody').should('contain', 'Editable Field');
      cy.get('.miq-data-table table tbody').should('not.contain', 'Should Not Save');
    });

    it('should reset form to original values when clicking Reset in edit modal', () => {
      cy.get('.miq-data-table table tbody').contains('Editable Field').parents('tr').within(() => {
        cy.contains('button', 'Update').click();
      });
      
      cy.getFormInputFieldByIdAndType({ inputId: 'display_name' }).clear().type('Modified');
      cy.getFormInputFieldByIdAndType({ inputId: 'description' }).clear().type('Modified desc');
      
      getModalResetButton().click();
      
      cy.getFormInputFieldByIdAndType({ inputId: 'display_name' }).should('have.value', 'Editable Field');
      cy.getFormInputFieldByIdAndType({ inputId: 'description' }).should('have.value', 'Original description');
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
      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).clear().type('updated_field_name');
      cy.getFormSelectFieldById({ selectId: 'aetype' }).select('method');
      cy.getFormSelectFieldById({ selectId: 'datatype' }).select('string');
      cy.getFormInputFieldByIdAndType({ inputId: 'default_value' }).clear().type('updated_default_value');
      cy.getFormInputFieldByIdAndType({ inputId: 'display_name' }).clear().type('Updated Field Display');
      cy.getFormInputFieldByIdAndType({ inputId: 'description' }).clear().type('Updated field description');
      cy.getFormInputFieldByIdAndType({ inputId: 'substitute', inputType: 'checkbox' }).uncheck({ force: true });
      cy.getFormInputFieldByIdAndType({ inputId: 'collect' }).clear().type('updated_collect_value');
      cy.getFormInputFieldByIdAndType({ inputId: 'message' }).clear().type('updated_message');
      cy.getFormInputFieldByIdAndType({ inputId: 'on_entry' }).clear().type('updated_on_entry');
      cy.getFormInputFieldByIdAndType({ inputId: 'on_exit' }).clear().type('updated_on_exit');
      cy.getFormInputFieldByIdAndType({ inputId: 'on_error' }).clear().type('updated_on_error');
      cy.getFormInputFieldByIdAndType({ inputId: 'max_retries' }).clear().type('5');
      cy.getFormInputFieldByIdAndType({ inputId: 'max_time' }).clear().type('120');
      
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
      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).should('have.value', 'updated_field_name');
      cy.getFormSelectFieldById({ selectId: 'aetype' }).should('have.value', 'method');
      // cy.getFormSelectFieldById({ selectId: 'datatype' }).should('have.value', 'string');
      // cy.getFormInputFieldByIdAndType({ inputId: 'default_value' }).should('have.value', 'updated_default_value');
      cy.getFormInputFieldByIdAndType({ inputId: 'display_name' }).should('have.value', 'Updated Field Display');
      cy.getFormInputFieldByIdAndType({ inputId: 'description' }).should('have.value', 'Updated field description');
      cy.getFormInputFieldByIdAndType({ inputId: 'substitute', inputType: 'checkbox' }).should('not.be.checked');
      cy.getFormInputFieldByIdAndType({ inputId: 'collect' }).should('have.value', 'updated_collect_value');
      cy.getFormInputFieldByIdAndType({ inputId: 'message' }).should('have.value', 'updated_message');
      cy.getFormInputFieldByIdAndType({ inputId: 'on_entry' }).should('have.value', 'updated_on_entry');
      cy.getFormInputFieldByIdAndType({ inputId: 'on_exit' }).should('have.value', 'updated_on_exit');
      cy.getFormInputFieldByIdAndType({ inputId: 'on_error' }).should('have.value', 'updated_on_error');
      cy.getFormInputFieldByIdAndType({ inputId: 'max_retries' }).should('have.value', '5');
      cy.getFormInputFieldByIdAndType({ inputId: 'max_time' }).should('have.value', '120');
      
      getModalCancelButton().click();
    });
  });

  describe('Delete Schema Field', () => {
    beforeEach(() => {
      cy.get('button').contains('Add a Field').click();
      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type('deletable_field');
      cy.getFormSelectFieldById({ selectId: 'aetype' }).select('attribute');
      cy.getFormInputFieldByIdAndType({ inputId: 'display_name' }).type('Deletable Field');
      clickModalSaveButton();
    });

    it('should delete newly added field before saving schema', () => {
      cy.get('button').contains('Add a Field').click();
      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type('temp_field');
      cy.getFormSelectFieldById({ selectId: 'aetype' }).select('method');
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
      cy.get('button').contains('Add a Field').click();
      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type('test_field');
      cy.getFormSelectFieldById({ selectId: 'aetype' }).select('attribute');
      clickModalSaveButton();
    });

    it('should reset schema to original state', () => {
      // Add another field
      cy.get('button').contains('Add a Field').click();
      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type('field_to_reset');
      cy.getFormSelectFieldById({ selectId: 'aetype' }).select('method');
      clickModalSaveButton();
      
      // Verify both fields exist
      cy.get('.miq-data-table table tbody').should('contain', 'test_field');
      cy.get('.miq-data-table table tbody').should('contain', 'field_to_reset');
      
      // Click reset
      cy.getFormButtonByTypeWithText({ buttonText: 'Reset' }).click();
      
      // Verify reset message
      cy.expect_flash(flashClassMap.success, 'reset');
      
      // Verify redirected back
      cy.expect_explorer_title('Automate Class "SchemaTestClass"');
    });

    it('should cancel schema editing', () => {
      cy.get('button').contains('Add a Field').click();
      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type('cancelled_field');
      cy.getFormSelectFieldById({ selectId: 'aetype' }).select('state');
      clickModalSaveButton();
      
      cy.getFormButtonByTypeWithText({ buttonText: 'Cancel' }).click();
      
      cy.expect_flash(flashClassMap.success, 'cancelled');
      
      // Verify redirected back
      cy.expect_explorer_title('Automate Class "SchemaTestClass"');
    });
  });
});

