import { flashClassMap } from '../../../../support/assertions/assertion_constants';

const SETTINGS_LABEL = 'Settings';
const APP_SETTINGS_OPTION = 'Application Settings';
const MANAGEIQ_REGION_ACCORDION_ITEM = /^ManageIQ Region:/;
const ANALYSIS_PROFILES_ACCORDION_ITEM = 'Analysis Profiles';

describe('Settings Analysis Profile', () => {
  beforeEach(() => {
    cy.login();
    cy.menu(SETTINGS_LABEL, APP_SETTINGS_OPTION);
    cy.accordion(SETTINGS_LABEL);
    cy.selectAccordionItem([MANAGEIQ_REGION_ACCORDION_ITEM, ANALYSIS_PROFILES_ACCORDION_ITEM]);
  });

  describe('Analysis Profile List View', () => {
    it('displays analysis profile details when selected', () => {
      cy.get('li.list-group-item').contains(/^sample$/i).click();
      cy.get('.ap-form').should('not.exist');
      cy.get('#ap-tabs-wrapper').should('not.exist');
      cy.get('.miq_custom_tabs').should('not.exist');
    });

    it('can navigate between different analysis profiles', () => {
      cy.get('li.list-group-item').contains(/^sample$/i).click();
      cy.selectAccordionItem([MANAGEIQ_REGION_ACCORDION_ITEM, 'Zones']);
      cy.selectAccordionItem([MANAGEIQ_REGION_ACCORDION_ITEM, ANALYSIS_PROFILES_ACCORDION_ITEM]);
      cy.get('li.list-group-item').contains(/^sample$/i).click();
      cy.get('.ap-form').should('not.exist');
    });
  });

  describe('Add VM Analysis Profile', () => {
    it('can create a new VM analysis profile with all tabs', () => {
      cy.toolbar('Configuration', 'Add VM Analysis Profile');
      cy.get('.ap-form').should('be.visible');
      cy.get('input[name="name"]').type('Cypress Test VM Profile');
      cy.get('input[name="description"]').type('Created by Cypress E2E test');
      cy.get('input[name="scan_mode"]').should('have.value', 'Vm');
      cy.get('input[name="scan_mode"]').should('have.attr', 'readonly');
      cy.get('#check_system').check({ force: true });
      cy.get('#check_services').check({ force: true });
      cy.get('#check_software').check({ force: true });
      cy.contains('button', 'File').click();
      // Open modal and add first file
      cy.contains('.ap-form-file button', 'Add File').click();
      cy.get('#fileName').type('/etc/hosts');
      cy.get('#fileContent').check({ force: true });
      cy.get('.cds--modal.is-visible').contains('button[type="submit"]', 'Add').click();
      cy.contains('/etc/hosts').should('be.visible');
      cy.contains('true').should('be.visible');
      // Open modal and add second file
      cy.contains('.ap-form-file button', 'Add File').click();
      cy.get('#fileName').type('/var/log/messages');
      cy.get('.cds--modal.is-visible').contains('button[type="submit"]', 'Add').click();
      cy.contains('/var/log/messages').should('be.visible');
      cy.contains('button', 'Registry').click();
      // Open modal and add registry entry
      cy.contains('.ap-form-registry button', 'Add Registry Entry').click();
      cy.get('#regKey').type('Software\\Microsoft\\Windows');
      cy.get('#regValue').type('CurrentVersion');
      cy.get('.cds--modal.is-visible').contains('button[type="submit"]', 'Add').click();
      cy.contains('Software\\Microsoft\\Windows').should('be.visible');
      cy.contains('CurrentVersion').should('be.visible');
      cy.contains('button', 'Event Log').click();
      // Open modal and add event log entry
      cy.contains('.ap-form-eventlog button', 'Add Event Log').click();
      cy.get('#eventLogName').type('Application');
      cy.get('#eventLogMessage').type('Error');
      cy.get('#eventLogLevel').type('Error');
      cy.get('#eventLogSource').type('TestApp');
      cy.get('#eventLogNumDays').clear().type('7');
      cy.get('.cds--modal.is-visible').contains('button[type="submit"]', 'Add').click();
      cy.contains('Application').should('be.visible');
      cy.contains('button[type="submit"]', 'Add').click();
      cy.expect_flash(flashClassMap.success, 'Analysis Profile');
      cy.contains('Cypress Test VM Profile').should('be.visible');
    });

    it('validates required name field', () => {
      cy.toolbar('Configuration', 'Add VM Analysis Profile');
      cy.contains('button[type="submit"]', 'Add').should('be.disabled');
      cy.get('input[name="name"]').type('Test Name');
      cy.get('input[name="description"]').type('Test Description');
      cy.contains('button[type="submit"]', 'Add').should('be.enabled');
      cy.get('input[name="name"]').clear();
      cy.contains('button[type="submit"]', 'Add').should('be.disabled');
    });

    it('validates at least one item must be entered', () => {
      cy.toolbar('Configuration', 'Add VM Analysis Profile');
      cy.get('input[name="name"]').type('Empty Profile');
      cy.get('input[name="description"]').type('Empty Profile Description');
      cy.contains('button[type="submit"]', 'Add').click();
      cy.get('.ap-form .cds--inline-notification--error')
        .should('be.visible')
        .and('contain', 'At least one item must be entered');
    });

    it('validates file entry fields', () => {
      cy.toolbar('Configuration', 'Add VM Analysis Profile');
      cy.contains('button', 'File').click();
      cy.contains('.ap-form-file button', 'Add File').click();
      // Touch the required field without filling it to trigger DDF validation
      cy.get('#fileName').focus().blur();
      cy.get('#fileName').should('have.attr', 'data-invalid', 'true');
      cy.get('.cds--form-requirement').should('contain', 'Required');
      // Submit button should remain disabled
      cy.get('.cds--modal.is-visible').contains('button[type="submit"]', 'Add').should('be.disabled');
    });

    it('validates registry entry fields', () => {
      cy.toolbar('Configuration', 'Add VM Analysis Profile');
      cy.contains('button', 'Registry').click();
      cy.contains('.ap-form-registry button', 'Add Registry Entry').click();
      // Touch required fields without filling them to trigger DDF validation
      cy.get('#regKey').focus().blur();
      cy.get('#regValue').focus().blur();
      cy.get('#regKey').should('have.attr', 'data-invalid', 'true');
      cy.get('#regValue').should('have.attr', 'data-invalid', 'true');
      cy.get('.cds--form-requirement').first().should('contain', 'Required');
      cy.get('.cds--modal.is-visible').contains('button[type="submit"]', 'Add').should('be.disabled');
    });

    it('validates event log entry fields', () => {
      cy.toolbar('Configuration', 'Add VM Analysis Profile');
      cy.contains('button', 'Event Log').click();
      cy.contains('.ap-form-eventlog button', 'Add Event Log').click();
      // Touch the required field without filling it to trigger DDF validation
      cy.get('#eventLogName').focus().blur();
      cy.get('#eventLogName').should('have.attr', 'data-invalid', 'true');
      cy.get('.cds--form-requirement').should('contain', 'Required');
      cy.get('.cds--modal.is-visible').contains('button[type="submit"]', 'Add').should('be.disabled');
    });

    it('can edit entries before submitting', () => {
      cy.toolbar('Configuration', 'Add VM Analysis Profile');
      cy.contains('button', 'File').click();
      // Open modal and add entry
      cy.contains('.ap-form-file button', 'Add File').click();
      cy.get('#fileName').type('/etc/hosts');
      cy.get('.cds--modal.is-visible').contains('button[type="submit"]', 'Add').click();
      cy.contains('/etc/hosts').should('be.visible');
      // Click row to edit
      cy.get('.cds--data-table tbody tr').contains('/etc/hosts').parents('tr').click();
      cy.get('#fileName').should('have.value', '/etc/hosts');
      cy.get('#fileName').clear().type('/var/log/syslog');
      cy.get('#fileContent').check({ force: true });
      cy.get('.cds--modal.is-visible').contains('button[type="submit"]', 'Update').click();
      cy.contains('/var/log/syslog').should('be.visible');
      cy.contains('/etc/hosts').should('not.exist');
      cy.get('.ap-form > form > .cds--btn-set').contains('button', 'Cancel').click();
      cy.expect_flash(flashClassMap.warning, 'cancelled');
    });

    it('can cancel adding a profile', () => {
      cy.toolbar('Configuration', 'Add VM Analysis Profile');
      cy.get('input[name="name"]').type('Profile to Cancel');
      cy.get('.ap-form > form > .cds--btn-set').contains('button', 'Cancel').click();
      cy.expect_flash(flashClassMap.warning, 'cancelled');
      cy.get('.ap-form').should('not.exist');
    });
  });

  describe('Add Host Analysis Profile', () => {
    it('can create a new Host analysis profile', () => {
      cy.toolbar('Configuration', 'Add Host Analysis Profile');
      cy.get('.ap-form').should('be.visible');
      cy.get('input[name="name"]').type('Cypress Test Host Profile');
      cy.get('input[name="description"]').type('Host profile created by Cypress');
      cy.get('input[name="scan_mode"]').should('have.value', 'Host');
      cy.contains('button', 'File').should('be.visible');
      cy.contains('button', 'Event Log').should('be.visible');
      cy.contains('button', 'Category').should('not.exist');
      cy.contains('button', 'Registry').should('not.exist');
      // Open modal and add file
      cy.contains('.ap-form-file button', 'Add File').click();
      cy.get('#fileName').type('/var/log/messages');
      cy.get('.cds--modal.is-visible').contains('button[type="submit"]', 'Add').click();
      cy.contains('/var/log/messages').should('be.visible');
      cy.contains('button', 'Event Log').click();
      // Open modal and add event log
      cy.contains('.ap-form-eventlog button', 'Add Event Log').click();
      cy.get('#eventLogName').type('System');
      cy.get('.cds--modal.is-visible').contains('button[type="submit"]', 'Add').click();
      cy.contains('System').should('be.visible');
      cy.contains('button[type="submit"]', 'Add').click();
      cy.expect_flash(flashClassMap.success, 'Analysis Profile');
      cy.contains('Cypress Test Host Profile').should('be.visible');
    });

    it('shows File tab as default for Host mode', () => {
      cy.toolbar('Configuration', 'Add Host Analysis Profile');
      cy.contains('button', 'File').should('have.attr', 'aria-selected', 'true');
      cy.get('.ap-form-file').should('be.visible');
    });
  });

  describe('Edit Analysis Profile', () => {
    it('can edit an existing VM analysis profile', () => {
      cy.get('li.list-group-item').contains(/^host default$/i).click();
      cy.toolbar('Configuration', 'Edit this Analysis Profile');
      cy.get('.ap-form').should('be.visible');
      cy.get('input[name="name"]').should('not.have.value', '');
      cy.get('input[name="description"]').clear().type('Updated by Cypress test');
      cy.contains('button', 'File').click();
      // Open modal and add file
      cy.contains('.ap-form-file button', 'Add File').click();
      cy.get('#fileName').type('/tmp/cypress-test.log');
      cy.get('.cds--modal.is-visible').contains('button[type="submit"]', 'Add').click();
      cy.contains('/tmp/cypress-test.log').scrollIntoView().should('be.visible');
      cy.contains('button[type="submit"]', 'Save').click();
      cy.expect_flash(flashClassMap.success, 'Analysis Profile');
    });

    it('can cancel editing a profile', () => {
      cy.get('li.list-group-item').contains(/^host default$/i).click();
      cy.toolbar('Configuration', 'Edit this Analysis Profile');
      cy.get('input[name="description"]').clear().type('This will be cancelled');
      cy.get('.ap-form > form > .cds--btn-set').contains('button', 'Cancel').scrollIntoView().click();
      cy.expect_flash(flashClassMap.warning, 'cancelled');
      cy.get('.ap-form').should('not.exist');
    });
  });

  describe('Copy Analysis Profile', () => {
    it('can copy an existing VM analysis profile', () => {
      cy.get('li.list-group-item').contains(/^sample$/i).click();
      cy.toolbar('Configuration', 'Copy this selected Analysis Profile');
      cy.get('.ap-form').should('be.visible');
      cy.get('input[name="name"]').invoke('val').should('contain', 'Copy of');
      cy.get('input[name="name"]').clear().type('Cypress Copied Profile');
      cy.contains('button[type="submit"]', 'Add').click();
      cy.expect_flash(flashClassMap.success, 'Analysis Profile');
      cy.contains('Cypress Copied Profile').should('be.visible');
    });
  });

  describe('Delete Analysis Profile', () => {
    it('can delete an analysis profile', () => {
      cy.toolbar('Configuration', 'Add VM Analysis Profile');
      cy.get('input[name="name"]').type('Profile to Delete');
      cy.get('input[name="description"]').type('Test profile for deletion');
      cy.get('#check_system').check({ force: true });
      cy.contains('button[type="submit"]', 'Add').click();
      cy.expect_flash(flashClassMap.success, 'Analysis Profile');
      cy.contains('Profile to Delete').click();
      cy.toolbar('Configuration', 'Delete this Analysis Profile');
      cy.on('window:confirm', () => true);
      cy.expect_flash(flashClassMap.success, 'delete');
    });
  });

  describe('Form Interactions', () => {
    it('maintains form state when switching tabs', () => {
      cy.toolbar('Configuration', 'Add VM Analysis Profile');
      cy.get('input[name="name"]').scrollIntoView().type('Tab Switch Test');
      cy.get('#check_system').scrollIntoView().check({ force: true });
      cy.contains('button', 'File').scrollIntoView().click();
      // Open modal and add file
      cy.contains('.ap-form-file button', 'Add File').scrollIntoView().click();
      cy.get('#fileName').scrollIntoView().type('/etc/passwd');
      cy.get('.cds--modal.is-visible').contains('button[type="submit"]', 'Add').click();
      cy.contains('button', 'Category').scrollIntoView().click();
      cy.get('#check_system').scrollIntoView().should('be.checked');
      cy.contains('button', 'File').scrollIntoView().click();
      cy.contains('/etc/passwd').scrollIntoView().should('be.visible');
    });

    it('can add multiple entries of the same type', () => {
      cy.toolbar('Configuration', 'Add VM Analysis Profile');
      cy.contains('button', 'File').click();
      const files = ['/etc/hosts', '/etc/passwd', '/var/log/messages', '/tmp/test.log'];
      files.forEach((file) => {
        cy.contains('.ap-form-file button', 'Add File').click();
        cy.get('#fileName').type(file);
        cy.get('.cds--modal.is-visible').contains('button[type="submit"]', 'Add').click();
        cy.contains(file).should('be.visible');
      });
      files.forEach((file) => {
        cy.contains(file).should('be.visible');
      });
    });

    it('clears form fields after adding an entry', () => {
      cy.toolbar('Configuration', 'Add VM Analysis Profile');
      cy.contains('button', 'File').click();
      // Open modal, add entry, and verify modal closes
      cy.contains('.ap-form-file button', 'Add File').click();
      cy.get('#fileName').type('/etc/hosts');
      cy.get('#fileContent').check({ force: true });
      cy.get('.cds--modal.is-visible').contains('button[type="submit"]', 'Add').click();
      // Open modal again and verify fields are clear
      cy.contains('.ap-form-file button', 'Add File').click();
      cy.get('#fileName').should('have.value', '');
      cy.get('#fileContent').should('not.be.checked');
      cy.get('.cds--modal.is-visible').contains('button[type="button"]', 'Cancel').click();
    });

    it('shows Update button when editing an entry', () => {
      cy.toolbar('Configuration', 'Add VM Analysis Profile');
      cy.contains('button', 'File').click();
      // Open modal and add entry
      cy.contains('.ap-form-file button', 'Add File').click();
      cy.get('#fileName').type('/etc/hosts');
      cy.get('.cds--modal.is-visible').contains('button[type="submit"]', 'Add').click();
      // Click row to edit
      cy.get('.cds--data-table tbody tr').contains('/etc/hosts').parents('tr').click();
      cy.get('.cds--modal.is-visible').contains('button[type="submit"]', 'Update').should('be.visible');
      cy.get('.cds--modal.is-visible').contains('button[type="button"]', 'Cancel').should('be.visible');
    });

    it('can cancel editing an entry', () => {
      cy.toolbar('Configuration', 'Add VM Analysis Profile');
      cy.contains('button', 'File').click();
      // Open modal and add entry
      cy.contains('.ap-form-file button', 'Add File').click();
      cy.get('#fileName').type('/etc/hosts');
      cy.get('.cds--modal.is-visible').contains('button[type="submit"]', 'Add').click();
      // Click row to edit
      cy.get('.cds--data-table tbody tr').contains('/etc/hosts').parents('tr').click();
      cy.get('#fileName').clear().type('/var/log/messages');
      cy.get('.cds--modal.is-visible').contains('button[type="button"]', 'Cancel').click();
      cy.contains('/etc/hosts').should('be.visible');
      cy.contains('/var/log/messages').should('not.exist');
      cy.contains('.ap-form-file button', 'Add File').should('be.visible');
    });
  });

  afterEach(() => {
    cy.appDbState('restore');
  });
});
