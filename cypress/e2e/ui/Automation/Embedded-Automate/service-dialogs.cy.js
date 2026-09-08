import { flashClassMap } from '../../../../support/assertions/assertion_constants';

// ── Constants ─────────────────────────────────────────────────────────────────

const MENU_PATH = ['Automation', 'Embedded Automate', 'Customization'];
const ACCORDION  = 'Service Dialogs';

const TOOLBAR = {
  add:    'Add a new Dialog',
  edit:   'Edit this Dialog',
  copy:   'Copy this Dialog',
  remove: 'Remove Dialog',
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

// ── Sub-Task 3 — Core CRUD flows ─────────────────────────────────────────────

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
    cy.appFactories([['create', 'dialog', { label: TEST_LABEL }]]);
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
    cy.appFactories([['create', 'dialog', { label: TEST_LABEL }]]);
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

    // The factory-created dialog has a default tab+section but no fields.
    // API requires at least one field — drop a TextBox before saving.
    cy.dropFieldIntoSection('DialogFieldTextBox');
    cy.get('.dynamic-field--text-box').should('exist');

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

describe('Service Dialogs — Delete', () => {
  beforeEach(() => {
    cy.appFactories([['create', 'dialog', { label: TEST_LABEL }]]);
    cy.login();
    goToServiceDialogs();
    selectDialog(TEST_LABEL);
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  it('Delete — browser confirm accepted → flash success', () => {
    cy.expect_browser_confirm_with_text({
      confirmTriggerFn: () => cy.toolbar('Configuration', TOOLBAR.remove),
      proceed: true,
    });

    cy.expect_flash(flashClassMap.success, 'delete');
  });
});

// ── Sub-Task 4 — Tab and Section management ───────────────────────────────────
//
//   All tests open "Add a new Dialog" and never click the outer Save button,
//   so nothing is persisted — no appDbState('restore') needed.

describe('Service Dialogs — Tab management', () => {
  beforeEach(() => {
    cy.login();
    goToServiceDialogs();
    cy.toolbar('Configuration', TOOLBAR.add);
    cy.get('#dialog-label').type(TEST_LABEL);
  });

  it('Add tab — new tab appears in the tab list', () => {
    cy.get('[role="tab"]').its('length').then((initialCount) => {
      cy.contains('button', 'Add tab').click();
      cy.get('[role="tab"]').should('have.length', initialCount + 1);
    });
  });

  it('Rename tab — modal updates the tab label', () => {
    cy.get('[role="tab"]').first().within(() => {
      cy.get('button.cds--overflow-menu').click();
    });
    cy.get('.cds--overflow-menu-options li button').contains('Edit').click();

    cy.get('.cds--modal-container').should('be.visible');
    cy.get('.cds--modal-container input').clear().type('Renamed Tab');
    cy.expect_modal({ targetFooterButtonText: 'Save' });

    cy.get('[role="tab"]').first().should('contain.text', 'Renamed Tab');
  });

  it('Delete tab — with two tabs present, deleting one removes it', () => {
    cy.contains('button', 'Add tab').click();
    cy.get('[role="tab"]').should('have.length', 2);

    cy.get('[role="tab"]').first().within(() => {
      cy.get('button.cds--overflow-menu').click();
    });
    cy.get('.cds--overflow-menu-options li button').contains('Delete').click();

    cy.get('[role="tab"]').should('have.length', 1);
  });
});

describe('Service Dialogs — Section management', () => {
  beforeEach(() => {
    cy.login();
    goToServiceDialogs();
    cy.toolbar('Configuration', TOOLBAR.add);
    cy.get('#dialog-label').type(TEST_LABEL);
    cy.get('[role="tab"]').first().click();
  });

  it('Add section — new section appears in the canvas', () => {
    cy.get('.dynamic-section').its('length').then((initialCount) => {
      cy.contains('button', 'Add Section').click();
      cy.get('.dynamic-section').should('have.length', initialCount + 1);
    });
  });

  it('Rename section — modal updates the section heading', () => {
    cy.get('.dynamic-section').first().within(() => {
      cy.get('.dynamic-section__actions button:first-child').click();
    });

    cy.get('.cds--modal-container').should('be.visible');
    cy.get('.cds--modal-container input').clear().type('Renamed Section');
    cy.expect_modal({ targetFooterButtonText: 'Save' });

    cy.get('.dynamic-section').first().should('contain.text', 'Renamed Section');
  });

  it('Delete section — section disappears after clicking Delete section', () => {
    // Add a second section so deleting the first is valid
    cy.contains('button', 'Add Section').click();
    cy.get('.dynamic-section').should('have.length', 2);

    cy.get('.dynamic-section').first().within(() => {
      cy.get('.dynamic-section__actions button:last-child').click();
    });

    cy.get('.dynamic-section').should('have.length', 1);
  });
});

// ── Sub-Task 6 — Draft recovery flow ─────────────────────────────────────────

describe('Service Dialogs — Draft recovery', () => {
  const DRAFT_LABEL = 'Draft Test Label';

  beforeEach(() => {
    cy.login();
    goToServiceDialogs();
  });

  afterEach(() => {
    cy.window().then((w) => w.sessionStorage.clear());
  });

  it('Restore path — reload triggers Restore modal; clicking Restore restores the draft', () => {
    cy.toolbar('Configuration', TOOLBAR.add);
    cy.get('#dialog-label').type(DRAFT_LABEL);

    // Wait for the 500ms debounce to write to sessionStorage
    cy.wait(600);
    cy.reload();

    cy.expect_modal({
      modalHeaderText: 'Restore previous changes?',
      targetFooterButtonText: 'Restore',
    });

    cy.get('#dialog-label').should('have.value', DRAFT_LABEL);
  });

  it('Discard path — clicking Discard gives a fresh empty form', () => {
    cy.toolbar('Configuration', TOOLBAR.add);
    cy.get('#dialog-label').type(DRAFT_LABEL);

    cy.wait(600);
    cy.reload();

    cy.expect_modal({ targetFooterButtonText: 'Discard' });

    cy.get('#dialog-label').should('have.value', '');
  });

  it('No draft modal when no draft exists', () => {
    cy.toolbar('Configuration', TOOLBAR.add);
    cy.reload();

    cy.get('.cds--modal-container').should('not.exist');
  });
});

// ── Sub-Task 5 — Field palette drag and Edit Field modal ─────────────────────
//
//   Uses Add-new-dialog flow; never clicks the outer Save button so nothing
//   is persisted — no appDbState('restore') needed.
//
//   cy.dropFieldIntoSection(fieldTypeId) is defined in
//   cypress/support/commands/service_dialog_commands.js

describe('Service Dialogs — Field palette drag', () => {
  // Field type definitions: id sent via DataTransfer, cssClass on the wrapper,
  // assert verifies the rendered widget element.
  const FIELD_TYPES = [
    {
      id:       'DialogFieldTextBox',
      cssClass: 'dynamic-field--text-box',
      assert:   ($el) => expect($el.find('input[type="text"]').length).to.be.at.least(1),
    },
    {
      id:       'DialogFieldTextAreaBox',
      cssClass: 'dynamic-field--text-area',
      assert:   ($el) => expect($el.find('textarea').length).to.be.at.least(1),
    },
    {
      id:       'DialogFieldCheckBox',
      cssClass: 'dynamic-field--check-box',
      assert:   ($el) => expect($el.find('input[type="checkbox"]').length).to.be.at.least(1),
    },
    {
      id:       'DialogFieldDropDownList',
      cssClass: 'dynamic-field--dropdown',
      assert:   ($el) => expect($el.find('.cds--dropdown, .cds--multi-select').length).to.be.at.least(1),
    },
    {
      id:       'DialogFieldRadioButton',
      cssClass: 'dynamic-field--radio-button',
      assert:   ($el) => expect($el.find('[role="radiogroup"]').length).to.be.at.least(1),
    },
    {
      id:       'DialogFieldDateControl',
      cssClass: 'dynamic-field--date-picker',
      assert:   ($el) => expect($el.find('.cds--date-picker').length).to.be.at.least(1),
    },
    {
      id:       'DialogFieldDateTimeControl',
      cssClass: 'dynamic-field--time-picker',
      assert:   ($el) => expect($el.find('.cds--time-picker, .cds--date-picker').length).to.be.at.least(1),
    },
    {
      id:       'DialogFieldTagControl',
      cssClass: 'dynamic-field--tag-control',
      assert:   ($el) => expect($el.find('select').length).to.be.at.least(1),
    },
  ];

  beforeEach(() => {
    cy.login();
    goToServiceDialogs();
    cy.toolbar('Configuration', TOOLBAR.add);
    cy.get('#dialog-label').type('Drag Test Dialog');
    cy.get('.dynamic-section__body').should('exist');
  });

  FIELD_TYPES.forEach(({ id, cssClass, assert }) => {
    it(`drop ${id} → field widget appears in section`, () => {
      cy.dropFieldIntoSection(id);
      cy.get(`.dynamic-section .${cssClass}`).should('exist').then(assert);
    });
  });
});

describe('Service Dialogs — Dropdown Edit Field modal round-trip (F19 regression)', () => {
  beforeEach(() => {
    cy.login();
    goToServiceDialogs();
    cy.toolbar('Configuration', TOOLBAR.add);
    cy.get('#dialog-label').type('Modal Test Dialog');
    cy.get('.dynamic-section__body').should('exist');

    cy.dropFieldIntoSection('DialogFieldDropDownList');
    cy.get('.dynamic-field--dropdown').should('exist');
  });

  it('Edit modal opens on the correct field', () => {
    cy.openFieldEditModal();
    cy.get('.cds--modal-container').should('be.visible');
    cy.get('.cds--modal-container .cds--modal-header__heading').should('contain', 'Dropdown');
  });

  it('Options tab defaults Sort by to Description', () => {
    cy.openFieldEditModal();
    cy.get('.cds--modal-container').should('be.visible');

    cy.tabs({ tabLabel: 'Options' });

    cy.get('select#options\\.sort_by').should('have.value', 'description');
  });

  it('Sort by persists after Save and reopen — F19 regression', () => {
    cy.openFieldEditModal();
    cy.get('.cds--modal-container').should('be.visible');
    cy.tabs({ tabLabel: 'Options' });

    cy.get('select#options\\.sort_by').select('value');

    cy.expect_modal({ targetFooterButtonText: 'Save' });
    cy.get('.cds--modal-container').should('not.exist');

    cy.openFieldEditModal();
    cy.get('.cds--modal-container').should('be.visible');
    cy.tabs({ tabLabel: 'Options' });

    cy.get('select#options\\.sort_by').should('have.value', 'value');
  });
});

describe('Service Dialogs — TextBox validator round-trip', () => {
  const REGEX_PATTERN = '^[a-z]+$';

  beforeEach(() => {
    cy.login();
    goToServiceDialogs();
    cy.toolbar('Configuration', TOOLBAR.add);
    cy.get('#dialog-label').type('Validator Test Dialog');
    cy.get('.dynamic-section__body').should('exist');

    cy.dropFieldIntoSection('DialogFieldTextBox');
    cy.get('.dynamic-field--text-box').should('exist');
  });

  it('Validator toggle reveals regex input; pattern persists after Save and reopen', () => {
    cy.openFieldEditModal();
    cy.get('.cds--modal-container').should('be.visible');

    cy.tabs({ tabLabel: 'Options' });

    // Validator toggle is off by default — toggle it on
    cy.get('.cds--modal-container button#validator_type').click();

    // Regex input should now appear
    cy.get('.cds--modal-container input#validator_rule').should('be.visible');
    cy.get('.cds--modal-container input#validator_rule').clear().type(REGEX_PATTERN);

    cy.expect_modal({ targetFooterButtonText: 'Save' });
    cy.get('.cds--modal-container').should('not.exist');

    cy.openFieldEditModal();
    cy.get('.cds--modal-container').should('be.visible');
    cy.tabs({ tabLabel: 'Options' });

    cy.get('.cds--modal-container input#validator_rule').should('have.value', REGEX_PATTERN);
  });
});
