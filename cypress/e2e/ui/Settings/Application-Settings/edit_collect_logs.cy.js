/* eslint-disable no-undef */

function resetProtocolForServer() {
  // Select Diagnostics
  cy.get('.panel #control_diagnostics_accord .panel-title a')
    .contains('Diagnostics')
    .click();
  // Open ManageIQ Region: - list view if not already open
  cy.get(
    '#diagnostics_accord .treeview li.list-group-item[title^="ManageIQ Region:"]'
  ).then(($li) => {
    const span = $li.find('span.fa-angle-right');
    if (span.length) {
      cy.wrap(span).click();
    }
  });
  // Open Zone: - list view if not already open
  cy.get(
    '#diagnostics_accord .treeview li.list-group-item[title^="Zone:"]'
  ).then(($li) => {
    const span = $li.find('span.fa-angle-right');
    if (span.length) {
      cy.wrap(span).click();
    }
  });
  // Selecting Server: list view
  cy.get(
    '#diagnostics_accord .treeview li.list-group-item[title^="Server:"]'
  ).click();
  // Selecting Collect Logs nav bar
  cy.get(
    '#tab_all_tabs_div #ops_tabs .nav-tabs li#diagnostics_collect_logs_tab'
  ).click();
  // Clicking Edit button
  cy.get(
    '.miq-toolbar-actions .miq-toolbar-group button#log_depot_edit'
  ).click();
  cy.wait('@editEventForServer');
  // Resetting Protocol dropdown value
  cy.get('#log-depot-settings .bx--select select#log_protocol').then(
    ($select) => {
      const currentValue = $select.val();
      // If the value is not default one(BLANK_VALUE), then setting it to blank
      if (currentValue !== 'BLANK_VALUE') {
        cy.wrap($select).select('BLANK_VALUE');
        cy.get('#diagnostics_collect_logs .bx--btn-set button[type="Submit"]')
          .contains('Save')
          .click();
        cy.get('#main_div #flash_msg_div .alert-success').contains(
          'Log Depot Settings were saved'
        );
      }
    }
  );
}

function resetProtocolForZone() {
  cy.get('.panel #control_diagnostics_accord .panel-title a')
    .contains('Diagnostics')
    .click();
  // Open ManageIQ Region: - list view if not already open
  cy.get(
    '#diagnostics_accord .treeview li.list-group-item[title^="ManageIQ Region:"]'
  ).then(($li) => {
    const span = $li.find('span.fa-angle-right');
    if (span.length) {
      cy.wrap(span).click();
    }
  });
  // Open Zone: - list view if not already open
  cy.get(
    '#diagnostics_accord .treeview li.list-group-item[title^="Zone:"]'
  ).click();
  // Selecting Collect Logs navbar
  cy.get(
    '#tab_all_tabs_div #ops_tabs .nav-tabs li#diagnostics_collect_logs_tab'
  ).click();
  // Clicking Edit button
  cy.get(
    '.miq-toolbar-actions .miq-toolbar-group button#zone_log_depot_edit'
  ).click();
  cy.wait('@editEventForZone');
  // Resetting Protocol dropdown value
  cy.get('#log-depot-settings .bx--select select#log_protocol').then(
    ($select) => {
      const currentValue = $select.val();
      // If the value is not default one(BLANK_VALUE), then setting it to blank and then saving
      if (currentValue !== 'BLANK_VALUE') {
        cy.wrap($select).select('BLANK_VALUE');
        cy.get('#diagnostics_collect_logs .bx--btn-set button[type="Submit"]')
          .contains('Save')
          .click();
        cy.get('#main_div #flash_msg_div .alert-success').contains(
          'Log Depot Settings were saved'
        );
      }
    }
  );
}

function cancelButtonValidation() {
  // Click cancel button in the form
  cy.get('#diagnostics_collect_logs .bx--btn-set button[type="button"]')
    .contains('Cancel')
    .should('be.enabled')
    .click();
  // Validating confirmation alert text displayed
  cy.get('#main_div #flash_msg_div .alert-success').contains(
    'Edit Log Depot settings was cancelled by the user'
  );
}

