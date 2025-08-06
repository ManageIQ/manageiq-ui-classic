/* eslint-disable no-undef */

const textConstants = {
  // Component route url
  componentRouteUrl: '/ops/explorer',

  // Menu options
  settingsOption: 'Settings',
  appSettingsMenuOption: 'Application Settings',

  // Accordion items
  manageIQRegionAccordItem: /^ManageIQ Region:/,
  zonesAccordItem: 'Zones',

  // Config options
  configToolbarButton: 'Configuration',
  addZoneConfigOption: 'Add a new Zone',
  editZoneConfigOption: 'Edit this Zone',
  deleteZoneConfigOption: 'Delete this Zone',

  // Field values
  formHeaderFragment: 'Zone',
  infoSubHeader: 'Info',
  settingsSubHeader: 'Settings',
  zoneName: 'Test-Zone-Name',
  initialZoneDescription: 'Test-Zone-Description',
  updatedZoneDescription: 'Test-Zone-Description-Updated',
  initialServerIp: '0.0.0.0',
  updatedServerIp: '1.1.1.1',
  initialMaxScanLimit: 5,
  updatedMaxScanLimit: 10,

  // Element ids
  nameInputFieldId: 'name',
  descriptionInputFieldId: 'description',
  ipInputFieldId: 'settings\\.proxy_server_ip',
  maxScanSelectFieldId: 'settings\\.concurrent_vm_scans',

  // Buttons
  saveButton: 'Save',
  cancelButton: 'Cancel',
  addButton: 'Add',
  resetButton: 'Reset',

  // Button types
  submitButtonType: 'submit',

  // Flash message types
  flashTypeSuccess: 'success',
  flashTypeWarning: 'warning',

  // Flash message text snippets
  flashMessageOperationCanceled: 'cancel',
  flashMessageZoneUpdated: 'queued',
  flashMessageOperationReset: 'reset',
  deleteConfirmText: 'delete',
};

const {
  componentRouteUrl,
  settingsOption,
  appSettingsMenuOption,
  manageIQRegionAccordItem,
  zonesAccordItem,
  configToolbarButton,
  addZoneConfigOption,
  editZoneConfigOption,
  deleteZoneConfigOption,
  cancelButton,
  addButton,
  saveButton,
  resetButton,
  flashTypeSuccess,
  flashTypeWarning,
  deleteConfirmText,
  flashMessageOperationCanceled,
  flashMessageOperationReset,
  flashMessageZoneUpdated,
  submitButtonType,
  formHeaderFragment,
  infoSubHeader,
  settingsSubHeader,
  zoneName,
  initialZoneDescription,
  updatedZoneDescription,
  initialServerIp,
  updatedServerIp,
  initialMaxScanLimit,
  updatedMaxScanLimit,
  nameInputFieldId,
  descriptionInputFieldId,
  ipInputFieldId,
  maxScanSelectFieldId,
} = textConstants;

function addZone() {
  // Open add form
  cy.toolbar(configToolbarButton, addZoneConfigOption);
  // Adding name, description, ip and scan limit
  cy.getFormInputFieldById(nameInputFieldId).type(zoneName);
  cy.getFormInputFieldById(descriptionInputFieldId).type(
    initialZoneDescription
  );
  cy.getFormInputFieldById(ipInputFieldId).type(initialServerIp);
  cy.getFormSelectFieldById(maxScanSelectFieldId).select(initialMaxScanLimit);
  cy.intercept('POST', '/api/zones').as('createZone');
  cy.getFormFooterButtonByType(addButton, submitButtonType)
    .should('be.enabled')
    .click();
  cy.wait('@createZone');
}

function validateFormElements(isEditForm = false) {
  // Assert form header is visible
  cy.expect_explorer_title(formHeaderFragment);
  // Assert Info sub header is visible
  cy.get('#main-content .bx--form h3').contains(infoSubHeader);
  // Assert name field label is visible
  cy.getFormLabelByInputId(nameInputFieldId).should('be.visible');
  // Assert name field is visible and enabled
  cy.getFormInputFieldById(nameInputFieldId)
    .should('be.visible')
    .then((nameField) => {
      if (isEditForm) {
        expect(nameField).to.be.disabled;
      } else {
        expect(nameField).to.not.be.disabled;
      }
    });
  // Assert description field label is visible
  cy.getFormLabelByInputId(descriptionInputFieldId).should('be.visible');
  // Assert description field is visible and enabled
  cy.getFormInputFieldById(descriptionInputFieldId)
    .should('be.visible')
    .and('be.enabled');
  // Assert IP field label is visible
  cy.getFormLabelByInputId(ipInputFieldId).should('be.visible');
  // Assert IP field is visible and enabled
  cy.getFormInputFieldById(ipInputFieldId)
    .should('be.visible')
    .and('be.enabled');
  // Assert Settings sub header is visible
  cy.get('#main-content .bx--form h3').contains(settingsSubHeader);
  // Assert max scan field label is visible
  cy.getFormLabelByInputId(maxScanSelectFieldId).should('be.visible');
  // Assert max scan field is visible and enabled
  cy.getFormSelectFieldById(maxScanSelectFieldId)
    .should('be.visible')
    .and('be.enabled');
  // Assert cancel button is visible and enabled
  cy.getFormFooterButtonByType(cancelButton)
    .should('be.visible')
    .and('be.enabled');
  if (isEditForm) {
    // Assert reset button is visible and disabled
    cy.getFormFooterButtonByType(resetButton)
      .should('be.visible')
      .and('be.disabled');
  }
  // Assert add/save button is visible and disabled
  cy.getFormFooterButtonByType(
    isEditForm ? saveButton : addButton,
    submitButtonType
  )
    .should('be.visible')
    .and('be.disabled');
}

