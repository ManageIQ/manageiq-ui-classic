import { flashClassMap } from '../../../../support/assertions/assertion_constants';

// Menu options
const SETTINGS_MENU_OPTION = 'Settings';
const APP_SETTINGS_MENU_OPTION = 'Application Settings';

// Accordion items
const SETTINGS_ACCORDION_ITEM = 'Settings';
const MANAGEIQ_REGION_ACCORD_ITEM = /^ManageIQ Region:/;

// Tab names
const ADVANCED_TAB = 'Advanced';

// API URLs
const DATA_URL = '/ops/settings_advanced_tab_data*';
const SAVE_URL = '/ops/settings_advanced_save';

// Sample YAML payloads
const SAMPLE_YAML = ':workers:\n  :worker_base:\n    :count: 2\n';

function navigateToAdvancedTab() {
  cy.login();
  cy.menu(SETTINGS_MENU_OPTION, APP_SETTINGS_MENU_OPTION);
  cy.accordion(SETTINGS_ACCORDION_ITEM);
  cy.selectAccordionItem([MANAGEIQ_REGION_ACCORD_ITEM]);
  cy.tabs({ tabLabel: ADVANCED_TAB });
}

// Stub the data endpoint so tests do not depend on live YAML content
function mockDataApi(yaml = SAMPLE_YAML, aliasName = 'getAdvancedData') {
  cy.intercept('GET', DATA_URL, {
    statusCode: 200,
    body: { file_data: yaml },
  }).as(aliasName);
}

describe('Settings > Application Settings > Advanced tab', () => {
  describe('Page load', () => {
    beforeEach(() => {
      mockDataApi();
      navigateToAdvancedTab();
      cy.wait('@getAdvancedData');
    });

    it('renders the warning and info notifications', () => {
      cy.get('.settings-advanced-tab .cds--inline-notification--warning').should('be.visible');
      cy.get('.settings-advanced-tab .cds--inline-notification--info').should('be.visible');
    });

    it('renders the YAML code editor', () => {
      // The code-editor field is present in the form
      cy.get('.settings-advanced-tab').should('be.visible');
      cy.get('.settings-advanced-tab .CodeMirror, .settings-advanced-tab [data-testid="code-editor"], .settings-advanced-tab textarea#fileData')
        .should('exist');
    });

    it('Save button is disabled when form is pristine', () => {
      cy.getFormButtonByTypeWithText({ buttonText: 'Save', buttonType: 'submit' })
        .scrollIntoView()
        .should('be.disabled');
    });

    it('Reset button is present', () => {
      cy.contains('.settings-advanced-tab button', 'Reset')
        .scrollIntoView()
        .should('be.visible');
    });
  });

  describe('Data endpoint — resource_type forwarding', () => {
    it('requests region data when the region node is selected', () => {
      cy.intercept('GET', DATA_URL).as('dataRequest');
      navigateToAdvancedTab();
      cy.wait('@dataRequest').its('request.url').should('include', 'resource_type=region');
    });
  });

  describe('Save success', () => {
    beforeEach(() => {
      mockDataApi();
      navigateToAdvancedTab();
      cy.wait('@getAdvancedData');
    });

    it('shows a success flash and re-fetches YAML after saving', () => {
      cy.intercept('POST', SAVE_URL, {
        statusCode: 200,
        body: { success: true, message: 'Configuration changes saved' },
      }).as('saveRequest');

      // Also stub the subsequent re-fetch triggered by the component after save
      cy.intercept('GET', DATA_URL, {
        statusCode: 200,
        body: { file_data: SAMPLE_YAML },
      }).as('refetch');

      // Type into the CodeMirror editor so DDF marks the form as dirty
      cy.get('.settings-advanced-tab .CodeMirror-lines').click().type(' ');

      cy.getFormButtonByTypeWithText({ buttonText: 'Save', buttonType: 'submit' })
        .scrollIntoView()
        .click();

      cy.wait('@saveRequest').its('request.body').should('include', { resource_type: 'region' });
      cy.expect_flash(flashClassMap.success, 'Configuration changes saved');
      cy.wait('@refetch');
    });
  });

  describe('Save failure — invalid YAML', () => {
    beforeEach(() => {
      mockDataApi();
      navigateToAdvancedTab();
      cy.wait('@getAdvancedData');
    });

    it('shows an inline error notification when the server returns 422', () => {
      cy.intercept('POST', SAVE_URL, {
        statusCode: 422,
        body: { success: false, message: 'Refresh Interval: must be greater than 0' },
      }).as('saveError');

      // Type into the CodeMirror editor so DDF marks the form as dirty
      cy.get('.settings-advanced-tab .CodeMirror-lines').click().type(' ');

      cy.getFormButtonByTypeWithText({ buttonText: 'Save', buttonType: 'submit' })
        .scrollIntoView()
        .click();

      cy.wait('@saveError');
      cy.get('.settings-advanced-tab .cds--inline-notification--error').should('be.visible');
    });
  });

  describe('Reset', () => {
    beforeEach(() => {
      mockDataApi();
      navigateToAdvancedTab();
      cy.wait('@getAdvancedData');
    });

    it('re-fetches YAML from the server when Reset is clicked', () => {
      // Dirty the form first so the Reset button becomes enabled
      cy.get('.settings-advanced-tab .CodeMirror-lines').click().type(' ');

      // Stub the reload triggered by onReset
      cy.intercept('GET', DATA_URL, {
        statusCode: 200,
        body: { file_data: SAMPLE_YAML },
      }).as('resetFetch');

      cy.contains('.settings-advanced-tab button', 'Reset')
        .scrollIntoView()
        .should('not.be.disabled')
        .click();
      cy.wait('@resetFetch');
    });
  });

  describe('Load failure', () => {
    it('shows an error notification when the data endpoint fails', () => {
      cy.intercept('GET', DATA_URL, { statusCode: 500 }).as('dataError');
      navigateToAdvancedTab();
      cy.wait('@dataError');
      cy.get('.settings-advanced-tab .cds--inline-notification--error')
        .should('be.visible')
        .and('contain', 'Failed to load');
    });
  });
});
