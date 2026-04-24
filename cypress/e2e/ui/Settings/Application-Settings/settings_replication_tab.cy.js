/* eslint-disable no-undef */
import { flashClassMap } from '../../../../support/assertions/assertion_constants';

// Menu options
const SETTINGS_MENU_OPTION = 'Settings';
const APP_SETTINGS_MENU_OPTION = 'Application Settings';

// Accordion items
const SETTINGS_ACCORDION_ITEM = 'Settings';
const MANAGEIQ_REGION_ACCORDION_ITEM = /^ManageIQ Region:/;

// Tab names
const REPLICATION_TAB = 'Replication';

// Field IDs and names
const REPLICATION_TYPE_SELECT_NAME = 'replication_type';
const DBNAME_INPUT_NAME = 'dbname';
const HOST_INPUT_NAME = 'host';
const USER_INPUT_NAME = 'user';
const PASSWORD_INPUT_NAME = 'password';
const PORT_INPUT_NAME = 'port';

// Field values
const REPLICATION_TYPE_NONE = 'none';
const REPLICATION_TYPE_GLOBAL = 'global';
const REPLICATION_TYPE_REMOTE = 'remote';
const TEST_DB_NAME = 'test_db';
const TEST_HOST = 'localhost';
const TEST_USER_1 = 'user1';
const TEST_USER_2 = 'user2';
const TEST_PASSWORD = '12345';
const TEST_PORT = '8888';

// Button text
const SAVE_BUTTON_TEXT = 'Save';
const RESET_BUTTON_TEXT = 'Reset';
const CANCEL_BUTTON_TEXT = 'Cancel';
const ADD_BUTTON_TEXT = 'Add';
const ADD_SUBSCRIPTION_BUTTON_TEXT = 'Add Subscription';
const UPDATE_BUTTON_TEXT = 'Update';
const VALIDATE_BUTTON_TEXT = 'Validate';
const DELETE_BUTTON_TEXT = 'Delete';

// Modal headings
const ADD_SUBSCRIPTION_MODAL_HEADING = 'Add Subscription';
const EDIT_SUBSCRIPTION_MODAL_HEADING_PREFIX = 'Edit';
const CONFIRM_DELETE_MODAL_HEADING = 'Confirm Delete';
const CONFIRM_EDIT_MODAL_HEADING = 'Confirm Edit';

// Flash message text snippets
const FLASH_MESSAGE_SAVE_INITIATED = 'save initiated';
const FLASH_MESSAGE_NO_REPLICATION_ROLE = 'No replication role has been set';
const FLASH_MESSAGE_REPLICATION_DISABLED = 'Replication will be disabled for this region';
const FLASH_MESSAGE_RESET = 'All changes have been reset';
const FLASH_MESSAGE_VALIDATION_FAILED = 'Validation failed';
const FLASH_MESSAGE_SUBSCRIPTIONS_REMOVED = 'Changing to remote replication role will remove all current subscriptions';

// CSS Selectors
const MODAL_SELECTOR = '.cds--modal';
const MODAL_HEADER_SELECTOR = '.cds--modal-header__heading';
const SUBSCRIPTIONS_TABLE_SELECTOR = '.subscriptions-table';
const MIQ_DATA_TABLE_BUTTON_SELECTOR = '.miq-data-table .miq-data-table-button';

const CONFIRM_OK_BUTTON_TEXT = 'Ok';
const CONFIRM_CANCEL_BUTTON_TEXT = 'Cancel';

function navigateToReplicationTab() {
  cy.login();
  cy.menu(SETTINGS_MENU_OPTION, APP_SETTINGS_MENU_OPTION);
  cy.accordion(SETTINGS_ACCORDION_ITEM);
  cy.selectAccordionItem([MANAGEIQ_REGION_ACCORDION_ITEM]);
  cy.expect_explorer_title('ManageIQ Region');
  cy.tabs({ tabLabel: REPLICATION_TAB });
}

