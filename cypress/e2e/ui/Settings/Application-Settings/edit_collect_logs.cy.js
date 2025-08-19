/* eslint-disable no-undef */
import { flashClassMap } from "../../../../support/assertions/assertion_constants";

const textConstants = {
  // Component route url
  componentRouteUrl: '/ops/explorer',

  // Menu options
  settingsMenuOption: 'Settings',
  appSettingsMenuOption: 'Application Settings',

  // List items
  diagnosticsAccordionItem: 'Diagnostics',
  diagnosticsAccordionItemId: 'diagnostics_accord',
  manageIQRegionAccordItem: /^ManageIQ Region:/,
  zoneAccordItem: /^Zone:/,
  serverAccordItem: /^Server:/,

  // Field values
  formHeader: 'Editing Log Depot settings',
  formSubheaderSnippet: 'Editing Log Depot Settings',

  // Config options
  editToolbarButton: 'Edit',

  // Buttons
  saveButton: 'Save',
  cancelButton: 'Cancel',
  resetButton: 'Reset',

  // Common element IDs
  protocolSelectFieldId: 'log_protocol',

  // Dropdown values
  dropdownBlankValue: 'BLANK_VALUE',
  sambaDropdownValue: 'FileDepotSmb',

  // Flash message text snippets
  flashMessageSettingsSaved: 'saved',
  flashMessageOperationCancelled: 'cancel',
};

const {
  // Component route url
  componentRouteUrl,

  // Menu options
  settingsMenuOption,
  appSettingsMenuOption,

  // List items
  diagnosticsAccordionItem,
  diagnosticsAccordionItemId,
  manageIQRegionAccordItem,
  zoneAccordItem,
  serverAccordItem,

  // Field values
  formHeader,
  formSubheaderSnippet,

  // Config options
  editToolbarButton,

  // Buttons
  saveButton,
  cancelButton,
  resetButton,

  // Common element IDs
  protocolSelectFieldId,

  // Dropdown values
  dropdownBlankValue,
  sambaDropdownValue,

  // Flash message text snippets
  flashMessageSettingsSaved,
  flashMessageOperationCancelled,
} = textConstants;

function goToCollectLogsTab() {
  cy.interceptApi({
    alias: 'getCollectLogsTabInfo',
    urlPattern: '/ops/change_tab?tab_id=diagnostics_collect_logs',
    triggerFn: () =>
      cy
        .get(
          '#tab_all_tabs_div #ops_tabs .nav-tabs li#diagnostics_collect_logs_tab'
        )
        .click(),
  });
}

function selectToolbarEditButton() {
  cy.interceptApi({
    alias: 'editEventForServer',
    // This pattern matches both /ops/x_button/1?pressed=log_depot_edit & /ops/x_button/2?pressed=zone_log_depot_edit endpoints
    urlPattern: /\/ops\/x_button\/[^/]+\?pressed=.*log_depot_edit/,
    triggerFn: () => cy.toolbar(editToolbarButton),
  });
}

function resetProtocolDropdown({ selectServerListItem = true } = {}) {
  // Select Diagnostics
  cy.accordion(diagnosticsAccordionItem);
  // Select "Zone:" or "Server:" accordion item
  cy.selectAccordionItem([
    manageIQRegionAccordItem,
    zoneAccordItem,
    ...(selectServerListItem ? [serverAccordItem] : []),
  ]);

  // Clicking Edit button
  selectToolbarEditButton();

  // Resetting Protocol dropdown value
  cy.getFormSelectFieldById(protocolSelectFieldId).then((selectField) => {
    const currentValue = selectField.val();
    // If the value is not default one(BLANK_VALUE), then setting it to blank
    if (currentValue !== dropdownBlankValue) {
      cy.wrap(selectField).select(dropdownBlankValue);
      cy.getFormFooterButtonByType(saveButton, 'submit').click();
      // Validating confirmation flash message
      cy.expect_flash(flashClassMap.success, flashMessageSettingsSaved);
    }
  });
}

function goToCollectLogsTabAndOpenEditForm() {
  // Selecting Collect Logs tab
  goToCollectLogsTab();
  // Clicking Edit button
  selectToolbarEditButton();
}

function validateFormElements() {
  // Assert form header is visible
  cy.expect_explorer_title(formHeader).should('be.visible');
  // Assert form sub-header is visible
  cy.contains('#main-content .bx--form h3', formSubheaderSnippet).should(
    'be.visible'
  );
  // Assert protocol field label is visible
  cy.getFormLabelByInputId(protocolSelectFieldId).should('be.visible');
  // Assert protocol field is visible and enabled
  cy.getFormSelectFieldById(protocolSelectFieldId)
    .should('be.visible')
    .and('be.enabled');
  // Assert cancel button is visible and enabled
  cy.getFormFooterButtonByType(cancelButton)
    .should('be.visible')
    .and('be.enabled');
  // Assert save button is visible and disabled
  cy.getFormFooterButtonByType(saveButton, 'submit')
    .should('be.visible')
    .and('be.disabled');
  // Assert reset button is visible and disabled
  cy.getFormFooterButtonByType(resetButton)
    .should('be.visible')
    .and('be.disabled');
}

