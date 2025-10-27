/* eslint-disable no-undef */
import { flashClassMap } from '../../../../support/assertions/assertion_constants';
import {
  LABEL_CONFIG_KEYS,
  FIELD_CONFIG_KEYS,
  BUTTON_CONFIG_KEYS,
} from '../../../../support/commands/constants/command_constants';

// Component route url
const COMPONENT_ROUTE_URL = '/catalog/explorer';

// Menu options
const SERVICES_MENU_OPTION = 'Services';
const CATALOGS_MENU_OPTION = 'Catalogs';

// Accordion items
const CATALOG_ITEMS_ACCORDION_ITEM = 'Catalog Items';
const ALL_CATALOG_ITEMS_ACCORDION_ITEM = 'All Catalog Items';
const UNASSIGNED_ACCORDION_ITEM = 'Unassigned';

// Config options
const CONFIG_TOOLBAR_BUTTON = 'Configuration';
const ADD_CATALOG_ITEM_CONFIG_OPTION = 'Add a New Catalog Item';
const COPY_CONFIG_OPTION = 'Copy Selected Item';
const DELETE_CATALOG_ITEMS_CONFIG_OPTION = 'Delete Catalog Items';

// Field labels
const FORM_HEADER = 'Catalog';
const NAME_FIELD_LABEL = 'Name';
const COPY_TAGS_FIELD_LABEL = 'Copy Tags';
const REMOVE_CATALOG_MODAL_HEADER_TEXT = 'Delete';

// Field values
const CATALOG_ITEM_NAME = 'Test-Catalog-Item';
const COPIED_CATALOG_ITEM_NAME = `Copy of ${CATALOG_ITEM_NAME}`;

// Flash message text snippets
const FLASH_MESSAGE_INFO_TEXT = 'will not be displayed';
const FLASH_MESSAGE_ADDED = 'added';
const FLASH_MESSAGE_CANCELLED = 'cancelled';
const FLASH_MESSAGE_SAVED = 'saved';

// Buttons
const ADD_BUTTON_TEXT = 'Add';
const CANCEL_BUTTON_TEXT = 'Cancel';
const DELETE_BUTTON_TEXT = 'Delete';

function cleanUp(catalogItemToDelete) {
  cy.url()
    .then((url) => {
      // Ensures navigation to Services -> Catalogs in the UI
      if (!url.endsWith(COMPONENT_ROUTE_URL)) {
        cy.visit(COMPONENT_ROUTE_URL);
      }
      cy.accordion(CATALOG_ITEMS_ACCORDION_ITEM);
    })
    .then(() => {
      cy.selectAccordionItem([
        ALL_CATALOG_ITEMS_ACCORDION_ITEM,
        UNASSIGNED_ACCORDION_ITEM,
      ]);
      cy.selectTableRowsByText({
        textArray: [catalogItemToDelete],
      });
      cy.toolbar(CONFIG_TOOLBAR_BUTTON, DELETE_CATALOG_ITEMS_CONFIG_OPTION);
      cy.expect_modal({
        modalHeaderText: REMOVE_CATALOG_MODAL_HEADER_TEXT,
        modalContentExpectedTexts: ['delete', catalogItemToDelete],
        targetFooterButtonText: DELETE_BUTTON_TEXT,
      });
    });
}

describe('Automate Catalog form operations: Services > Catalogs > Catalogs > Configuration > Add a New Catalog', () => {
  beforeEach(() => {
    cy.login();
    cy.menu(SERVICES_MENU_OPTION, CATALOGS_MENU_OPTION);

    // TODO: replace with better data setup approach
    // Adding a catalog item
    cy.accordion(CATALOG_ITEMS_ACCORDION_ITEM);
    cy.selectAccordionItem([
      ALL_CATALOG_ITEMS_ACCORDION_ITEM,
      UNASSIGNED_ACCORDION_ITEM,
    ]);
    cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_CATALOG_ITEM_CONFIG_OPTION);
    cy.contains('button[data-id="st_prov_type"]', 'Choose').click();
    cy.contains('.form-group ul.dropdown-menu li a', 'Generic').click();
    cy.get('input#name').type(CATALOG_ITEM_NAME);
    cy.contains('#form_buttons_div button', ADD_BUTTON_TEXT).click();
    cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_ADDED);

    cy.selectAccordionItem([
      ALL_CATALOG_ITEMS_ACCORDION_ITEM,
      UNASSIGNED_ACCORDION_ITEM,
      CATALOG_ITEM_NAME,
    ]);
    cy.toolbar(CONFIG_TOOLBAR_BUTTON, COPY_CONFIG_OPTION);
  });

  describe('Verify form elements, validate cancel button and validate name related error messages', () => {
    it('Verify form elements and validate cancel button', () => {
      // Verifying elements
      cy.expect_explorer_title(FORM_HEADER);
      cy.expect_flash(flashClassMap.info, FLASH_MESSAGE_INFO_TEXT);
      cy.validateFormLabels([
        {
          [LABEL_CONFIG_KEYS.FOR_VALUE]: 'name',
          [LABEL_CONFIG_KEYS.EXPECTED_TEXT]: NAME_FIELD_LABEL,
        },
        {
          [LABEL_CONFIG_KEYS.FOR_VALUE]: 'copy_tags',
          [LABEL_CONFIG_KEYS.EXPECTED_TEXT]: COPY_TAGS_FIELD_LABEL,
        },
      ]);
      cy.validateFormFields([
        {
          [FIELD_CONFIG_KEYS.ID]: 'name',
          [FIELD_CONFIG_KEYS.EXPECTED_VALUE]: COPIED_CATALOG_ITEM_NAME,
        },
        {
          [FIELD_CONFIG_KEYS.ID]: 'copy_tags',
          [FIELD_CONFIG_KEYS.INPUT_FIELD_TYPE]: 'checkbox',
        },
      ]);
      cy.validateFormFooterButtons([
        {
          [BUTTON_CONFIG_KEYS.BUTTON_TEXT]: ADD_BUTTON_TEXT,
          [BUTTON_CONFIG_KEYS.BUTTON_TYPE]: 'submit',
        },
        {
          [BUTTON_CONFIG_KEYS.BUTTON_TEXT]: CANCEL_BUTTON_TEXT,
        },
      ]);
      // Cancel
      cy.getFormFooterButtonByTypeWithText({
        buttonText: CANCEL_BUTTON_TEXT,
      }).click();
      cy.expect_flash(flashClassMap.warning, FLASH_MESSAGE_CANCELLED);
    });

    it('Validate error messages for blank or already-used names', () => {
      // Blank name
      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).clear();
      cy.expect_inline_field_errors({ containsText: 'blank' });
      // Duplicate name
      cy.getFormInputFieldByIdAndType({ inputId: 'name' })
        .clear()
        .type(CATALOG_ITEM_NAME);
      cy.expect_inline_field_errors({ containsText: 'taken' });
    });
  });

  describe('Validate copy functionality', () => {
    it('Verify add operation from copy catalog form', () => {
      cy.getFormLabelByForAttribute({
        forValue: 'copy_tags',
      }).click();
      cy.getFormFooterButtonByTypeWithText({
        buttonText: ADD_BUTTON_TEXT,
        buttonType: 'submit',
      }).click();
      cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_SAVED);
    });

    afterEach(() => {
      // TODO: Replace with better cleanup approach
      cleanUp(COPIED_CATALOG_ITEM_NAME);
    });
  });

  afterEach(() => {
    // TODO: Replace with better cleanup approach
    cleanUp(CATALOG_ITEM_NAME);
  });
});
