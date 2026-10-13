import { flashClassMap } from '../../../../support/assertions/assertion_constants';

const MENU_PATH = ['Automation', 'Embedded Automate', 'Customization'];
const ACCORDION  = 'Service Dialogs';

const TOOLBAR = {
  add:  'Add a new Dialog',
  edit: 'Edit this Dialog',
  copy: 'Copy this Dialog',
};

const TEST_LABEL       = 'Test Dialog';
const TEST_DESCRIPTION = 'Test description';
const EDITED_LABEL     = 'Edited Dialog';
const COPY_PREFIX      = 'Copy of ';

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

/**
 * Create a fully structured dialog (dialog → tab → section → text field) via
 * factory_bot so the editor loads with Save enabled.
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

    cy.get('#dialog-label').should('be.visible').and('have.value', '');
    cy.get('#dialog-description').should('be.visible').and('have.value', '');

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

    cy.expect_flash(flashClassMap.success, 'added');
  });
});

// Editor behaviour: palette, modals, tab/section CRUD, save guard, drafts.
// These run against the "Add" editor so they need no pre-seeded records.

const DRAFT_KEY = 'service_dialog-new';
const MODAL     = '.cds--modal.is-visible';

/** Field palette entries: [palette id, canvas modifier class]. */
const FIELD_TYPES = [
  ['DialogFieldTextBox', 'text-box'],
  ['DialogFieldTextAreaBox', 'text-area'],
  ['DialogFieldCheckBox', 'check-box'],
  ['DialogFieldDropDownList', 'dropdown'],
  ['DialogFieldRadioButton', 'radio-button'],
  ['DialogFieldDateControl', 'date-picker'],
  ['DialogFieldDateTimeControl', 'time-picker'],
  ['DialogFieldTagControl', 'tag-control'],
];

/** Open the editor for a new dialog. */
const openNewDialogEditor = () => {
  cy.toolbar('Configuration', TOOLBAR.add);
  cy.get('#dialog-label').should('be.visible');
};

/** Fill the visible tab/section modal's Label input and press its Save button. */
const saveModalWithLabel = (label) => {
  cy.get(MODAL).within(() => {
    cy.get('input[name="label"]').clear().type(label);
    cy.contains('button', 'Save').click();
  });
  cy.get(MODAL).should('not.exist');
};

