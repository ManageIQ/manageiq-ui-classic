import { flashClassMap } from '../../../../../support/assertions/assertion_constants';

// Client-side behaviour of the editor and its modal is covered by
// app/javascript/spec/class-fields-editor/class-fields-editor.spec.js.
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
      .should('exist')
      .click({ force: true });
  };

  const clickModalSaveButton = () => {
    cy.get('.cds--modal-container')
      .find('button[type="submit"]')
      .contains('Save')
      .should('be.enabled')
      .click({ force: true });
  };

  const getModalCancelButton = () =>
    cy.get('.cds--modal-container')
      .find('button[type="button"]')
      .contains('Cancel');

  // Gets an input inside the modal by field id.
  const getModalInput = (inputId, inputType = 'text') =>
    cy.get(`.cds--modal-container form input[id="${inputId}"][type="${inputType}"]`);

  const rowFor = (text) => cy.get('.miq-data-table table tbody').contains(text).parents('tr');

  const addField = ({ name, aetype = 'Attribute', displayName }) => {
    cy.contains('button', 'Add a Field').click();
    getModalInput('name').type(name);
    selectAeTypeOrDataType('aetype', aetype);
    if (displayName) {
      getModalInput('display_name').type(displayName);
    }
    clickModalSaveButton();
  };

  const saveSchema = () => {
    cy.getFormButtonByTypeWithText({ buttonText: 'Save', buttonType: 'submit' }).click();
    cy.expect_flash(flashClassMap.success, 'saved');
    cy.expect_explorer_title('Automate Class "SchemaTestClass"');
  };

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

  describe('Add and edit schema fields', () => {
    it('saves a new field, shows it in the read-only schema and updates every attribute on a later edit', () => {
      cy.contains('button', 'Add a Field').click();
      getModalInput('name').type('editable_field');
      selectAeTypeOrDataType('aetype', 'Attribute');
      getModalInput('display_name').type('Editable Field');
      getModalInput('description').type('Original description');
      clickModalSaveButton();

      saveSchema();

      // The saved field is listed on the read-only Schema tab
      cy.tabs({ tabLabel: 'Schema' });
      cy.get('.miq-data-table table tbody').should('contain', 'Editable Field (editable_field)');

      navigateToSchemaEdit();
      rowFor('Editable Field').within(() => {
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

      saveSchema();
      navigateToSchemaEdit();

      // Reopen the edit modal to verify every value reached the database
      rowFor('Updated Field Display').within(() => {
        cy.contains('button', 'Update').click();
      });

      getModalInput('name').should('have.value', 'updated_field_name');
      getModalInput('display_name').should('have.value', 'Updated Field Display');
      getModalInput('description').should('have.value', 'Updated field description');
      getModalInput('default_value').should('have.value', 'updated_default_value');
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

  describe('Delete schema field', () => {
    it('removes a previously saved field from the database', () => {
      addField({ name: 'deletable_field', displayName: 'Deletable Field' });
      saveSchema();

      navigateToSchemaEdit();
      cy.get('.miq-data-table table tbody').contains('Deletable Field').should('exist');

      rowFor('Deletable Field').within(() => {
        cy.contains('button', 'Delete').click();
      });
      cy.get('.miq-data-table table tbody').contains('Deletable Field').should('not.exist');

      saveSchema();

      navigateToSchemaEdit();
      cy.get('.miq-data-table table tbody').contains('Deletable Field').should('not.exist');
    });
  });

  describe('Schema form actions', () => {
    it('reloads the saved schema from the server when Reset is clicked', () => {
      addField({ name: 'saved_field' });
      saveSchema();

      navigateToSchemaEdit();
      addField({ name: 'field_to_reset', aetype: 'Method' });

      // Wait for the modal to fully close before interacting with the form-level Reset button.
      cy.get('.cds--modal').should('not.have.class', 'is-visible');
      cy.get('.miq-data-table table tbody').should('contain', 'field_to_reset');

      cy.getFormButtonByTypeWithText({ buttonText: 'Reset' }).click();

      cy.expect_flash(flashClassMap.warning, 'reset');
      cy.expect_explorer_title('Editing Class Schema "SchemaTestClass"');
      cy.get('.miq-data-table table tbody').should('contain', 'saved_field');
      cy.get('.miq-data-table table tbody').should('not.contain', 'field_to_reset');
    });

    it('discards unsaved changes and returns to the class when Cancel is clicked', () => {
      addField({ name: 'cancelled_field', aetype: 'State' });

      // Wait for the modal to fully close before clicking the form-level Cancel button.
      cy.get('.cds--modal').should('not.have.class', 'is-visible');
      cy.getFormButtonByTypeWithText({ buttonText: 'Cancel' }).click();

      cy.expect_flash(flashClassMap.success, 'cancelled');
      cy.expect_explorer_title('Automate Class "SchemaTestClass"');

      navigateToSchemaEdit();
      cy.get('.miq-data-table table tbody').should('not.contain', 'cancelled_field');
    });
  });

  describe('Password fields', () => {
    const storedPassword = () => cy.appEval(`
      field = MiqAeField.find_by(:name => 'secret_field')
      field && MiqAePassword.decrypt(field.default_value)
    `);

    it('keeps the stored password when the field is not edited, and replaces it when typed', () => {
      cy.contains('button', 'Add a Field').click();
      getModalInput('name').type('secret_field');
      selectAeTypeOrDataType('aetype', 'Attribute');
      selectAeTypeOrDataType('datatype', 'Password');
      getModalInput('default_value', 'password').type('s3cret!');
      clickModalSaveButton();
      saveSchema();
      storedPassword().should('eq', 's3cret!');

      // Reopen and save without touching the password: it must survive.
      navigateToSchemaEdit();
      rowFor('secret_field').should('contain', '********');
      rowFor('secret_field').within(() => {
        cy.contains('button', 'Update').click();
      });
      getModalInput('description').type('changed description');
      clickModalSaveButton();
      saveSchema();
      storedPassword().should('eq', 's3cret!');
      cy.appEval("MiqAeField.find_by(:name => 'secret_field').description").should('eq', 'changed description');

      // Reopen and type a new password: it must be replaced.
      navigateToSchemaEdit();
      rowFor('secret_field').within(() => {
        cy.contains('button', 'Update').click();
      });
      getModalInput('default_value', 'password').clear().type('n3w-pass');
      clickModalSaveButton();
      saveSchema();
      storedPassword().should('eq', 'n3w-pass');
    });
  });
});