function resetButtonValidation() {
  // Confirm Reset button is disabled initially
  cy.get('#diagnostics_collect_logs .bx--btn-set button[type="button"]')
    .contains('Reset')
    .should('be.disabled');
  // Selecting Samba option from dropdown
  cy.get('#log-depot-settings .bx--select select#log_protocol').select('Samba');
  // Confirm Reset button is enabled once dropdown value is changed and then click on Reset
  cy.get('#diagnostics_collect_logs .bx--btn-set button[type="button"]')
    .contains('Reset')
    .should('be.enabled')
    .click();
  // Confirm dropdown has the old value
  cy.get('#log-depot-settings .bx--select select#log_protocol').should(
    'have.value',
    'BLANK_VALUE'
  );
}

function saveButtonValidation() {
  // Confirm Save button is disabled initially
  cy.get('#diagnostics_collect_logs .bx--btn-set button[type="Submit"]')
    .contains('Save')
    .should('be.disabled');
  // Selecting Samba option from dropdown
  cy.get('#log-depot-settings .bx--select select#log_protocol').select('Samba');
  // Confirm Save button is enabled once dropdown value is changed and then click on Save
  cy.get('#diagnostics_collect_logs .bx--btn-set button[type="Submit"]')
    .contains('Save')
    .should('be.enabled')
    .click();
  // Validating confirmation alert text displayed
  cy.get('#main_div #flash_msg_div .alert-success').contains(
    'Log Depot Settings were saved'
  );
}

describe('Automate Collect logs Edit form operations', () => {
  beforeEach(() => {
    cy.login();
    // Navigate to Application settings and Select Diagnostics
    cy.menu('Settings', 'Application Settings');
    cy.get('.panel #control_diagnostics_accord .panel-title a')
      .contains('Diagnostics')
      .click();
    // Open ManageIQ Region: - list view if not already open
    cy.get(
      '#diagnostics_accord .treeview li.list-group-item[title^="ManageIQ Region:"]'
    ).then(($li) => {
      const span = $li.find('span.fa-angle-right');
      if (span.length) {
        cy.wrap(span).click();
      }
    });
  });

  describe('Settings > Application Settings > Diagnostics > Manage IQ Region > Zone > Server > Collect logs > Edit', () => {
    beforeEach(() => {
      // Open Zone: - list view if not already open
      cy.get(
        '#diagnostics_accord .treeview li.list-group-item[title^="Zone:"]'
      ).then(($li) => {
        const span = $li.find('span.fa-angle-right');
        if (span.length) {
          cy.wrap(span).click();
        }
      });
      // Selecting Server: list view
      cy.get(
        '#diagnostics_accord .treeview li.list-group-item[title^="Server:"]'
      ).click();
      // Selecting Collect Logs nav bar
      cy.get(
        '#tab_all_tabs_div #ops_tabs .nav-tabs li#diagnostics_collect_logs_tab'
      ).click();
      // Clicking Edit button
      cy.intercept('POST', '/ops/x_button/1?pressed=log_depot_edit').as(
        'editEventForServer'
      );
      cy.get(
        '.miq-toolbar-actions .miq-toolbar-group button#log_depot_edit'
      ).click();
      cy.wait('@editEventForServer');
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
        if (url?.includes('/ops/explorer')) {
          resetProtocolForServer();
        } else {
          // Navigate to Settings -> Application-Settings before selecting Diagnostics
          cy.menu('Settings', 'Application Settings');
          resetProtocolForServer();
        }
      });
    });
  });

  describe('Settings > Application Settings > Diagnostics > Manage IQ Region > Zone > Collect logs > Edit', () => {
    beforeEach(() => {
      // Selecting Zone: - list view
      cy.intercept('POST', '/ops/tree_select?id=z-2*').as('treeSelectApi');
      cy.get(
        '#diagnostics_accord .treeview li.list-group-item[title^="Zone:"]'
      ).click();
      cy.wait('@treeSelectApi');
      // Selecting Collect Logs navbar
      cy.get(
        '#tab_all_tabs_div #ops_tabs .nav-tabs li#diagnostics_collect_logs_tab'
      ).click();
      // Clicking Edit button
      cy.intercept('POST', '/ops/x_button/2?pressed=zone_log_depot_edit').as(
        'editEventForZone'
      );
      cy.get(
        '.miq-toolbar-actions .miq-toolbar-group button#zone_log_depot_edit'
      ).click();
      cy.wait('@editEventForZone');
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
        if (url?.includes('/ops/explorer')) {
          resetProtocolForZone();
        } else {
          // Navigate to Settings -> Application-Settings before selecting Diagnostics
          cy.menu('Settings', 'Application Settings');
          resetProtocolForZone();
        }
      });
    });
  });
});
