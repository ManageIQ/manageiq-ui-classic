/* eslint-disable no-undef */
import { flashClassMap } from '../../../../support/assertions/assertion_constants';
import {
  LABEL_CONFIG_KEYS,
  FIELD_CONFIG_KEYS,
  BUTTON_CONFIG_KEYS,
} from '../../../../support/commands/constants/command_constants';

// Menu options
const SERVICES_MENU_OPTION = 'Services';
const CATALOGS_MENU_OPTION = 'Catalogs';

// Accordion items
const CATALOG_ITEMS_ACCORDION_ITEM = 'Catalog Items';
const ALL_CATALOG_ITEMS_ACCORDION_ITEM = 'All Catalog Items';
const UNASSIGNED_ACCORDION_ITEM = 'Unassigned';

// Config options
const CONFIG_TOOLBAR_BUTTON = 'Configuration';
const COPY_CONFIG_OPTION = 'Copy Selected Item';

// Field labels
const FORM_HEADER = 'Catalog';
const NAME_FIELD_LABEL = 'Name';
const COPY_TAGS_FIELD_LABEL = 'Copy Tags';

// Field values
const CATALOG_ITEM_NAME = 'Test-Catalog-Item';
const COPIED_CATALOG_ITEM_NAME = `Copy of ${CATALOG_ITEM_NAME}`;

// Flash message text snippets
const FLASH_MESSAGE_INFO_TEXT = 'will not be displayed';
const FLASH_MESSAGE_CANCELLED = 'cancelled';
const FLASH_MESSAGE_SAVED = 'saved';

// Buttons
const ADD_BUTTON_TEXT = 'Add';
const CANCEL_BUTTON_TEXT = 'Cancel';

describe('Automate Catalog form operations: Services > Catalogs > Catalogs > Configuration > Add a New Catalog', () => {
  beforeEach(() => {
    cy.appFactories([
      ['create', 'service_template', {name: CATALOG_ITEM_NAME, generic_subtype: 'custom', prov_type: 'generic', display: true}],
    ]).then((results) => {
      cy.appFactories([
        ['create', 'resource_action', {action: 'Provision', resource_id: results[0].id, resource_type: 'ServiceTemplate'}],
        ['create', 'resource_action', {action: 'Retirement', resource_id: results[0].id, resource_type: 'ServiceTemplate'}]
      ])
    });

    cy.login();
    cy.menu(SERVICES_MENU_OPTION, CATALOGS_MENU_OPTION);

    cy.accordion(CATALOG_ITEMS_ACCORDION_ITEM);

    cy.selectAccordionItem([
      ALL_CATALOG_ITEMS_ACCORDION_ITEM,
      UNASSIGNED_ACCORDION_ITEM,
      CATALOG_ITEM_NAME,
    ]);
    cy.toolbar(CONFIG_TOOLBAR_BUTTON, COPY_CONFIG_OPTION);
  });

  afterEach(() => {
    cy.appDbState('restore');
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
      cy.validateFormButtons([
        {
          [BUTTON_CONFIG_KEYS.BUTTON_TEXT]: ADD_BUTTON_TEXT,
          [BUTTON_CONFIG_KEYS.BUTTON_TYPE]: 'submit',
        },
        {
          [BUTTON_CONFIG_KEYS.BUTTON_TEXT]: CANCEL_BUTTON_TEXT,
        },
      ]);
      // Cancel
      cy.getFormButtonByTypeWithText({
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
      cy.getFormButtonByTypeWithText({
        buttonText: ADD_BUTTON_TEXT,
        buttonType: 'submit',
      }).click();
      cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_SAVED);
    });
  });
});
