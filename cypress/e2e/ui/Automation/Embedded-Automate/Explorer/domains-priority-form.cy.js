import { flashClassMap } from '../../../../../support/assertions/assertion_constants';

// Toolbar options
const TOOLBAR_CONFIGURATION = 'Configuration';
const TOOLBAR_EDIT_PRIORITY = 'Edit Priority Order of Domains';

// Button labels
const SAVE_BUTTON_TEXT = 'Save';
const RESET_BUTTON_TEXT = 'Reset';
const CANCEL_BUTTON_TEXT = 'Cancel';

// Flash message text snippets
const FLASH_MESSAGE_SAVE_SUCCESS = 'saved';
const FLASH_MESSAGE_CANCELLED = 'cancel';

// Accordion labels
const DATA_STORE_ACCORDION_LABEL = 'Datastore';

describe('Automation > Embedded Automate > Explorer > Domains Priority Form', () => {
  beforeEach(() => {
    // Create test domains
    cy.appFactories([
      ['create', 'miq_ae_domain', { name: 'TestDomain1', priority: 10 }],
      ['create', 'miq_ae_domain', { name: 'TestDomain2', priority: 20 }],
      ['create', 'miq_ae_domain', { name: 'TestDomain3', priority: 30 }],
    ]);

    cy.login();
    cy.menu('Automation', 'Embedded Automate', 'Explorer');
    cy.expect_explorer_title('Datastore');
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  it('displays the domains priority form when clicking Edit Priority button', () => {
    cy.selectAccordionItem([DATA_STORE_ACCORDION_LABEL]);
    cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_EDIT_PRIORITY);

    // Verify the form is displayed
    cy.get('.domains-priority-form').should('be.visible');
    cy.contains('Domains:').should('be.visible');
    cy.contains('Drag and drop to reorder domains').should('be.visible');
  });

  it('displays all domains in the sortable list', () => {
    cy.selectAccordionItem([DATA_STORE_ACCORDION_LABEL]);
    cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_EDIT_PRIORITY);

    // Verify domains are displayed
    cy.get('.sortable-list').should('be.visible');
    cy.get('.sortable-list-item').should('have.length', 3);
    cy.contains('.sortable-list-item', 'TestDomain1').should('be.visible');
    cy.contains('.sortable-list-item', 'TestDomain2').should('be.visible');
    cy.contains('.sortable-list-item', 'TestDomain3').should('be.visible');
  });

  it('has Save, Reset, and Cancel buttons with correct initial state', () => {
    cy.selectAccordionItem([DATA_STORE_ACCORDION_LABEL]);
    cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_EDIT_PRIORITY);

    cy.getFormButtonByTypeWithText({ buttonText: SAVE_BUTTON_TEXT, buttonType: 'submit' })
      .should('be.visible')
      .and('be.disabled'); // Disabled until form is modified
    cy.getFormButtonByTypeWithText({ buttonText: RESET_BUTTON_TEXT })
      .should('be.visible')
      .and('be.disabled'); // Disabled until form is modified
    cy.getFormButtonByTypeWithText({ buttonText: CANCEL_BUTTON_TEXT })
      .should('be.visible')
      .and('be.enabled');
  });

  it('enables Reset button after changes and resets form to initial state', () => {
    cy.selectAccordionItem([DATA_STORE_ACCORDION_LABEL]);
    cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_EDIT_PRIORITY);

    // Verify initial order: TestDomain3, TestDomain2, TestDomain1
    cy.get('.sortable-list-item').eq(0).should('contain', 'TestDomain3');
    cy.get('.sortable-list-item').eq(1).should('contain', 'TestDomain2');
    cy.get('.sortable-list-item').eq(2).should('contain', 'TestDomain1');

    // Reset button should be disabled initially
    cy.getFormButtonByTypeWithText({ buttonText: RESET_BUTTON_TEXT })
      .should('be.disabled');

    // Reorder domains
    cy.get('.sortable-list-item').first().focus().type('{downarrow}');

    // Verify order changed
    cy.get('.sortable-list-item').eq(0).should('contain', 'TestDomain2');
    cy.get('.sortable-list-item').eq(1).should('contain', 'TestDomain3');

    // Reset button should now be enabled
    cy.getFormButtonByTypeWithText({ buttonText: RESET_BUTTON_TEXT })
      .should('be.enabled');

    // Click Reset
    cy.getFormButtonByTypeWithText({ buttonText: RESET_BUTTON_TEXT }).click();

    // Verify order is restored to initial
    cy.get('.sortable-list-item').eq(0).should('contain', 'TestDomain3');
    cy.get('.sortable-list-item').eq(1).should('contain', 'TestDomain2');
    cy.get('.sortable-list-item').eq(2).should('contain', 'TestDomain1');

    // Reset button should be disabled again
    cy.getFormButtonByTypeWithText({ buttonText: RESET_BUTTON_TEXT })
      .should('be.disabled');
  });

  it('allows reordering domains via keyboard navigation', () => {
    cy.selectAccordionItem([DATA_STORE_ACCORDION_LABEL]);
    cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_EDIT_PRIORITY);

    // Domains are displayed in reverse priority order (highest first)
    // So: TestDomain3 (30), TestDomain2 (20), TestDomain1 (10)
    cy.get('.sortable-list-item').should('have.length', 3);

    // Verify initial order
    cy.get('.sortable-list-item').eq(0).should('contain', 'TestDomain3');
    cy.get('.sortable-list-item').eq(1).should('contain', 'TestDomain2');
    cy.get('.sortable-list-item').eq(2).should('contain', 'TestDomain1');

    // Move first item (TestDomain3) down one position
    cy.get('.sortable-list-item').first().focus().type('{downarrow}');

    // Verify the order changed: TestDomain2 should now be first
    cy.get('.sortable-list-item').eq(0).should('contain', 'TestDomain2');
    cy.get('.sortable-list-item').eq(1).should('contain', 'TestDomain3');
    cy.get('.sortable-list-item').eq(2).should('contain', 'TestDomain1');

    // Verify Save button is now enabled
    cy.getFormButtonByTypeWithText({ buttonText: SAVE_BUTTON_TEXT, buttonType: 'submit' })
      .should('be.enabled');
  });

  it('saves the new priority order successfully', () => {
    cy.selectAccordionItem([DATA_STORE_ACCORDION_LABEL]);
    cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_EDIT_PRIORITY);

    // Reorder domains
    cy.get('.sortable-list-item').first().focus().type('{downarrow}');

    // Click Save
    cy.interceptApi({
      alias: 'savePriority',
      urlPattern: '/miq_ae_class/domains_priority_edit*',
      triggerFn: () =>
        cy.getFormButtonByTypeWithText({ buttonText: SAVE_BUTTON_TEXT, buttonType: 'submit' }).click(),
    });

    // Verify success message
    cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_SAVE_SUCCESS);
  });

  it('cancels without saving changes', () => {
    cy.selectAccordionItem([DATA_STORE_ACCORDION_LABEL]);
    cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_EDIT_PRIORITY);

    // Reorder domains
    cy.get('.sortable-list-item').first().focus().type('{downarrow}');

    // Click Cancel
    cy.getFormButtonByTypeWithText({ buttonText: CANCEL_BUTTON_TEXT }).click();

    // Verify cancel message
    cy.expect_flash(flashClassMap.warning, FLASH_MESSAGE_CANCELLED);
    cy.expect_explorer_title('Datastore');
  });

  it('handles disabled domains correctly', () => {
    // Create a disabled domain using enabled: false
    cy.appFactories([
      ['create', 'miq_ae_domain', { name: 'DisabledDomain', priority: 5, enabled: false }],
    ]);

    cy.reload();
    cy.selectAccordionItem([DATA_STORE_ACCORDION_LABEL]);
    cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_EDIT_PRIORITY);

    // Verify disabled domain appears in the list (no suffix in priority form)
    cy.contains('.sortable-list-item', 'DisabledDomain').should('be.visible');

    // Verify disabled domains can still be reordered
    cy.contains('.sortable-list-item', 'DisabledDomain')
      .should('have.attr', 'draggable', 'true');
  });

  it('handles API errors gracefully', () => {
    cy.selectAccordionItem([DATA_STORE_ACCORDION_LABEL]);
    cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_EDIT_PRIORITY);

    // Intercept with error response
    cy.intercept('POST', '/miq_ae_class/domains_priority_edit', {
      statusCode: 400,
      body: {
        error: {
          message: 'Error saving priority order',
        },
      },
    }).as('savePriorityError');

    // Reorder domains to enable Save button
    cy.get('.sortable-list-item').first().focus().type('{downarrow}');

    // Try to save
    cy.getFormButtonByTypeWithText({ buttonText: SAVE_BUTTON_TEXT, buttonType: 'submit' }).click();

    // Wait for the API call
    cy.wait('@savePriorityError');

    // Verify error message is displayed
    cy.expect_flash(flashClassMap.error, 'Error');
  });

  it('maintains domain order after save and reload', () => {
    cy.selectAccordionItem([DATA_STORE_ACCORDION_LABEL]);
    cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_EDIT_PRIORITY);

    // Initial order: TestDomain3, TestDomain2, TestDomain1
    cy.get('.sortable-list-item').eq(0).should('contain', 'TestDomain3');
    cy.get('.sortable-list-item').eq(1).should('contain', 'TestDomain2');

    // Move first domain (TestDomain3) down one position
    cy.get('.sortable-list-item').first().focus().type('{downarrow}');

    // New order should be: TestDomain2, TestDomain3, TestDomain1
    cy.get('.sortable-list-item').eq(0).should('contain', 'TestDomain2');
    cy.get('.sortable-list-item').eq(1).should('contain', 'TestDomain3');

    // Save
    cy.interceptApi({
      alias: 'savePriority',
      urlPattern: '/miq_ae_class/domains_priority_edit*',
      triggerFn: () =>
        cy.getFormButtonByTypeWithText({ buttonText: SAVE_BUTTON_TEXT, buttonType: 'submit' }).click(),
    });

    cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_SAVE_SUCCESS);

    // Reload the page
    cy.reload();
    cy.expect_explorer_title('Datastore');

    // Open the form again
    cy.selectAccordionItem([DATA_STORE_ACCORDION_LABEL]);
    cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_EDIT_PRIORITY);

    // Verify the new order is maintained: TestDomain2 should still be first
    cy.get('.sortable-list-item').eq(0).should('contain', 'TestDomain2');
    cy.get('.sortable-list-item').eq(1).should('contain', 'TestDomain3');
  });
});