function setupSavedSubscription(subscription) {
  cy.intercept('GET', '/ops/pglogical_subscriptions_form_fields/new', {
    statusCode: 200,
    body: {
      replication_type: 'global',
      subscriptions: [subscription],
    },
  }).as('getSubscriptions');

  navigateToReplicationTab();
  cy.wait('@getSubscriptions');
  cy.getFormSelectFieldById({ selectId: REPLICATION_TYPE_SELECT_NAME }).select(REPLICATION_TYPE_GLOBAL);
}

function handleConfirmationModal(heading, buttonText) {
  cy.get(MODAL_SELECTOR).should('be.visible');
  cy.contains(MODAL_HEADER_SELECTOR, heading).should('be.visible');
  
  cy.contains('button', buttonText).click({force: true});
}

function saveReplicationForm() {
  cy.interceptApi({
    alias: 'saveReplication',
    method: 'POST',
    urlPattern: /\/ops\/pglogical_save_subscriptions\/.*\?button=save/,
    triggerFn: () => cy.contains('button', SAVE_BUTTON_TEXT).click(),
  });
}

function addSubscription() {
  cy.getFormSelectFieldById({ selectId: REPLICATION_TYPE_SELECT_NAME }).select(REPLICATION_TYPE_GLOBAL, { force: true });
  
  cy.contains('button', ADD_SUBSCRIPTION_BUTTON_TEXT).should('be.visible');

  cy.contains('button', ADD_SUBSCRIPTION_BUTTON_TEXT).click();
  cy.get(MODAL_SELECTOR).should('be.visible');
  cy.get(MODAL_HEADER_SELECTOR).should('have.text', ADD_SUBSCRIPTION_MODAL_HEADING);

  cy.get('body').click(0, 0);
  cy.get(MODAL_SELECTOR).should('not.be.visible');

  cy.contains('button', ADD_SUBSCRIPTION_BUTTON_TEXT).click();
  cy.get(MODAL_SELECTOR).should('be.visible');

  cy.getFormInputFieldByIdAndType({ inputId: DBNAME_INPUT_NAME }).scrollIntoView().should('be.visible');
  cy.getFormInputFieldByIdAndType({ inputId: HOST_INPUT_NAME }).should('be.visible');
  cy.getFormInputFieldByIdAndType({ inputId: USER_INPUT_NAME }).should('be.visible');
  cy.getFormInputFieldByIdAndType({ inputId: PASSWORD_INPUT_NAME, inputType: 'password' }).should('be.visible');
  cy.getFormInputFieldByIdAndType({ inputId: PORT_INPUT_NAME }).should('be.visible');

  cy.contains(`${MODAL_SELECTOR} button`, ADD_BUTTON_TEXT).should('be.disabled');

  cy.getFormInputFieldByIdAndType({ inputId: DBNAME_INPUT_NAME })
    .clear({ force: true })
    .type(TEST_DB_NAME, { force: true, delay: 100 })
    .should('have.value', TEST_DB_NAME);
  cy.getFormInputFieldByIdAndType({ inputId: HOST_INPUT_NAME }).type(TEST_HOST);
  cy.getFormInputFieldByIdAndType({ inputId: USER_INPUT_NAME }).type(TEST_USER_1);
  cy.getFormInputFieldByIdAndType({ inputId: PASSWORD_INPUT_NAME, inputType: 'password' }).type(TEST_PASSWORD);
  cy.getFormInputFieldByIdAndType({ inputId: PORT_INPUT_NAME }).type(TEST_PORT);

  cy.contains(`${MODAL_SELECTOR} button`, ADD_BUTTON_TEXT).should('not.be.disabled').click();

  cy.get(SUBSCRIPTIONS_TABLE_SELECTOR).should('be.visible');
}

