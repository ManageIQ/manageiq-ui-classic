/* eslint-disable no-undef */

const textConstants = {
  // Menu options
  settingsMenuOption: 'Settings',
  appSettingsMenuOption: 'Application Settings',

  // List items
  diagnosticsAccordionItem: 'Diagnostics',
  diagnosticsAccordionItemId: 'diagnostics_accord',
  manageIQRegionAccordItem: /^ManageIQ Region:/,
  zoneAccordItem: /^Zone:/,
  serverAccordItem: /^Server:/,

  // Buttons
  saveButton: 'Save',
  cancelButton: 'Cancel',
  resetButton: 'Reset',

  // Dropdown values
  dropdownBlankValue: 'BLANK_VALUE',
  sambaDropdownValue: 'FileDepotSmb',

  // Common selectors
  buttonSelector: (type) => `#main-content .bx--btn-set button[type="${type}"]`,

  // Button types
  submitButtonType: 'submit',
  normalButtonType: 'button',

  // Component route url
  componentRouteUrl: '/ops/explorer',

  // Flash message types
  flashTypeSuccess: 'success',

  // Flash message text snippets
  flashMessageSettingsSaved: 'saved',
  flashMessageOperationCanceled: 'cancel',
};

const {
  diagnosticsAccordionItem,
  dropdownBlankValue,
  sambaDropdownValue,
  saveButton,
  cancelButton,
  resetButton,
  settingsMenuOption,
  appSettingsMenuOption,
  diagnosticsAccordionItemId,
  manageIQRegionAccordItem,
  zoneAccordItem,
  serverAccordItem,
  componentRouteUrl,
  flashTypeSuccess,
  flashMessageSettingsSaved,
  flashMessageOperationCanceled,
  buttonSelector,
  submitButtonType,
  normalButtonType,
} = textConstants;

function interceptAndAwaitApi({
  alias,
  method = 'POST',
  urlPattern,
  triggerFn,
  currentApiIntercepts,
}) {
  // If the alias is already registered, do not register it again
  // This prevents multiple intercepts for the same API call
  // which can lead to unexpected behavior in tests.
  if (!currentApiIntercepts[alias]) {
    cy.intercept(method, urlPattern).as(alias);
    currentApiIntercepts[alias] = alias;
  }

  triggerFn();

  cy.wait(`@${alias}`);
}

function invokeAndAwaitCollectLogsTabInfo({ currentApiIntercepts }) {
  interceptAndAwaitApi({
    alias: 'getCollectLogsTabInfo',
    urlPattern: '/ops/change_tab?tab_id=diagnostics_collect_logs',
    triggerFn: () =>
      cy
        .get(
          '#tab_all_tabs_div #ops_tabs .nav-tabs li#diagnostics_collect_logs_tab'
        )
        .click(),
    currentApiIntercepts,
  });
}

function invokeAndAwaitEditEventForServer({ currentApiIntercepts }) {
  interceptAndAwaitApi({
    alias: 'editEventForServer',
    urlPattern: /\/ops\/x_button\/[^/]+\?pressed=.*log_depot_edit/, // matches both /ops/x_button/1?pressed=log_depot_edit & /ops/x_button/2?pressed=zone_log_depot_edit endpoints
    triggerFn: () =>
      cy
        .get(
          '.miq-toolbar-actions .miq-toolbar-group button[id$="log_depot_edit"]' // matches both buttons log_depot_edit & zone_log_depot_edit
        )
        .click(),
    currentApiIntercepts,
  });
}

function resetProtocolDropdown({
  currentApiIntercepts,
  selectServerListItem = true,
}) {
  // Select Diagnostics
  cy.accordion(diagnosticsAccordionItem);
  // Select "Zone:" or "Server:" accordion item
  cy.selectAccordionItem([
    manageIQRegionAccordItem,
    zoneAccordItem,
    ...(selectServerListItem ? [serverAccordItem] : []),
  ]);

  // Clicking Edit button
  invokeAndAwaitEditEventForServer({ currentApiIntercepts });

  // Resetting Protocol dropdown value
  cy.get('#log-depot-settings .bx--select select#log_protocol').then(
    ($select) => {
      const currentValue = $select.val();
      // If the value is not default one(BLANK_VALUE), then setting it to blank
      if (currentValue !== dropdownBlankValue) {
        cy.wrap($select).select(dropdownBlankValue);
        cy.contains(buttonSelector(submitButtonType), saveButton).click();
        // Validating confirmation flash message
        cy.expect_flash(flashTypeSuccess, flashMessageSettingsSaved);
      }
    }
  );
}

function goToCollectLogsNavbarAndOpenEditForm(registeredApiIntercepts) {
  // Selecting Collect Logs nav bar
  invokeAndAwaitCollectLogsTabInfo({
    currentApiIntercepts: registeredApiIntercepts,
  });
  // Clicking Edit button
  invokeAndAwaitEditEventForServer({
    currentApiIntercepts: registeredApiIntercepts,
  });
}

