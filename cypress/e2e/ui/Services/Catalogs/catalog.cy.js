/* eslint-disable no-undef */
import { flashClassMap } from '../../../../support/assertions/assertion_constants';
import {
  LABEL_CONFIG_KEYS,
  FIELD_CONFIG_KEYS,
  BUTTON_CONFIG_KEYS,
  DUAL_LIST_ACTION_TYPE,
} from '../../../../support/commands/constants/command_constants.js';

// Menu options
const SERVICES_MENU_OPTION = 'Services';
const CATALOGS_MENU_OPTION = 'Catalogs';

// Field labels
const FORM_HEADER = 'Catalog';
const NAME_FIELD_LABEL = 'Name';
const DESCRIPTION_FIELD_LABEL = 'Description';
const CATALOG_ITEMS_HEADER = 'Catalog Items';
const DUAL_LIST_AVAILABLE_ITEMS_HEADER = 'Unassigned';
const DUAL_LIST_SELECTED_ITEMS_HEADER = 'Selected';

// Field values
const CATALOG_ITEM_NAME_1 = 'Test-Catalog-Item-1';
const CATALOG_ITEM_NAME_2 = 'Test-Catalog-Item-2';
const TEST_CATALOG_NAME = 'Test-Catalog';
const TEST_DESCRIPTION = 'Test-Description';

// Config options
const CONFIG_TOOLBAR_BUTTON = 'Configuration';
const ADD_CATALOG_ITEM_CONFIG_OPTION = 'Add a New Catalog Item';
const ADD_CATALOG_CONFIG_OPTION = 'Add a New Catalog';
const EDIT_CATALOG_CONFIG_OPTION = 'Edit this Item';
const REMOVE_CATALOG_CONFIG_OPTION = 'Remove Catalog';

// Buttons
const ADD_BUTTON_TEXT = 'Add';
const SAVE_BUTTON_TEXT = 'Save';
const CANCEL_BUTTON_TEXT = 'Cancel';
const RESET_BUTTON_TEXT = 'Reset';

// Flash message text snippets
const FLASH_MESSAGE_ADDED = 'added';
const FLASH_MESSAGE_SAVED = 'saved';
const FLASH_MESSAGE_CANCELLED = 'cancelled';
const FLASH_MESSAGE_DELETED = 'delete';
const FLASH_MESSAGE_RESET = 'reset';

// Browser alert text snippets
const BROWSER_ALERT_REMOVE_CONFIRM_TEXT = 'removed';

// Accordion items
const CATALOGS_ACCORDION_ITEM = 'Catalogs';
const CATALOG_ITEMS_ACCORDION_ITEM = 'Catalog Items';
const ALL_CATALOGS_ACCORDION_ITEM = 'All Catalogs';
const ALL_CATALOG_ITEMS_ACCORDION_ITEM = 'All Catalog Items';
const UNASSIGNED_ACCORDION_ITEM = 'Unassigned';

function addCatalogItem(catalogItemName) {
  cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_CATALOG_ITEM_CONFIG_OPTION);
  cy.contains('button[data-id="st_prov_type"]', 'Choose').click();
  cy.contains('.form-group ul.dropdown-menu li a', 'Generic').click();
  cy.get('input#name').type(catalogItemName);
  cy.contains('#form_buttons_div button', ADD_BUTTON_TEXT).click();
  cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_ADDED);
}

function validateElements({ isEditForm }) {
  cy.expect_explorer_title(FORM_HEADER);
  // Validate form labels
  cy.validateFormLabels([
    {
      [LABEL_CONFIG_KEYS.FOR_VALUE]: 'name',
      [LABEL_CONFIG_KEYS.EXPECTED_TEXT]: NAME_FIELD_LABEL,
    },
    {
      [LABEL_CONFIG_KEYS.FOR_VALUE]: 'description',
      [LABEL_CONFIG_KEYS.EXPECTED_TEXT]: DESCRIPTION_FIELD_LABEL,
    },
  ]);
  // Validate form fields
  cy.validateFormFields([
    {
      [FIELD_CONFIG_KEYS.ID]: 'name',
    },
    {
      [FIELD_CONFIG_KEYS.ID]: 'description',
    },
  ]);
  // Validate form footer buttons
  cy.validateFormFooterButtons([
    {
      [BUTTON_CONFIG_KEYS.BUTTON_TEXT]: isEditForm
        ? SAVE_BUTTON_TEXT
        : ADD_BUTTON_TEXT,
      [BUTTON_CONFIG_KEYS.BUTTON_TYPE]: 'submit',
      [BUTTON_CONFIG_KEYS.SHOULD_BE_DISABLED]: true,
    },
    {
      [BUTTON_CONFIG_KEYS.BUTTON_TEXT]: CANCEL_BUTTON_TEXT,
    },
    ...(isEditForm
      ? [
          {
            [BUTTON_CONFIG_KEYS.BUTTON_TEXT]: RESET_BUTTON_TEXT,
            [BUTTON_CONFIG_KEYS.SHOULD_BE_DISABLED]: true,
          },
        ]
      : []),
  ]);
  cy.getFormLegendByText({ legendText: CATALOG_ITEMS_HEADER });
  if (isEditForm) {
    cy.expect_dual_list({
      availableItemsHeaderText: DUAL_LIST_AVAILABLE_ITEMS_HEADER,
      selectedItemsHeaderText: DUAL_LIST_SELECTED_ITEMS_HEADER,
      // Test-Catalog-Item-1 is added while creating the catalog item so it will be on the right side
      selectedItems: [CATALOG_ITEM_NAME_1],
    });
  } else {
    cy.expect_dual_list({
      availableItemsHeaderText: DUAL_LIST_AVAILABLE_ITEMS_HEADER,
      selectedItemsHeaderText: DUAL_LIST_SELECTED_ITEMS_HEADER,
      availableItems: [CATALOG_ITEM_NAME_1, CATALOG_ITEM_NAME_2],
    });
  }
}