describe('Settings > Application Settings > Replication form operations', () => {
  beforeEach(() => {
    navigateToReplicationTab();
    cy.getFormSelectFieldById({ selectId: REPLICATION_TYPE_SELECT_NAME }).should('be.visible');
  });

  describe('Validate Replication Type Operations', () => {
    it('Validate replication type dropdown and options', () => {
    cy.getFormSelectFieldById({ selectId: REPLICATION_TYPE_SELECT_NAME }).should('exist').and('be.visible');

    cy.getFormSelectFieldById({ selectId: REPLICATION_TYPE_SELECT_NAME }).find('option').should('have.length', 3);
    cy.getFormSelectFieldById({ selectId: REPLICATION_TYPE_SELECT_NAME }).find(`option[value="${REPLICATION_TYPE_NONE}"]`).should('exist');
    cy.getFormSelectFieldById({ selectId: REPLICATION_TYPE_SELECT_NAME }).find(`option[value="${REPLICATION_TYPE_GLOBAL}"]`).should('exist');
    cy.getFormSelectFieldById({ selectId: REPLICATION_TYPE_SELECT_NAME }).find(`option[value="${REPLICATION_TYPE_REMOTE}"]`).should('exist');
  });

  it('Validate save remote type', () => {
    cy.getFormSelectFieldById({ selectId: REPLICATION_TYPE_SELECT_NAME }).select(REPLICATION_TYPE_REMOTE);

    saveReplicationForm();

    cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_SAVE_INITIATED);
  });

  it('Validate save none type', () => {
    cy.expect_flash(flashClassMap.warning, FLASH_MESSAGE_NO_REPLICATION_ROLE);

    cy.getFormSelectFieldById({ selectId: REPLICATION_TYPE_SELECT_NAME }).select(REPLICATION_TYPE_REMOTE);
    saveReplicationForm();

    cy.getFormSelectFieldById({ selectId: REPLICATION_TYPE_SELECT_NAME }).select(REPLICATION_TYPE_NONE);

    cy.expect_flash(flashClassMap.warning, FLASH_MESSAGE_REPLICATION_DISABLED);

    saveReplicationForm();

    cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_SAVE_INITIATED);
  });

  it('Validate reset functionality', () => {
    cy.getFormSelectFieldById({ selectId: REPLICATION_TYPE_SELECT_NAME }).select(REPLICATION_TYPE_REMOTE);
    cy.contains('button', RESET_BUTTON_TEXT).click();

    cy.expect_flash(flashClassMap.warning, FLASH_MESSAGE_RESET);
    });
  });

  describe('Validate Subscription CRUD Operations', () => {
    afterEach(() => {
      cy.appDbState('restore');
    });

    it('Validate create subscription for global type', () => {
    addSubscription();

    cy.get(SUBSCRIPTIONS_TABLE_SELECTOR)
      .find('table')
      .find('tbody')
      .find('tr')
      .should('have.length', 1);
  });

  it('Update newly added subscription', () => {
    addSubscription();

    cy.contains(MIQ_DATA_TABLE_BUTTON_SELECTOR, UPDATE_BUTTON_TEXT)
      .should('be.visible')
      .click();

    cy.get(MODAL_SELECTOR).should('be.visible');
    cy.get(MODAL_HEADER_SELECTOR).should('have.text', `${EDIT_SUBSCRIPTION_MODAL_HEADING_PREFIX} ${TEST_DB_NAME}`);

    cy.getFormInputFieldByIdAndType({ inputId: USER_INPUT_NAME })
      .clear({ force: true })
      .type(TEST_USER_2, { force: true, delay: 100 })
      .should('have.value', TEST_USER_2);

    cy.contains(`${MODAL_SELECTOR} button`, UPDATE_BUTTON_TEXT)
      .should('be.visible')
      .click();

    cy.get(SUBSCRIPTIONS_TABLE_SELECTOR)
      .find('table')
      .find('tbody')
      .find('tr')
      .find('td')
      .eq(2)
      .should('have.text', TEST_USER_2);
  });

  it('Update a saved subscription', () => {
    const MOCK_SAVED_SUBSCRIPTION = {
      id: 888,
      dbname: 'test_db',
      host: 'localhost',
      user: 'testuser',
      password: 'testpass',
      port: 5432,
    };

    setupSavedSubscription(MOCK_SAVED_SUBSCRIPTION);

    // Click update button - should show confirmation modal
    cy.contains(MIQ_DATA_TABLE_BUTTON_SELECTOR, UPDATE_BUTTON_TEXT)
      .should('be.visible')
      .click();

    cy.contains('An updated subscription must point to the same database').should('be.visible');
    handleConfirmationModal(CONFIRM_EDIT_MODAL_HEADING, CONFIRM_OK_BUTTON_TEXT);

    cy.contains(MODAL_HEADER_SELECTOR, CONFIRM_EDIT_MODAL_HEADING).should('not.exist');
    cy.contains(MODAL_HEADER_SELECTOR, `${EDIT_SUBSCRIPTION_MODAL_HEADING_PREFIX} ${MOCK_SAVED_SUBSCRIPTION.dbname}`).should('be.visible');

    cy.getFormInputFieldByIdAndType({ inputId: USER_INPUT_NAME })
      .clear({ force: true })
      .type(TEST_USER_2, { force: true, delay: 100 })
      .should('have.value', TEST_USER_2);

    cy.contains(`${MODAL_SELECTOR} button`, UPDATE_BUTTON_TEXT).click();

    cy.get(SUBSCRIPTIONS_TABLE_SELECTOR)
      .find('table')
      .find('tbody')
      .find('tr')
      .find('td')
      .eq(2)
      .should('have.text', TEST_USER_2);
  });

  it('Cancel editing a saved subscription', () => {
    const MOCK_SAVED_SUBSCRIPTION = {
      id: 777,
      dbname: 'cancel_test_db',
      host: 'localhost',
      user: 'canceluser',
      password: 'cancelpass',
      port: 5432,
    };

    setupSavedSubscription(MOCK_SAVED_SUBSCRIPTION);

    cy.contains(MIQ_DATA_TABLE_BUTTON_SELECTOR, UPDATE_BUTTON_TEXT)
      .should('be.visible')
      .click();

    handleConfirmationModal(CONFIRM_EDIT_MODAL_HEADING, CONFIRM_CANCEL_BUTTON_TEXT);

    cy.get(SUBSCRIPTIONS_TABLE_SELECTOR)
      .find('tbody tr')
      .should('have.length', 1)
      .within(() => {
        cy.contains(MOCK_SAVED_SUBSCRIPTION.dbname).should('exist');
      });
  });

  it('Validate subscription validation', () => {
    addSubscription();

    cy.interceptApi({
      alias: 'validateSubscriptionApi',
      method: 'POST',
      urlPattern: /\/ops\/pglogical_validate_subscription/,
      triggerFn: () => cy.contains(MIQ_DATA_TABLE_BUTTON_SELECTOR, VALIDATE_BUTTON_TEXT)
        .should('be.visible')
        .click(),
    });

    cy.expect_flash(flashClassMap.error, FLASH_MESSAGE_VALIDATION_FAILED);
  });

  it('Validate save subscriptions to database', () => {
    addSubscription();

    saveReplicationForm();

    cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_SAVE_INITIATED);
  });

  it('Validate delete subscription from UI', () => {
    addSubscription();

    cy.contains(MIQ_DATA_TABLE_BUTTON_SELECTOR, DELETE_BUTTON_TEXT)
      .scrollIntoView()
      .should('be.visible')
      .click();

    cy.get(SUBSCRIPTIONS_TABLE_SELECTOR)
      .find('table')
      .find('tbody')
      .find('tr')
      .should('have.length', 0);
    });
  });

  describe('Validate Replication Type Switching', () => {
    afterEach(() => {
      cy.appDbState('restore');
    });

    it('Validate subscriptions removed when switching replication type', () => {
    addSubscription();

    cy.get(SUBSCRIPTIONS_TABLE_SELECTOR)
      .find('table')
      .find('tbody')
      .find('tr')
      .should('have.length', 1);

    saveReplicationForm();

    cy.getFormSelectFieldById({ selectId: REPLICATION_TYPE_SELECT_NAME }).select(REPLICATION_TYPE_REMOTE);

    cy.expect_flash(flashClassMap.warning, FLASH_MESSAGE_SUBSCRIPTIONS_REMOVED);

    saveReplicationForm();

    cy.getFormSelectFieldById({ selectId: REPLICATION_TYPE_SELECT_NAME }).select(REPLICATION_TYPE_GLOBAL);

    cy.get(SUBSCRIPTIONS_TABLE_SELECTOR)
      .find('table')
      .find('tbody')
      .find('tr')
      .should('have.length', 0);
    });
  });

  describe('Validate Modal Interactions', () => {
    it('Validate reset fields in subscription modal', () => {
    addSubscription();

    cy.contains('button', ADD_SUBSCRIPTION_BUTTON_TEXT).click();
    cy.get(MODAL_SELECTOR).should('be.visible');

    cy.getFormInputFieldByIdAndType({ inputId: DBNAME_INPUT_NAME }).type('test_reset');

    cy.contains(`${MODAL_SELECTOR} button`, RESET_BUTTON_TEXT)
      .should('be.visible')
      .click();

    cy.getFormInputFieldByIdAndType({ inputId: DBNAME_INPUT_NAME }).should('have.value', '');
    cy.getFormInputFieldByIdAndType({ inputId: HOST_INPUT_NAME }).should('have.value', '');

    cy.expect_flash(flashClassMap.warning, FLASH_MESSAGE_RESET);
    });

    it('Validate modal closes when cancel button clicked', () => {
      cy.getFormSelectFieldById({ selectId: REPLICATION_TYPE_SELECT_NAME }).select(REPLICATION_TYPE_GLOBAL);
      cy.contains('button', ADD_SUBSCRIPTION_BUTTON_TEXT).click();
      cy.get(MODAL_SELECTOR).should('be.visible');

      cy.contains(`${MODAL_SELECTOR} button`, CANCEL_BUTTON_TEXT).click();
      cy.get(MODAL_SELECTOR).should('not.be.visible');
    });
  });

  describe('Validate Deletion of Existing Subscriptions', () => {
    const CANCEL_DELETE_BUTTON_TEXT = 'Cancel Delete';
    const DISABLED_ROW_SELECTOR = '.disabled-row';
    
    const MOCK_SUBSCRIPTION = {
      id: 999,
      dbname: 'test_database',
      host: 'localhost',
      user: 'testuser',
      password: 'testpass',
      port: 5432,
    };

    const setupAndNavigate = () => {
      cy.intercept('GET', '/ops/pglogical_subscriptions_form_fields/new', {
        statusCode: 200,
        body: {
          replication_type: 'global',
          subscriptions: [MOCK_SUBSCRIPTION],
        },
      }).as('getSubscriptions');

      cy.login();
      cy.menu(SETTINGS_MENU_OPTION, APP_SETTINGS_MENU_OPTION);
      cy.accordion(SETTINGS_ACCORDION_ITEM);
      cy.selectAccordionItem([MANAGEIQ_REGION_ACCORDION_ITEM]);
      cy.expect_explorer_title('ManageIQ Region');
      cy.tabs({ tabLabel: REPLICATION_TAB });

      cy.wait('@getSubscriptions');
      cy.getFormSelectFieldById({ selectId: REPLICATION_TYPE_SELECT_NAME }).select(REPLICATION_TYPE_GLOBAL);
    };

    afterEach(() => {
      cy.appDbState('restore');
    });

    it('Undo subscription deletion', () => {
      setupAndNavigate();

      cy.contains('test_database').should('be.visible');

      // Click delete button - should show confirmation modal
      cy.contains(MIQ_DATA_TABLE_BUTTON_SELECTOR, DELETE_BUTTON_TEXT)
        .scrollIntoView()
        .click();

      cy.get(MODAL_SELECTOR).should('be.visible');
      cy.contains(MODAL_HEADER_SELECTOR, CONFIRM_DELETE_MODAL_HEADING).should('be.visible');
      cy.contains('Deleting a subscription will remove all replicated data').should('be.visible');

      cy.contains('button', CONFIRM_OK_BUTTON_TEXT).click();

      cy.contains(MODAL_HEADER_SELECTOR, CONFIRM_DELETE_MODAL_HEADING).should('not.exist');

      cy.contains('button', CANCEL_DELETE_BUTTON_TEXT).scrollIntoView().should('be.visible');
      cy.get(DISABLED_ROW_SELECTOR).should('exist');

      cy.contains('button', CANCEL_DELETE_BUTTON_TEXT).scrollIntoView().click();

      cy.get(DISABLED_ROW_SELECTOR).should('not.exist');
      cy.get(SUBSCRIPTIONS_TABLE_SELECTOR)
        .find('tbody tr')
        .should('have.length', 1)
        .within(() => {
          cy.contains('test_database').should('exist');
          cy.contains(DELETE_BUTTON_TEXT).should('exist');
        });
    });

    it('Validate error message and ensure successful save with multiple subscriptions', () => {
      setupAndNavigate();

      cy.contains(MIQ_DATA_TABLE_BUTTON_SELECTOR, DELETE_BUTTON_TEXT)
        .scrollIntoView()
        .click();

      cy.get(MODAL_SELECTOR).should('be.visible');
      cy.contains(MODAL_HEADER_SELECTOR, CONFIRM_DELETE_MODAL_HEADING).should('be.visible');
      cy.contains('button', CONFIRM_OK_BUTTON_TEXT).click();

      cy.contains(MODAL_HEADER_SELECTOR, CONFIRM_DELETE_MODAL_HEADING).should('not.exist');

      cy.get(DISABLED_ROW_SELECTOR).should('exist');

      // Try to save after deleting all subscriptions - an error should be displayed
      cy.contains('button', SAVE_BUTTON_TEXT).click();
      cy.expect_flash(flashClassMap.error, 'At least 1 subscription must be added to save server replication type');

      cy.contains('button', ADD_SUBSCRIPTION_BUTTON_TEXT).click();
      cy.get(MODAL_SELECTOR).should('be.visible');

      cy.getFormInputFieldByIdAndType({ inputId: DBNAME_INPUT_NAME })
        .clear({ force: true })
        .type('new_database', { force: true, delay: 100 });
      cy.getFormInputFieldByIdAndType({ inputId: HOST_INPUT_NAME }).type('newhost');
      cy.getFormInputFieldByIdAndType({ inputId: USER_INPUT_NAME }).type('newuser');
      cy.getFormInputFieldByIdAndType({ inputId: PASSWORD_INPUT_NAME, inputType: 'password' }).type('newpass');
      cy.getFormInputFieldByIdAndType({ inputId: PORT_INPUT_NAME }).type('5434');

      cy.contains(`${MODAL_SELECTOR} button`, ADD_BUTTON_TEXT).click();

      // Verify both subscriptions exist: one marked for deletion, one active
      cy.get(SUBSCRIPTIONS_TABLE_SELECTOR).find('tbody tr').should('have.length', 2);
      cy.get(DISABLED_ROW_SELECTOR).should('have.length', 1);
      cy.contains('new_database').should('be.visible');

      cy.intercept('POST', '/ops/pglogical_save_subscriptions/new?button=save', {
        statusCode: 200,
        body: { message: 'Replication settings save initiated' },
      }).as('saveSubscriptions');

      cy.contains('button', SAVE_BUTTON_TEXT).click();

      cy.wait('@saveSubscriptions').its('request.body').should((body) => {
        expect(body.subscriptions).to.exist;
        expect(body.subscriptions['0']).to.have.property('remove', true);
        expect(body.subscriptions['1']).to.not.have.property('remove');
        expect(body.subscriptions['1'].dbname).to.equal('new_database');
      });

      cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_SAVE_INITIATED);
    });
  });
});