function cancelButtonValidation() {
  // Click cancel button in the form
  cy.getFormFooterButtonByType(cancelButton).click();
  // Validating confirmation flash message
  cy.expect_flash(flashClassMap.success, flashMessageOperationCancelled);
}

function resetButtonValidation() {
  // Selecting Samba option from dropdown
  cy.getFormSelectFieldById(protocolSelectFieldId).select(sambaDropdownValue);
  // Confirm Reset button is enabled once dropdown value is changed and then click on Reset
  cy.getFormFooterButtonByType(resetButton).should('be.enabled').click();
  // Confirm dropdown has the old value
  cy.getFormSelectFieldById(protocolSelectFieldId).should(
    'have.value',
    dropdownBlankValue
  );
}

function saveButtonValidation() {
  // Selecting Samba option from dropdown
  cy.getFormSelectFieldById(protocolSelectFieldId).select(sambaDropdownValue);
  // Confirm Save button is enabled once dropdown value is changed and then click on Save
  cy.getFormFooterButtonByType(saveButton, 'submit')
    .should('be.enabled')
    .click();
  // Validating confirmation flash message
  cy.expect_flash(flashClassMap.success, flashMessageSettingsSaved);
}

describe('Automate Collect logs Edit form operations', () => {
  beforeEach(() => {
    cy.login();
    // Navigate to Application settings and expand Diagnostics accordion
    cy.menu(settingsMenuOption, appSettingsMenuOption);
    cy.interceptApi({
      alias: 'getDiagnosticsInfo',
      urlPattern: `/ops/accordion_select?id=${diagnosticsAccordionItemId}`,
      triggerFn: () => cy.accordion(diagnosticsAccordionItem),
    });
  });

  describe('Settings > Application Settings > Diagnostics > Manage IQ Region > Zone > Server > Collect logs > Edit', () => {
    beforeEach(() => {
      // Select "Server:" accordion item
      cy.selectAccordionItem([
        manageIQRegionAccordItem,
        zoneAccordItem,
        serverAccordItem,
      ]);
      // Select collect logs navbar and open edit form
      goToCollectLogsTabAndOpenEditForm();
    });

    it('Validate form elements', () => {
      validateFormElements();
    });

    it('Validate Reset & Cancel buttons', () => {
      // Reset button validation
      resetButtonValidation();
      // Cancel button validation
      cancelButtonValidation();
    });

    it('Validate Save button', () => {
      saveButtonValidation();
    });

    after(() => {
      cy.url()
        ?.then((url) => {
          // Ensures navigation to Settings -> Application-Settings in the UI
          if (!url?.includes(componentRouteUrl)) {
            // Navigate to Settings -> Application-Settings before cleanup
            cy.menu(settingsMenuOption, appSettingsMenuOption);
          }
        })
        .then(() => {
          resetProtocolDropdown();
        });
    });
  });

  describe('Settings > Application Settings > Diagnostics > Manage IQ Region > Zone > Collect logs > Edit', () => {
    beforeEach(() => {
      // Select "Zone:" accordion item
      cy.interceptApi({
        alias: 'treeSelectApi',
        urlPattern:
          /ops\/tree_select\?id=.*&text=.*Zone.*Default.*Zone.*(current).*/,
        triggerFn: () =>
          cy.selectAccordionItem([manageIQRegionAccordItem, zoneAccordItem]),
      });
      // Select collect logs tab and open edit form
      goToCollectLogsTabAndOpenEditForm();
    });

    it('Validate form elements', () => {
      validateFormElements();
    });

    it('Validate Reset & Cancel buttons', () => {
      // Reset button validation
      resetButtonValidation();
      // Cancel button validation
      cancelButtonValidation();
    });

    it('Validate Save button', () => {
      saveButtonValidation();
    });

    after(() => {
      cy.url()
        ?.then((url) => {
          // Ensures navigation to Settings -> Application-Settings in the UI
          if (!url?.includes(componentRouteUrl)) {
            // Navigate to Settings -> Application-Settings before cleanup
            cy.menu(settingsMenuOption, appSettingsMenuOption);
          }
        })
        .then(() => {
          resetProtocolDropdown({ selectServerListItem: false });
        });
    });
  });
});