function cancelButtonValidation() {
  // Click cancel button in the form
  cy.contains(buttonSelector(normalButtonType), cancelButton)
    .should('be.enabled')
    .click();
  // Validating confirmation flash message
  cy.expect_flash(flashTypeSuccess, flashMessageOperationCanceled);
}

function resetButtonValidation() {
  // Confirm Reset button is disabled initially
  cy.contains(buttonSelector(normalButtonType), resetButton).should(
    'be.disabled'
  );

  // Selecting Samba option from dropdown
  cy.get('#log-depot-settings .bx--select select#log_protocol').select(
    sambaDropdownValue
  );
  // Confirm Reset button is enabled once dropdown value is changed and then click on Reset
  cy.contains(buttonSelector(normalButtonType), resetButton)
    .should('be.enabled')
    .click();
  // Confirm dropdown has the old value
  cy.get('#log-depot-settings .bx--select select#log_protocol').should(
    'have.value',
    dropdownBlankValue
  );
}

function saveButtonValidation() {
  // Confirm Save button is disabled initially
  cy.contains(buttonSelector(submitButtonType), saveButton).should(
    'be.disabled'
  );
  // Selecting Samba option from dropdown
  cy.get('#log-depot-settings .bx--select select#log_protocol').select(
    sambaDropdownValue
  );
  // Confirm Save button is enabled once dropdown value is changed and then click on Save
  cy.contains(buttonSelector(submitButtonType), saveButton)
    .should('be.enabled')
    .click();
  // Validating confirmation flash message
  cy.expect_flash(flashTypeSuccess, flashMessageSettingsSaved);
}

describe('Automate Collect logs Edit form operations', () => {
  // Map that keeps track of registered API intercepts
  // This is used to avoid registering the same API intercept multiple times
  // during the test run, which can lead to unexpected behavior.
  let registeredApiIntercepts;

  beforeEach(() => {
    registeredApiIntercepts = {};
    cy.login();
    // Navigate to Application settings and Select Diagnostics
    cy.menu(settingsMenuOption, appSettingsMenuOption);
    interceptAndAwaitApi({
      alias: 'getDiagnosticsInfo',
      urlPattern: `/ops/accordion_select?id=${diagnosticsAccordionItemId}`,
      triggerFn: () => cy.accordion(diagnosticsAccordionItem),
      currentApiIntercepts: registeredApiIntercepts,
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
      goToCollectLogsNavbarAndOpenEditForm(registeredApiIntercepts);
    });

    it('Validate Cancel button', () => {
      cancelButtonValidation();
    });

    it('Validate Reset button', () => {
      resetButtonValidation();
    });

    it('Validate Save button', () => {
      saveButtonValidation();
    });

    after(() => {
      cy?.url()?.then((url) => {
        // Ensures navigation to Settings -> Application-Settings in the UI
        if (url?.includes(componentRouteUrl)) {
          resetProtocolDropdown({
            currentApiIntercepts: registeredApiIntercepts,
          });
        } else {
          // Navigate to Settings -> Application-Settings before selecting Diagnostics
          cy.menu(settingsMenuOption, appSettingsMenuOption);
          resetProtocolDropdown({
            currentApiIntercepts: registeredApiIntercepts,
          });
        }
      });
    });
  });

  describe('Settings > Application Settings > Diagnostics > Manage IQ Region > Zone > Collect logs > Edit', () => {
    beforeEach(() => {
      // Select "Zone:" accordion item
      interceptAndAwaitApi({
        alias: 'treeSelectApi',
        urlPattern:
          /ops\/tree_select\?id=.*&text=.*Zone.*Default.*Zone.*(current).*/,
        triggerFn: () =>
          cy.selectAccordionItem([manageIQRegionAccordItem, zoneAccordItem]),
        currentApiIntercepts: registeredApiIntercepts,
      });
      // Select collect logs navbar and open edit form
      goToCollectLogsNavbarAndOpenEditForm(registeredApiIntercepts);
    });

    it('Validate Cancel button', () => {
      cancelButtonValidation();
    });

    it('Validate Reset button', () => {
      resetButtonValidation();
    });

    it('Validate Save button', () => {
      saveButtonValidation();
    });

    after(() => {
      cy?.url()?.then((url) => {
        // Ensures navigation to Settings -> Application-Settings in the UI
        if (url?.includes(componentRouteUrl)) {
          resetProtocolDropdown({
            currentApiIntercepts: registeredApiIntercepts,
            selectServerListItem: false,
          });
        } else {
          // Navigate to Settings -> Application-Settings before selecting Diagnostics
          cy.menu(settingsMenuOption, appSettingsMenuOption);
          resetProtocolDropdown({
            currentApiIntercepts: registeredApiIntercepts,
            selectServerListItem: false,
          });
        }
      });
    });
  });
});

