import { flashClassMap } from '../../../../../support/assertions/assertion_constants';

// Drag and drop, Reset and button states are covered by
// app/javascript/spec/schema-sequence-editor/schema-sequence-editor.spec.js.

// Toolbar options
const TOOLBAR_CONFIGURATION = 'Configuration';
const TOOLBAR_EDIT_SEQUENCE = 'Edit sequence';

// Button labels
const SAVE_BUTTON_TEXT = 'Save';
const CANCEL_BUTTON_TEXT = 'Cancel';

// Selectors
const SORTABLE_ITEMS = '.schema-sequence-editor .sortable-list .sortable-list-item';

const navigateToSequenceEdit = () => {
  cy.selectAccordionItem(['Datastore', 'SeqTestDomain', 'SeqTestNameSpace', 'SeqTestClass']);
  cy.tabs({ tabLabel: 'Schema' });
  cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_EDIT_SEQUENCE);
  cy.expect_explorer_title("Edit of Class Schema Sequence 'SeqTestClass'");
};

describe('Automation > Embedded Automate > Explorer > Schema Sequence Edit', () => {
  /**
   * Creates the full tree: Domain → Namespace → Class → 3 Fields with priorities.
   * miq_ae_field has no standalone FactoryBot factory, so fields are created
   * directly via MiqAeField.create! using cy.appEval after the class is set up.
   */
  beforeEach(() => {
    cy.appFactories([
      ['create', 'miq_ae_domain', { name: 'SeqTestDomain' }],
    ]).then(([domain]) => {
      cy.appFactories([
        ['create', 'miq_ae_namespace', { name: 'SeqTestNameSpace', domain_id: domain.id }],
      ]).then(([namespace]) => {
        cy.appFactories([
          ['create', 'miq_ae_class', { name: 'SeqTestClass', namespace_id: namespace.id }],
        ]).then(([cls]) => {
          cy.appEval(`
            cls = MiqAeClass.find(${cls.id})
            [
              { name: 'field_a', display_name: 'Field A', aetype: 'attribute', priority: 1 },
              { name: 'field_b', display_name: 'Field B', aetype: 'attribute', priority: 2 },
              { name: 'field_c', display_name: 'Field C', aetype: 'attribute', priority: 3 },
            ].each do |attrs|
              MiqAeField.create!(attrs.merge(class_id: cls.id))
            end
          `);
        });
      });
    });

    cy.login();
    cy.intercept('POST', '/ops/accordion_select?id=rbac_accord').as('accordion');
    cy.menu('Automation', 'Embedded Automate', 'Explorer');
    cy.expect_explorer_title('Datastore');

    navigateToSequenceEdit();
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  it('loads the class fields from the server in priority order', () => {
    cy.get(SORTABLE_ITEMS).should('have.length', 3);
    cy.get(SORTABLE_ITEMS).eq(0).should('contain', 'Field A').and('contain', 'field_a');
    cy.get(SORTABLE_ITEMS).eq(1).should('contain', 'Field B').and('contain', 'field_b');
    cy.get(SORTABLE_ITEMS).eq(2).should('contain', 'Field C').and('contain', 'field_c');
  });

  it('saves a new field order and persists it', () => {
    // Move field_a down twice
    cy.get(SORTABLE_ITEMS).eq(0).focus().type('{downarrow}');
    cy.get(SORTABLE_ITEMS).eq(1).focus().type('{downarrow}');

    cy.get(SORTABLE_ITEMS).eq(0).should('contain', 'field_b');
    cy.get(SORTABLE_ITEMS).eq(1).should('contain', 'field_c');
    cy.get(SORTABLE_ITEMS).eq(2).should('contain', 'field_a');

    cy.getFormButtonByTypeWithText({ buttonText: SAVE_BUTTON_TEXT, buttonType: 'submit' }).click();

    cy.expect_flash(flashClassMap.success, 'saved');
    cy.expect_explorer_title('Automate Class "SeqTestClass"');

    // The order is stored in the database ...
    cy.appEval("MiqAeClass.find_by(:name => 'SeqTestClass').ae_fields.order(:priority).pluck(:name)")
      .should('deep.equal', ['field_b', 'field_c', 'field_a']);

    // ... and loaded back by the editor
    navigateToSequenceEdit();
    cy.get(SORTABLE_ITEMS).eq(0).should('contain', 'field_b');
    cy.get(SORTABLE_ITEMS).eq(1).should('contain', 'field_c');
    cy.get(SORTABLE_ITEMS).eq(2).should('contain', 'field_a');
  });

  it('cancels without saving and redirects back with a warning flash', () => {
    cy.get(SORTABLE_ITEMS).eq(0).focus().type('{downarrow}');

    cy.getFormButtonByTypeWithText({ buttonText: CANCEL_BUTTON_TEXT }).click();

    cy.expect_flash(flashClassMap.warning, 'cancel');
    cy.expect_explorer_title('Automate Class "SeqTestClass"');

    cy.appEval("MiqAeClass.find_by(:name => 'SeqTestClass').ae_fields.order(:priority).pluck(:name)")
      .should('deep.equal', ['field_a', 'field_b', 'field_c']);
  });
});