function cleanUp() {
  cy.get('li.list-group-item').each((item) => {
    const text = item?.text()?.trim();
    if (text.includes(initialZoneDescription)) {
      // Select the zone node if it hasn’t been selected yet
      if (!item.hasClass('node-selected')) {
        cy.wrap(item).click();
        cy.wait('@treeSelectApi');
      }
      // Deleting the zone
      cy.expect_browser_confirm_with_text({
        confirmTriggerFn: () =>
          cy.toolbar(configToolbarButton, deleteZoneConfigOption),
      });
      return false; // exit the iteration
    }
    return null; // has no impact - just to get rid of eslint warning
  });
}

describe('Automate Schedule form operations: Settings > Application Settings > Settings > Zones > Configuration > Add a new Zone', () => {
  beforeEach(() => {
    cy.login();
    // Navigate to Application-Settings
    cy.menu(settingsOption, appSettingsMenuOption);
    // Expand Settings accordion panel
    cy.accordion(settingsOption);
    // Select "Zones" accordion item
    cy.intercept('POST', /\/ops\/tree_select\?id=.*&text=.*/).as(
      'treeSelectApi'
    );
    cy.selectAccordionItem([manageIQRegionAccordItem, zonesAccordItem]);
    cy.wait('@treeSelectApi');
  });

  it('Validate the visibility and state of add form elements', () => {
    // Open add form
    cy.toolbar(configToolbarButton, addZoneConfigOption);
    // Validate fields
    validateFormElements();
  });

  it('Checking whether cancel button works on the add form', () => {
    // Open add form
    cy.toolbar(configToolbarButton, addZoneConfigOption);
    // Cancelling the form
    cy.getFormFooterButtonByType(cancelButton).click();
    cy.expect_flash(flashTypeWarning, flashMessageOperationCanceled);
  });

  it('Checking whether add, edit & delete zone works', () => {
    /* ===== Add ===== */
    // Adding zone
    addZone();
    cy.expect_flash(flashTypeSuccess, flashMessageZoneUpdated);
    /* ===== Edit ===== */
    // Select the created zone
    cy.selectAccordionItem([
      manageIQRegionAccordItem,
      zonesAccordItem,
      `Zone: ${initialZoneDescription}`,
    ]);
    cy.wait('@treeSelectApi');
    // Open edit form
    cy.toolbar(configToolbarButton, editZoneConfigOption);
    // Update IP & scan limit
    cy.getFormInputFieldById(descriptionInputFieldId)
      .clear()
      .type(updatedServerIp);
    cy.getFormSelectFieldById(maxScanSelectFieldId).select(updatedMaxScanLimit);
    // Save the form
    cy.getFormFooterButtonByType(saveButton, submitButtonType)
      .should('be.enabled')
      .click();
    cy.expect_flash(flashTypeSuccess, flashMessageZoneUpdated);
    /* ===== Delete ===== */
    // Deleting the zone
    cy.expect_browser_confirm_with_text({
      confirmTriggerFn: () =>
        cy.toolbar(configToolbarButton, deleteZoneConfigOption),
      containsText: deleteConfirmText,
    });
    cy.expect_flash(flashTypeSuccess, deleteConfirmText);
  });

  it('Validate the visibility and state of edit form elements', () => {
    // Adding zone
    addZone();
    // Select the created zone
    cy.selectAccordionItem([
      manageIQRegionAccordItem,
      zonesAccordItem,
      `Zone: ${initialZoneDescription}`,
    ]);
    cy.wait('@treeSelectApi');
    // Open edit form
    cy.toolbar(configToolbarButton, editZoneConfigOption);
    // Validate fields
    validateFormElements(true);
    // Cancelling the form
    cy.getFormFooterButtonByType(cancelButton).click();
  });

  it('Checking whether cancel & reset buttons work on the edit form', () => {
    // Adding zone
    addZone();
    // Select the created zone
    cy.selectAccordionItem([
      manageIQRegionAccordItem,
      zonesAccordItem,
      `Zone: ${initialZoneDescription}`,
    ]);
    cy.wait('@treeSelectApi');
    // Open edit form
    cy.toolbar(configToolbarButton, editZoneConfigOption);
    /* ===== Reset ===== */
    // Update description & IP
    cy.getFormInputFieldById(descriptionInputFieldId)
      .clear()
      .type(updatedZoneDescription);
    cy.getFormInputFieldById(ipInputFieldId).clear().type(updatedServerIp);
    // Resetting the form
    cy.getFormFooterButtonByType(resetButton).should('be.enabled').click();
    cy.expect_flash(flashTypeWarning, flashMessageOperationReset);
    // Confirming the edited fields contain the old values after resetting
    cy.getFormInputFieldById(descriptionInputFieldId).should(
      'have.value',
      initialZoneDescription
    );
    cy.getFormInputFieldById(ipInputFieldId).should(
      'have.value',
      initialServerIp
    );
    /* ===== Cancel ===== */
    // Cancelling the form
    cy.getFormFooterButtonByType(cancelButton).click();
    cy.expect_flash(flashTypeWarning, flashMessageOperationCanceled);
  });

  afterEach(() => {
    cy.url()
      ?.then((url) => {
        // Ensures navigation to Settings -> Application-Settings in the UI
        if (!url?.includes(componentRouteUrl)) {
          // Navigate to Settings -> Application-Settings before cleanup
          cy.menu(settingsOption, appSettingsMenuOption);
        }
      })
      .then(() => {
        cleanUp();
      });
  });
});
