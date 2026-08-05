/* eslint-disable no-undef */
import { flashClassMap } from '../../../../../support/assertions/assertion_constants';

// Toolbar options
const TOOLBAR_CONFIGURATION = 'Configuration';
const TOOLBAR_EDIT_SEQUENCE = 'Edit sequence';

// Button labels
const SAVE_BUTTON_TEXT = 'Save';
const RESET_BUTTON_TEXT = 'Reset';
const CANCEL_BUTTON_TEXT = 'Cancel';

// Selectors
const SEQUENCE_EDITOR = '.schema-sequence-editor';
const SORTABLE_LIST = `${SEQUENCE_EDITOR} .sortable-list`;
const SORTABLE_ITEMS = `${SORTABLE_LIST} .sortable-list-item`;
const CHECKBOXES = `${SORTABLE_ITEMS} input[type="checkbox"]`;

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

  describe('Initial state', () => {
    it('renders the editor with fields in priority order and the helper text', () => {
      cy.get(SEQUENCE_EDITOR).should('be.visible');
      cy.contains('.cds--label', 'Fields:').should('be.visible');
      cy.contains('.cds--form__helper-text', 'Drag and drop to reorder fields').should('be.visible');

      cy.get(SORTABLE_ITEMS).should('have.length', 3);
      cy.get(SORTABLE_ITEMS).eq(0).should('contain', 'Field A').and('contain', 'field_a');
      cy.get(SORTABLE_ITEMS).eq(1).should('contain', 'Field B').and('contain', 'field_b');
      cy.get(SORTABLE_ITEMS).eq(2).should('contain', 'Field C').and('contain', 'field_c');
    });

    it('Save and Reset are disabled, Cancel is enabled before any changes', () => {
      cy.getFormButtonByTypeWithText({ buttonText: SAVE_BUTTON_TEXT, buttonType: 'submit' })
        .should('be.visible').and('be.disabled');
      cy.getFormButtonByTypeWithText({ buttonText: RESET_BUTTON_TEXT })
        .should('be.visible').and('be.disabled');
      cy.getFormButtonByTypeWithText({ buttonText: CANCEL_BUTTON_TEXT })
        .should('be.visible').and('be.enabled');
    });
  });

  describe('Reordering', () => {
    it('reorders a single item down via keyboard and enables Save and Reset', () => {
      cy.get(SORTABLE_ITEMS).eq(0).focus().type('{downarrow}');

      cy.get(SORTABLE_ITEMS).eq(0).should('contain', 'field_b');
      cy.get(SORTABLE_ITEMS).eq(1).should('contain', 'field_a');
      cy.get(SORTABLE_ITEMS).eq(2).should('contain', 'field_c');

      cy.getFormButtonByTypeWithText({ buttonText: SAVE_BUTTON_TEXT, buttonType: 'submit' })
        .should('be.enabled');
      cy.getFormButtonByTypeWithText({ buttonText: RESET_BUTTON_TEXT })
        .should('be.enabled');
    });

    it('reorders a single item up via keyboard', () => {
      cy.get(SORTABLE_ITEMS).eq(2).focus().type('{uparrow}');

      cy.get(SORTABLE_ITEMS).eq(0).should('contain', 'field_a');
      cy.get(SORTABLE_ITEMS).eq(1).should('contain', 'field_c');
      cy.get(SORTABLE_ITEMS).eq(2).should('contain', 'field_b');
    });

    it('reorders a single item via drag and drop', () => {
      const dataTransfer = new DataTransfer();

      // Capture the DOM element before any reorder happens
      cy.get(SORTABLE_ITEMS).eq(0).then(($source) => {
        cy.wrap($source).trigger('dragstart', { dataTransfer });
        cy.get(SORTABLE_ITEMS).eq(2).trigger('dragover', { dataTransfer });
        cy.wrap($source).trigger('dragend', { dataTransfer });
      });

      cy.get(SORTABLE_ITEMS).eq(0).should('contain', 'field_b');
      cy.get(SORTABLE_ITEMS).eq(1).should('contain', 'field_a');
      cy.get(SORTABLE_ITEMS).eq(2).should('contain', 'field_c');

      cy.getFormButtonByTypeWithText({ buttonText: SAVE_BUTTON_TEXT, buttonType: 'submit' })
        .should('be.enabled');
      cy.getFormButtonByTypeWithText({ buttonText: RESET_BUTTON_TEXT })
        .should('be.enabled');
    });

    it('reorders multiple consecutive items via drag as a group', () => {
      cy.get(CHECKBOXES).eq(1).check({ force: true });
      cy.get(CHECKBOXES).eq(2).check({ force: true });

      cy.get(SORTABLE_ITEMS).eq(1).should('have.class', 'selected');
      cy.get(SORTABLE_ITEMS).eq(2).should('have.class', 'selected');

      const dataTransfer = new DataTransfer();

      // Capture the group's lead element before reordering
      cy.get(SORTABLE_ITEMS).eq(1).then(($source) => {
        cy.wrap($source).trigger('dragstart', { dataTransfer });
        cy.get(SORTABLE_ITEMS).eq(0).trigger('dragover', { dataTransfer });
        cy.wrap($source).trigger('dragend', { dataTransfer });
      });

      cy.get(SORTABLE_ITEMS).eq(0).should('contain', 'field_b');
      cy.get(SORTABLE_ITEMS).eq(1).should('contain', 'field_c');
      cy.get(SORTABLE_ITEMS).eq(2).should('contain', 'field_a');

      cy.getFormButtonByTypeWithText({ buttonText: SAVE_BUTTON_TEXT, buttonType: 'submit' })
        .should('be.enabled');
    });

    it('shows an error and blocks drag when non-consecutive items are selected', () => {
      // Select items 0 and 2 — non-consecutive
      cy.get(CHECKBOXES).eq(0).check({ force: true });
      cy.get(CHECKBOXES).eq(2).check({ force: true });

      const dataTransfer = new DataTransfer();
      cy.get(SORTABLE_ITEMS).eq(0).trigger('dragstart', { dataTransfer });

      cy.get(`${SEQUENCE_EDITOR} .cds--inline-notification`)
        .should('be.visible')
        .and('contain', 'Select only one or consecutive Fields');

      cy.get(SORTABLE_ITEMS).eq(0).should('contain', 'field_a');
      cy.get(SORTABLE_ITEMS).eq(1).should('contain', 'field_b');
      cy.get(SORTABLE_ITEMS).eq(2).should('contain', 'field_c');
      cy.getFormButtonByTypeWithText({ buttonText: SAVE_BUTTON_TEXT, buttonType: 'submit' })
        .should('be.disabled');
    });
  });

  describe('Form actions', () => {
    it('resets the list to original order and disables Save and Reset', () => {
      cy.get(SORTABLE_ITEMS).eq(0).focus().type('{downarrow}');
      cy.get(SORTABLE_ITEMS).eq(0).should('contain', 'field_b');

      cy.getFormButtonByTypeWithText({ buttonText: RESET_BUTTON_TEXT }).click();

      cy.get(SORTABLE_ITEMS).eq(0).should('contain', 'field_a');
      cy.get(SORTABLE_ITEMS).eq(1).should('contain', 'field_b');
      cy.get(SORTABLE_ITEMS).eq(2).should('contain', 'field_c');

      cy.getFormButtonByTypeWithText({ buttonText: SAVE_BUTTON_TEXT, buttonType: 'submit' })
        .should('be.disabled');
      cy.getFormButtonByTypeWithText({ buttonText: RESET_BUTTON_TEXT })
        .should('be.disabled');
    });

    it('cancels without saving and redirects back with a warning flash', () => {
      cy.getFormButtonByTypeWithText({ buttonText: CANCEL_BUTTON_TEXT }).click();

      cy.expect_flash(flashClassMap.warning, 'cancel');
      cy.expect_explorer_title('Automate Class "SeqTestClass"');
    });

    it('saves a new field order and verifies persistence', () => {
      // Move field_a down twice
      cy.get(SORTABLE_ITEMS).eq(0).focus().type('{downarrow}');
      cy.get(SORTABLE_ITEMS).eq(1).focus().type('{downarrow}');

      cy.get(SORTABLE_ITEMS).eq(0).should('contain', 'field_b');
      cy.get(SORTABLE_ITEMS).eq(1).should('contain', 'field_c');
      cy.get(SORTABLE_ITEMS).eq(2).should('contain', 'field_a');

      cy.getFormButtonByTypeWithText({ buttonText: SAVE_BUTTON_TEXT, buttonType: 'submit' }).click();

      cy.expect_flash(flashClassMap.success, 'saved');
      cy.expect_explorer_title('Automate Class "SeqTestClass"');

      // Confirm the new order persisted — navigate back to sequence editor
      navigateToSequenceEdit();

      cy.get(SORTABLE_ITEMS).eq(0).should('contain', 'field_b');
      cy.get(SORTABLE_ITEMS).eq(1).should('contain', 'field_c');
      cy.get(SORTABLE_ITEMS).eq(2).should('contain', 'field_a');
    });
  });
});
