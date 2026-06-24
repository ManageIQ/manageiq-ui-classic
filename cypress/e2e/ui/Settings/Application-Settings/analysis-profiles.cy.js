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
      cy.get('#file-name').type('/etc/hosts');
      cy.get('#file-content').check({ force: true });
      cy.contains('.ap-form-file button', 'Add').click();
      cy.contains('/etc/hosts').should('be.visible');
      cy.contains('true').should('be.visible');
      cy.get('#file-name').type('/var/log/messages');
      cy.contains('.ap-form-file button', 'Add').click();
      cy.contains('/var/log/messages').should('be.visible');
      cy.contains('button', 'Registry').click();
      cy.get('#reg-key').type('Software\\Microsoft\\Windows');
      cy.get('#reg-value').type('CurrentVersion');
      cy.contains('.ap-form-registry button', 'Add').click();
      cy.contains('Software\\Microsoft\\Windows').should('be.visible');
      cy.contains('CurrentVersion').should('be.visible');
      cy.contains('button', 'Event Log').click();
      cy.get('#eventlog-name').type('Application');
      cy.get('#eventlog-message').type('Error');
      cy.get('#eventlog-level').type('Error');
      cy.get('#eventlog-source').type('TestApp');
      cy.get('#eventlog-numdays').type('7');
      cy.contains('.ap-form-eventlog button', 'Add').click();
      cy.contains('Application').should('be.visible');
      cy.contains('button[type="submit"]', 'Add').click();
      cy.expect_flash(flashClassMap.success, 'Analysis Profile');
      cy.contains('Cypress Test VM Profile').should('be.visible');
    });

    it('validates required name field', () => {
      cy.toolbar('Configuration', 'Add VM Analysis Profile');
      cy.contains('button[type="submit"]', 'Add').should('be.disabled');
      cy.get('input[name="name"]').type('Test Name');
      cy.contains('button[type="submit"]', 'Add').should('be.enabled');
      cy.get('input[name="name"]').clear();
      cy.contains('button[type="submit"]', 'Add').should('be.disabled');
    });

    it('validates at least one item must be entered', () => {
      cy.toolbar('Configuration', 'Add VM Analysis Profile');
      cy.get('input[name="name"]').type('Empty Profile');
      cy.contains('button[type="submit"]', 'Add').click();
      cy.expect_flash(flashClassMap.error, 'At least one item must be entered');
    });

    it('validates file entry fields', () => {
      cy.toolbar('Configuration', 'Add VM Analysis Profile');
      cy.contains('button', 'File').click();
      cy.contains('.ap-form-file button', 'Add').click();
      cy.expect_flash(flashClassMap.error, 'File Entry is required');
    });

    it('validates registry entry fields', () => {
      cy.toolbar('Configuration', 'Add VM Analysis Profile');
      cy.contains('button', 'Registry').click();
      cy.contains('.ap-form-registry button', 'Add').click();
      cy.expect_flash(flashClassMap.error, 'Registry Entry is required');
    });

    it('validates event log entry fields', () => {
      cy.toolbar('Configuration', 'Add VM Analysis Profile');
      cy.contains('button', 'Event Log').click();
      cy.contains('.ap-form-eventlog button', 'Add').click();
      cy.expect_flash(flashClassMap.error, 'Event log name is required');
    });

    it('can edit entries before submitting', () => {
      cy.toolbar('Configuration', 'Add VM Analysis Profile');
      cy.contains('button', 'File').click();
      cy.get('#file-name').type('/etc/hosts');
      cy.contains('.ap-form-file button', 'Add').click();
      cy.contains('/etc/hosts').should('be.visible');
      cy.get('.cds--data-table tbody tr').contains('/etc/hosts').parents('tr').click();
      cy.get('#file-name').should('have.value', '/etc/hosts');
      cy.get('#file-name').clear().type('/var/log/syslog');
      cy.get('#file-content').check({ force: true });
      cy.contains('.ap-form-file button', 'Update').click();
      cy.contains('/var/log/syslog').should('be.visible');
      cy.contains('/etc/hosts').should('not.exist');
      cy.contains('button', 'Cancel').click();
      cy.expect_flash(flashClassMap.warning, 'cancelled');
    });

    it('can cancel adding a profile', () => {
      cy.toolbar('Configuration', 'Add VM Analysis Profile');
      cy.get('input[name="name"]').type('Profile to Cancel');
      cy.contains('button', 'Cancel').click();
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
      cy.get('#file-name').type('/var/log/messages');
      cy.contains('.ap-form-file button', 'Add').click();
      cy.contains('/var/log/messages').should('be.visible');
      cy.contains('button', 'Event Log').click();
      cy.get('#eventlog-name').type('System');
      cy.contains('.ap-form-eventlog button', 'Add').click();
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
      cy.get('#file-name').type('/tmp/cypress-test.log');
      cy.contains('.ap-form-file button', 'Add').click();
      cy.contains('/tmp/cypress-test.log').scrollIntoView().should('be.visible');
      cy.contains('button[type="submit"]', 'Save').click();
      cy.expect_flash(flashClassMap.success, 'Analysis Profile');
    });

    it('can cancel editing a profile', () => {
      cy.get('li.list-group-item').contains(/^host default$/i).click();
      cy.toolbar('Configuration', 'Edit this Analysis Profile');
      cy.get('input[name="description"]').clear().type('This will be cancelled');
      cy.contains('button', 'Cancel').scrollIntoView().click();
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
      cy.get('#file-name').scrollIntoView().type('/etc/passwd');
      cy.contains('.ap-form-file button', 'Add').scrollIntoView().click();
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
        cy.get('#file-name').type(file);
        cy.contains('.ap-form-file button', 'Add').click();
        cy.contains(file).should('be.visible');
      });
      files.forEach((file) => {
        cy.contains(file).should('be.visible');
      });
    });

    it('clears form fields after adding an entry', () => {
      cy.toolbar('Configuration', 'Add VM Analysis Profile');
      cy.contains('button', 'File').click();
      cy.get('#file-name').type('/etc/hosts');
      cy.get('#file-content').check({ force: true });
      cy.contains('.ap-form-file button', 'Add').click();
      cy.get('#file-name').should('have.value', '');
      cy.get('#file-content').should('not.be.checked');
    });

    it('shows Update and Cancel buttons when editing an entry', () => {
      cy.toolbar('Configuration', 'Add VM Analysis Profile');
      cy.contains('button', 'File').click();
      cy.get('#file-name').type('/etc/hosts');
      cy.contains('.ap-form-file button', 'Add').click();
      cy.get('.cds--data-table tbody tr').contains('/etc/hosts').parents('tr').click();
      cy.contains('.ap-form-file button', 'Update').should('be.visible');
      cy.contains('.ap-form-file button', 'Cancel').should('be.visible');
      cy.contains('.ap-form-file button', 'Add').should('not.exist');
    });

    it('can cancel editing an entry', () => {
      cy.toolbar('Configuration', 'Add VM Analysis Profile');
      cy.contains('button', 'File').click();
      cy.get('#file-name').type('/etc/hosts');
      cy.contains('.ap-form-file button', 'Add').click();
      cy.get('.cds--data-table tbody tr').contains('/etc/hosts').parents('tr').click();
      cy.get('#file-name').clear().type('/var/log/messages');
      cy.contains('.ap-form-file button', 'Cancel').click();
      cy.contains('/etc/hosts').should('be.visible');
      cy.contains('/var/log/messages').should('not.exist');
      cy.contains('.ap-form-file button', 'Add').should('be.visible');
      cy.get('#file-name').should('have.value', '');
    });
  });

  afterEach(() => {
    cy.appDbState('restore');
  });
});
