import { flashClassMap } from '../../../../support/assertions/assertion_constants';

// ── Constants ─────────────────────────────────────────────────────────────────

const MENU_PATH = ['Automation', 'Embedded Automate', 'Customization'];
const ACCORDION  = 'Service Dialogs';

const TOOLBAR = {
  add:  'Add a new Dialog',
  edit: 'Edit this Dialog',
  copy: 'Copy this Dialog',
};

const TEST_LABEL       = 'Cypress Test Dialog';
const TEST_DESCRIPTION = 'Created by Cypress';
const EDITED_LABEL     = 'Cypress Edited Dialog';
const COPY_PREFIX      = 'Copy of ';

// ── Shared navigation helpers ─────────────────────────────────────────────────

/** Navigate to the Customization page and expand the Service Dialogs accordion. */
const goToServiceDialogs = () => {
  cy.menu(...MENU_PATH);
  cy.accordion(ACCORDION);
  cy.selectAccordionItem(['All Dialogs']);
};

/**
 * Select a named Service Dialog in the accordion tree.
 * This navigates to the record and enables the Edit / Copy / Remove toolbar actions.
 */
const selectDialog = (label) => {
  cy.selectAccordionItem(['All Dialogs', label]);
};

// ── CRUD flows ────────────────────────────────────────────────────────────────
//
// These tests require a live Rails server and DB.
// UI-level concerns (rendering, interactions, component logic) are covered in Jest:
//   spec/service-dialog-form/interaction.test.jsx
//   spec/service-dialog-form/use-draft-recovery.test.js

/**
 * Create a fully structured dialog (dialog → tab → section → text field) via
 * factory_bot so the React editor loads with Save enabled.
 * Pass association IDs (not objects) — appFactories returns JSON hashes, not AR objects.
 */
const createStructuredDialog = () => {
  cy.appFactories([['create', 'dialog', { label: TEST_LABEL }]])
    .then(([dialog]) => cy.appFactories([['create', 'dialog_tab', { label: 'Tab 1', dialog_id: dialog.id }]]))
    .then(([tab]) => cy.appFactories([['create', 'dialog_group', { label: 'Section 1', dialog_tab_id: tab.id }]]))
    .then(([group]) => cy.appFactories([['create', 'dialog_field_text_box', { label: 'Text Box', dialog_group_id: group.id }]]));
};

describe('Service Dialogs — Add', () => {
  beforeEach(() => {
    cy.login();
    goToServiceDialogs();
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  it('Add a new dialog — form renders with expected initial state', () => {
    cy.toolbar('Configuration', TOOLBAR.add);

    // Label and description inputs are present and empty
    cy.get('#dialog-label').should('be.visible').and('have.value', '');
    cy.get('#dialog-description').should('be.visible').and('have.value', '');

    // Save is disabled until a label is typed; Cancel is always enabled
    cy.contains('button', 'Save').should('be.disabled');
    cy.contains('button', 'Cancel').should('not.be.disabled');

    // At least one default tab and section are rendered
    cy.get('[role="tab"]').should('have.length.at.least', 1);
    cy.get('.dynamic-section').should('have.length.at.least', 1);
  });

  it('Add a new dialog — Save sends POST create and shows success flash', () => {
    cy.toolbar('Configuration', TOOLBAR.add);
    cy.get('#dialog-label').type(TEST_LABEL);
    cy.get('#dialog-description').type(TEST_DESCRIPTION);

    // API requires at least one field in the section — drop a TextBox
    cy.dropFieldIntoSection('DialogFieldTextBox');
    cy.get('.dynamic-field--text-box').should('exist');

    cy.interceptApi({
      alias: 'createDialog',
      method: 'POST',
      urlPattern: /\/api\/service_dialogs/,
      triggerFn: () => cy.contains('button', 'Save').click(),
    });

    cy.expect_flash(flashClassMap.success, 'added');
  });
});

describe('Service Dialogs — Cancel', () => {
  beforeEach(() => {
    cy.login();
    goToServiceDialogs();
  });

  it('Cancel on a new dialog shows cancelled flash without creating a record', () => {
    cy.toolbar('Configuration', TOOLBAR.add);
    cy.get('#dialog-label').type(TEST_LABEL);

    cy.contains('button', 'Cancel').click();
    cy.expect_flash(flashClassMap.warning, 'cancelled');
  });
});

describe('Service Dialogs — Edit', () => {
  beforeEach(() => {
    createStructuredDialog();
    cy.login();
    goToServiceDialogs();
    selectDialog(TEST_LABEL);
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  it('Edit — Save sends POST edit and shows success flash', () => {
    cy.toolbar('Configuration', TOOLBAR.edit);
    cy.get('#dialog-label').clear().type(EDITED_LABEL);

    cy.interceptApi({
      alias: 'editDialog',
      method: 'POST',
      urlPattern: /\/api\/service_dialogs\/\d+/,
      triggerFn: () => cy.contains('button', 'Save').click(),
    });

    cy.expect_flash(flashClassMap.success, 'saved');
  });

  it('Edit — Cancel returns without persisting changes', () => {
    cy.toolbar('Configuration', TOOLBAR.edit);
    cy.get('#dialog-label').clear().type(EDITED_LABEL);

    cy.contains('button', 'Cancel').click();
    cy.expect_flash(flashClassMap.warning, 'cancelled');
  });
});

describe('Service Dialogs — Copy', () => {
  beforeEach(() => {
    createStructuredDialog();
    cy.login();
    goToServiceDialogs();
    selectDialog(TEST_LABEL);
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  it('Copy pre-fills label with "Copy of <original>" and saves successfully', () => {
    cy.toolbar('Configuration', TOOLBAR.copy);

    cy.get('#dialog-label').should('have.value', `${COPY_PREFIX}${TEST_LABEL}`);

    cy.interceptApi({
      alias: 'copyDialog',
      method: 'POST',
      urlPattern: /\/api\/service_dialogs/,
      triggerFn: () => cy.contains('button', 'Save').click(),
    });

    // Copy uses 'create' action → flash says "was added"
    cy.expect_flash(flashClassMap.success, 'added');
  });
});

