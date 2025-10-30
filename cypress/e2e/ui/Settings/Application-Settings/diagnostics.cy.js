/* eslint-disable no-undef */

// Menu options
const SETTINGS_MENU_OPTION = 'Settings';
const APP_SETTINGS_MENU_OPTION = 'Application Settings';

// Accordion items
const DIAGNOSTICS_ACCORDION_ITEM = 'Diagnostics';
const MANAGEIQ_REGION_ACCORDION_ITEM = /^ManageIQ Region:/;

// Tab names
const DATABASE_TAB_LABEL = 'Database';

describe('Settings > Application Settings > Diagnostics', () => {
  beforeEach(() => {
    cy.login();
    cy.menu(SETTINGS_MENU_OPTION, APP_SETTINGS_MENU_OPTION);
    cy.accordion(DIAGNOSTICS_ACCORDION_ITEM);
  });

  describe('ManageIQ Region', () => {
    beforeEach(() => {
      cy.selectAccordionItem([MANAGEIQ_REGION_ACCORDION_ITEM]);
    });

    it('should navigate to the Database tab', () => {
      // Intercept the API call when clicking on the Database tab
      cy.interceptApi({
        alias: 'getDatabaseTabInfo',
        urlPattern: '/ops/change_tab?tab_id=diagnostics_database',
        triggerFn: () => cy.tabs({ tabLabel: DATABASE_TAB_LABEL }),
      });

      // Verify the Database tab content is loaded
      cy.get(`@getDatabaseTabInfo`).then((getCall) => {
        expect(getCall.state).to.equal('Complete');
      });

      // Verify we're on the Database tab
      cy.get('.tab-content').contains(DATABASE_TAB_LABEL).should('be.visible');
    });
  });
});