describe('Service Dialogs — Field palette', () => {
  beforeEach(() => {
    cy.login();
    goToServiceDialogs();
    openNewDialogEditor();
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  FIELD_TYPES.forEach(([typeId, cssClass]) => {
    it(`dropping ${typeId} adds a .dynamic-field--${cssClass} to the section`, () => {
      cy.dropFieldIntoSection(typeId);
      cy.get(`.dynamic-field--${cssClass}`).should('have.length', 1);
    });
  });

  it('dropping several fields adds each of them in order', () => {
    cy.dropFieldIntoSection('DialogFieldTextBox');
    cy.dropFieldIntoSection('DialogFieldCheckBox');
    cy.get('.dynamic-section__body .dynamic-field').should('have.length', 2);
    cy.get('.dynamic-section__body .dynamic-field').first().should('have.class', 'dynamic-field--text-box');
    cy.get('.dynamic-section__body .dynamic-field').last().should('have.class', 'dynamic-field--check-box');
  });
});

describe('Service Dialogs — Field edit and delete', () => {
  beforeEach(() => {
    cy.login();
    goToServiceDialogs();
    openNewDialogEditor();
    cy.dropFieldIntoSection('DialogFieldTextBox');
    cy.get('.dynamic-field--text-box').should('exist');
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  it('Edit button opens the Edit Field modal with the field label', () => {
    cy.get('.dynamic-field-actions button').first().click({ force: true });
    cy.get(MODAL).should('be.visible').and('contain.text', 'Edit Field');
    cy.get(MODAL).find('input[name="label"]').should('not.have.value', '');
    cy.get(MODAL).find('input[name="name"]').should('not.have.value', '');
  });

  it('saving the Edit Field modal updates the field label on the canvas', () => {
    cy.get('.dynamic-field-actions button').first().click({ force: true });
    cy.get(MODAL).within(() => {
      cy.get('input[name="label"]').clear().type('Renamed Field');
      cy.contains('button', 'Save').click();
    });
    cy.get(MODAL).should('not.exist');
    cy.get('.dynamic-field--text-box').should('contain.text', 'Renamed Field');
  });

  it('clearing the required Label shows a validation error and keeps the modal open', () => {
    cy.get('.dynamic-field-actions button').first().click({ force: true });
    cy.get(MODAL).within(() => {
      cy.get('input[name="label"]').clear();
      cy.get('.edit-field-modal-notification').should('exist');
    });
    cy.get(MODAL).should('be.visible');
  });

  it('Cancel closes the Edit Field modal without changing the field', () => {
    cy.get('.dynamic-field--text-box').invoke('text').then((before) => {
      cy.get('.dynamic-field-actions button').first().click({ force: true });
      cy.get(MODAL).within(() => {
        cy.get('input[name="label"]').clear().type('Should Not Persist');
        cy.contains('button', 'Cancel').click();
      });
      cy.get(MODAL).should('not.exist');
      cy.get('.dynamic-field--text-box').invoke('text').should('eq', before);
    });
  });

  it('Remove button deletes the field from the section', () => {
    cy.get('.dynamic-field-actions button').last().click({ force: true });
    cy.get('.dynamic-field').should('not.exist');
  });
});

describe('Service Dialogs — Tab management', () => {
  beforeEach(() => {
    cy.login();
    goToServiceDialogs();
    openNewDialogEditor();
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  it('adds a tab through the Add tab modal and selects it', () => {
    cy.get('.service-dialog-form__add-tab-btn').click();
    cy.get(MODAL).should('contain.text', 'Add Tab');
    saveModalWithLabel('Second Tab');
    cy.get('[role="tab"]').should('have.length', 2);
    cy.contains('[role="tab"]', 'Second Tab').should('have.attr', 'aria-selected', 'true');
  });

  it('requires a label in the Add Tab modal', () => {
    cy.get('.service-dialog-form__add-tab-btn').click();
    cy.get(MODAL).within(() => {
      cy.get('input[name="label"]').clear().blur();
      cy.contains('button', 'Save').should('be.disabled');
    });
  });

  it('cancelling the Add Tab modal does not add a tab', () => {
    cy.get('.service-dialog-form__add-tab-btn').click();
    cy.get(MODAL).contains('button', 'Cancel').click();
    cy.get(MODAL).should('not.exist');
    cy.get('[role="tab"]').should('have.length', 1);
  });

  it('renames a tab via the overflow menu', () => {
    cy.get('[role="tab"]').first().find('.cds--overflow-menu').click();
    cy.contains('.cds--overflow-menu-options__btn', 'Edit').click();
    cy.get(MODAL).should('contain.text', 'Edit Tab');
    saveModalWithLabel('Renamed Tab');
    cy.contains('[role="tab"]', 'Renamed Tab').should('exist');
  });

  it('deletes a tab via the overflow menu', () => {
    cy.get('.service-dialog-form__add-tab-btn').click();
    saveModalWithLabel('Doomed Tab');
    cy.contains('[role="tab"]', 'Doomed Tab').find('.cds--overflow-menu').click();
    cy.contains('.cds--overflow-menu-options__btn', 'Delete').click();
    cy.contains('[role="tab"]', 'Doomed Tab').should('not.exist');
    cy.get('[role="tab"]').should('have.length', 1);
  });
});

describe('Service Dialogs — Section management', () => {
  beforeEach(() => {
    cy.login();
    goToServiceDialogs();
    openNewDialogEditor();
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  it('adds a section through the Add Section modal', () => {
    cy.get('.dynamic-section').its('length').then((before) => {
      cy.contains('button', 'Add Section').click();
      cy.get(MODAL).should('contain.text', 'Add Section');
      saveModalWithLabel('Extra Section');
      cy.get('.dynamic-section').should('have.length', before + 1);
      cy.contains('.dynamic-section__title', 'Extra Section').should('exist');
    });
  });

  it('renames a section with the Edit section button', () => {
    cy.get('.dynamic-section__actions button').first().click();
    cy.get(MODAL).should('contain.text', 'Edit Section');
    saveModalWithLabel('Renamed Section');
    cy.contains('.dynamic-section__title', 'Renamed Section').should('exist');
  });

  it('cancelling the Add Section modal does not add a section', () => {
    cy.get('.dynamic-section').its('length').then((before) => {
      cy.contains('button', 'Add Section').click();
      cy.get(MODAL).contains('button', 'Cancel').click();
      cy.get(MODAL).should('not.exist');
      cy.get('.dynamic-section').should('have.length', before);
    });
  });

  it('deletes a section with the Delete section button', () => {
    cy.contains('button', 'Add Section').click();
    saveModalWithLabel('Doomed Section');
    cy.contains('.dynamic-section__title', 'Doomed Section')
      .closest('.dynamic-section')
      .find('.dynamic-section__actions button')
      .last()
      .click();
    cy.contains('.dynamic-section__title', 'Doomed Section').should('not.exist');
  });
});

describe('Service Dialogs — Save guard', () => {
  beforeEach(() => {
    cy.login();
    goToServiceDialogs();
    openNewDialogEditor();
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  it('keeps Save disabled when only a label has been entered (section has no fields)', () => {
    cy.get('#dialog-label').type(TEST_LABEL);
    cy.contains('button', 'Save').should('be.disabled');
  });

  it('keeps Save disabled when a field exists but the dialog has no label', () => {
    cy.dropFieldIntoSection('DialogFieldTextBox');
    cy.get('.dynamic-field--text-box').should('exist');
    cy.contains('button', 'Save').should('be.disabled');
  });

  it('enables Save once the label, a tab, a section and a field are present', () => {
    cy.get('#dialog-label').type(TEST_LABEL);
    cy.dropFieldIntoSection('DialogFieldTextBox');
    cy.contains('button', 'Save').should('not.be.disabled');
  });

  it('disables Save again when the label is cleared', () => {
    cy.get('#dialog-label').type(TEST_LABEL);
    cy.dropFieldIntoSection('DialogFieldTextBox');
    cy.contains('button', 'Save').should('not.be.disabled');
    cy.get('#dialog-label').clear();
    cy.contains('button', 'Save').should('be.disabled');
  });

  it('disables Save again when the only field is removed', () => {
    cy.get('#dialog-label').type(TEST_LABEL);
    cy.dropFieldIntoSection('DialogFieldTextBox');
    cy.contains('button', 'Save').should('not.be.disabled');
    cy.get('.dynamic-field-actions button').last().click({ force: true });
    cy.contains('button', 'Save').should('be.disabled');
  });

  it('keeps Save disabled while another section on the tab has no fields', () => {
    cy.get('#dialog-label').type(TEST_LABEL);
    cy.dropFieldIntoSection('DialogFieldTextBox');
    cy.contains('button', 'Save').should('not.be.disabled');
    cy.contains('button', 'Add Section').click();
    saveModalWithLabel('Empty Section');
    cy.contains('button', 'Save').should('be.disabled');
  });
});

describe('Service Dialogs — Draft recovery', () => {
  const seedDraft = (draft) => cy.window().then((win) => {
    win.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  });

  const DRAFT = {
    label: 'Draft Label',
    description: 'Draft description',
    dialog_tabs: [{
      label: 'Draft Tab',
      description: '',
      position: 0,
      dialog_groups: [{
        label: 'Draft Section',
        description: '',
        position: 0,
        dialog_fields: [],
      }],
    }],
  };

  beforeEach(() => {
    cy.login();
    goToServiceDialogs();
    cy.window().then((win) => win.sessionStorage.removeItem(DRAFT_KEY));
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  it('does not prompt when there is no stored draft', () => {
    openNewDialogEditor();
    cy.contains('Restore previous changes?').should('not.exist');
  });

  it('autosaves a draft to sessionStorage after the label changes', () => {
    openNewDialogEditor();
    cy.get('#dialog-label').type('Autosaved');
    // the editor debounces draft writes by 500 ms
    cy.window()
      .should((win) => {
        expect(win.sessionStorage.getItem(DRAFT_KEY)).to.contain('Autosaved');
      });
  });

  it('prompts to restore a stored draft and applies it on Restore', () => {
    seedDraft(DRAFT);
    openNewDialogEditor();
    cy.contains('Restore previous changes?').should('be.visible');
    cy.contains('button', 'Restore').click();
    cy.contains('Restore previous changes?').should('not.exist');
    cy.get('#dialog-label').should('have.value', 'Draft Label');
    cy.get('#dialog-description').should('have.value', 'Draft description');
    cy.contains('[role="tab"]', 'Draft Tab').should('exist');
  });

  it('discards the stored draft on Discard and leaves a blank form', () => {
    seedDraft(DRAFT);
    openNewDialogEditor();
    cy.contains('button', 'Discard').click();
    cy.contains('Restore previous changes?').should('not.exist');
    cy.get('#dialog-label').should('have.value', '');
    cy.window().then((win) => {
      expect(win.sessionStorage.getItem(DRAFT_KEY)).to.equal(null);
    });
  });

  it('clears the stored draft when the editor is cancelled', () => {
    openNewDialogEditor();
    cy.get('#dialog-label').type('Will be cancelled');
    cy.window().should((win) => {
      expect(win.sessionStorage.getItem(DRAFT_KEY)).to.not.equal(null);
    });
    cy.contains('button', 'Cancel').click();
    cy.expect_flash(flashClassMap.warning, 'cancelled');
    cy.window().then((win) => {
      expect(win.sessionStorage.getItem(DRAFT_KEY)).to.equal(null);
    });
  });
});

describe('Service Dialogs — Edit loads existing structure', () => {
  beforeEach(() => {
    createStructuredDialog();
    cy.login();
    goToServiceDialogs();
    selectDialog(TEST_LABEL);
    cy.toolbar('Configuration', TOOLBAR.edit);
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  it('renders the stored tab, section and field and keeps Save enabled', () => {
    cy.get('#dialog-label').should('have.value', TEST_LABEL);
    cy.contains('[role="tab"]', 'Tab 1').should('exist');
    cy.contains('.dynamic-section__title', 'Section 1').should('exist');
    cy.get('.dynamic-field--text-box').should('have.length', 1);
    cy.contains('button', 'Save').should('not.be.disabled');
  });

  it('disables Save after clearing the label of a loaded dialog', () => {
    cy.get('#dialog-label').clear();
    cy.contains('button', 'Save').should('be.disabled');
  });

  it('can add another field to a loaded dialog and still save', () => {
    cy.dropFieldIntoSection('DialogFieldCheckBox');
    cy.get('.dynamic-section__body .dynamic-field').should('have.length', 2);

    cy.interceptApi({
      alias: 'editDialogWithNewField',
      method: 'POST',
      urlPattern: /\/api\/service_dialogs\/\d+/,
      triggerFn: () => cy.contains('button', 'Save').click(),
    });

    cy.expect_flash(flashClassMap.success, 'saved');
  });
});