describe('Automate Catalog form operations: Services > Catalogs > Catalogs > Configuration > Add a New Catalog', () => {
  beforeEach(() => {
    cy.login();
    cy.menu(SERVICES_MENU_OPTION, CATALOGS_MENU_OPTION);

    // TODO: replace with better data setup approach
    // Adding 2 catalog items first before validating Catalog form
    cy.accordion(CATALOG_ITEMS_ACCORDION_ITEM);
    cy.selectAccordionItem([
      ALL_CATALOG_ITEMS_ACCORDION_ITEM,
      UNASSIGNED_ACCORDION_ITEM,
    ]);
    addCatalogItem(CATALOG_ITEM_NAME_1);
    addCatalogItem(CATALOG_ITEM_NAME_2);

    cy.accordion(CATALOGS_ACCORDION_ITEM);
    cy.selectAccordionItem([ALL_CATALOGS_ACCORDION_ITEM]);
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  describe('Validate add form fields and verify add, edit, and delete operations', () => {
    beforeEach(() => {
      cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_CATALOG_CONFIG_OPTION);
    });

    it('Verify visibility of elements and validate cancel button', () => {
      // Validate elements
      validateElements({ isEditForm: false });
      // Cancel
      cy.getFormFooterButtonByTypeWithText({
        buttonText: CANCEL_BUTTON_TEXT,
      }).click();
      cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_CANCELLED);
    });

    it('Verify add, edit & delete catalog', () => {
      // Add
      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type(
        TEST_CATALOG_NAME
      );
      cy.getFormInputFieldByIdAndType({ inputId: 'description' }).type(
        TEST_DESCRIPTION
      );
      cy.dualListAction({
        actionType: DUAL_LIST_ACTION_TYPE.ADD,
        optionsToSelect: [CATALOG_ITEM_NAME_1],
      });
      cy.getFormFooterButtonByTypeWithText({
        buttonText: ADD_BUTTON_TEXT,
        buttonType: 'submit',
      }).click();
      cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_SAVED);
      // Edit
      cy.selectAccordionItem([ALL_CATALOGS_ACCORDION_ITEM, TEST_CATALOG_NAME]);
      cy.toolbar(CONFIG_TOOLBAR_BUTTON, EDIT_CATALOG_CONFIG_OPTION);
      cy.getFormInputFieldByIdAndType({ inputId: 'description' }).type(
        '-Updated'
      );
      cy.getFormFooterButtonByTypeWithText({
        buttonText: SAVE_BUTTON_TEXT,
        buttonType: 'submit',
      }).click();
      cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_SAVED);
      // Delete
      cy.selectAccordionItem([ALL_CATALOGS_ACCORDION_ITEM, TEST_CATALOG_NAME]);
      cy.expect_browser_confirm_with_text({
        confirmTriggerFn: () =>
          cy.toolbar(CONFIG_TOOLBAR_BUTTON, REMOVE_CATALOG_CONFIG_OPTION),
        containsText: BROWSER_ALERT_REMOVE_CONFIRM_TEXT,
      });
      cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_DELETED);
    });
  });

  describe('Validate edit form fields and catalog name uniqueness', () => {
    beforeEach(() => {
      cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_CATALOG_CONFIG_OPTION);
      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type(
        TEST_CATALOG_NAME
      );
      cy.getFormInputFieldByIdAndType({ inputId: 'description' }).type(
        TEST_DESCRIPTION
      );
      cy.dualListAction({
        actionType: DUAL_LIST_ACTION_TYPE.ADD,
        optionsToSelect: [CATALOG_ITEM_NAME_1],
      });
      cy.getFormFooterButtonByTypeWithText({
        buttonText: ADD_BUTTON_TEXT,
        buttonType: 'submit',
      }).click();
      cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_SAVED);
    });

    it('Verify visibility of elements and validate reset & cancel buttons', () => {
      // Validate elements
      cy.selectAccordionItem([ALL_CATALOGS_ACCORDION_ITEM, TEST_CATALOG_NAME]);
      cy.toolbar(CONFIG_TOOLBAR_BUTTON, EDIT_CATALOG_CONFIG_OPTION);
      validateElements({ isEditForm: true });
      // Reset
      cy.getFormInputFieldByIdAndType({ inputId: 'description' }).type(
        '-Updated'
      );
      cy.getFormFooterButtonByTypeWithText({
        buttonText: RESET_BUTTON_TEXT,
      }).click();
      cy.expect_flash(flashClassMap.warning, FLASH_MESSAGE_RESET);
      cy.getFormInputFieldByIdAndType({ inputId: 'description' }).should(
        'have.value',
        TEST_DESCRIPTION
      );
      // Cancel
      cy.getFormFooterButtonByTypeWithText({
        buttonText: CANCEL_BUTTON_TEXT,
      }).click();
      cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_CANCELLED);
    });

    it('Catalog name uniqueness validation', () => {
      cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_CATALOG_CONFIG_OPTION);
      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type(
        TEST_CATALOG_NAME
      );
      cy.expect_inline_field_errors({ containsText: 'taken' });
    });
  });
});
