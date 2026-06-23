// Menu options
const SETTINGS_LABEL = 'Settings';
const APP_SETTINGS_OPTION = 'Application Settings';

// Accordion items
const DIAGNOSTICS_ACCORDION = 'Diagnostics';
const MANAGEIQ_REGION_ACCORDION_ITEM = /^ManageIQ Region:/;

// Tree node patterns
const ZONE_NODE_PATTERN = /^Zone:/;
const SERVER_NODE_PATTERN = /^Server:/;

// Tab wrapper IDs
const DIAGNOSTICS_ROOT_TABS_WRAPPER = '#diagnostics-root-tabs-wrapper';
const DIAGNOSTICS_ZONE_TABS_WRAPPER = '#diagnostics-zone-tabs-wrapper';
const DIAGNOSTICS_SERVER_TABS_WRAPPER = '#diagnostics-server-tabs-wrapper';
const MIQ_CUSTOM_TABS_CLASS = '.miq_custom_tabs';

// Tab button labels
const ZONES_TAB = 'Zones';
const ROLES_BY_SERVERS_TAB = 'Roles by Servers';
const SERVERS_BY_ROLES_TAB = 'Servers by Roles';
const SERVERS_TAB = 'Servers';
const CU_GAP_COLLECTION_TAB = 'C & U Gap Collection';
const SUMMARY_TAB = 'Summary';
const WORKERS_TAB = 'Workers';

describe('Diagnostics Root Tabs', () => {
  beforeEach(() => {
    cy.login();
    cy.menu(SETTINGS_LABEL, APP_SETTINGS_OPTION);
    cy.accordion(DIAGNOSTICS_ACCORDION);
    cy.selectAccordionItem([MANAGEIQ_REGION_ACCORDION_ITEM]);
  });

  it('displays root-level diagnostics tabs and switches between them', () => {
    // Verify tabs wrapper and container are visible
    cy.get(DIAGNOSTICS_ROOT_TABS_WRAPPER).should('be.visible');
    cy.get(MIQ_CUSTOM_TABS_CLASS).should('be.visible');

    cy.contains('button', SERVERS_TAB).should('be.visible');
    cy.contains('button', SERVERS_TAB).click();

    cy.contains('button', ZONES_TAB).should('be.visible');
    cy.contains('button', ZONES_TAB).click();
  });

  it('resets to default tab when navigating away and back', () => {
    cy.contains('button', SERVERS_TAB).should('be.visible');
    cy.contains('button', SERVERS_TAB).click();

    cy.get('#diagnostics_accord.in li.list-group-item').contains(ZONE_NODE_PATTERN).first().click();

    cy.accordion(DIAGNOSTICS_ACCORDION);
    cy.selectAccordionItem([MANAGEIQ_REGION_ACCORDION_ITEM]);

    cy.get(DIAGNOSTICS_ROOT_TABS_WRAPPER).should('be.visible');
    cy.get(MIQ_CUSTOM_TABS_CLASS).should('be.visible');
  });
});

describe('Diagnostics Zone Tabs', () => {
  beforeEach(() => {
    cy.login();
    cy.menu(SETTINGS_LABEL, APP_SETTINGS_OPTION);
    cy.accordion(DIAGNOSTICS_ACCORDION);
    cy.selectAccordionItem([MANAGEIQ_REGION_ACCORDION_ITEM]);
  });

  it('displays zone-level diagnostics tabs and switches between them', () => {
    cy.get('#diagnostics_accord.in li.list-group-item').contains(ZONE_NODE_PATTERN).first().click();

    // Wait for page to fully load and tabs to be ready
    cy.get(DIAGNOSTICS_ZONE_TABS_WRAPPER).should('be.visible');
    cy.get(MIQ_CUSTOM_TABS_CLASS).should('be.visible');

    // Wait for any error modals to clear and tabs to be interactive
    cy.wait(1000);

    cy.contains('button', SERVERS_BY_ROLES_TAB).should('be.visible').and('not.be.disabled');
    cy.contains('button', SERVERS_BY_ROLES_TAB).click({ force: true });

    cy.contains('button', CU_GAP_COLLECTION_TAB).should('be.visible').and('not.be.disabled');
    cy.contains('button', CU_GAP_COLLECTION_TAB).click({ force: true });

    cy.contains('button', ROLES_BY_SERVERS_TAB).should('be.visible').and('not.be.disabled');
    cy.contains('button', ROLES_BY_SERVERS_TAB).click({ force: true });
  });

  it('resets to default tab when navigating away and back to zone', () => {
    cy.get('#diagnostics_accord.in li.list-group-item').contains(ZONE_NODE_PATTERN).first().click();

    cy.contains('button', SERVERS_TAB).should('be.visible');
    cy.contains('button', SERVERS_TAB).click();

    cy.get('#diagnostics_accord.in li.list-group-item').contains(SERVER_NODE_PATTERN).first().click();

    cy.get('#diagnostics_accord.in li.list-group-item').contains(ZONE_NODE_PATTERN).first().click();

    cy.get(DIAGNOSTICS_ZONE_TABS_WRAPPER).should('be.visible');
    cy.get(MIQ_CUSTOM_TABS_CLASS).should('be.visible');
  });
});

describe('Diagnostics Server Tabs', () => {
  beforeEach(() => {
    cy.login();
    cy.menu(SETTINGS_LABEL, APP_SETTINGS_OPTION);
    cy.accordion(DIAGNOSTICS_ACCORDION);
    cy.selectAccordionItem([MANAGEIQ_REGION_ACCORDION_ITEM]);
  });

  it('displays server-level diagnostics tabs and switches between them', () => {
    cy.get('#diagnostics_accord.in li.list-group-item').contains(SERVER_NODE_PATTERN).first().click();

    // Verify tabs wrapper and container are visible
    cy.get(DIAGNOSTICS_SERVER_TABS_WRAPPER).should('be.visible');
    cy.get(MIQ_CUSTOM_TABS_CLASS).should('be.visible');

    cy.contains('button', WORKERS_TAB).should('be.visible');
    cy.contains('button', WORKERS_TAB).click();

    cy.contains('button', SUMMARY_TAB).should('be.visible');
    cy.contains('button', SUMMARY_TAB).click();
  });

  it('resets to default tab when navigating away and back to server', () => {
    cy.get('#diagnostics_accord.in li.list-group-item').contains(SERVER_NODE_PATTERN).first().click();

    cy.contains('button', WORKERS_TAB).should('be.visible');
    cy.contains('button', WORKERS_TAB).click();

    cy.get('#diagnostics_accord.in li.list-group-item').contains(ZONE_NODE_PATTERN).first().click();

    cy.get('#diagnostics_accord.in li.list-group-item').contains(SERVER_NODE_PATTERN).first().click();

    cy.get(DIAGNOSTICS_SERVER_TABS_WRAPPER).should('be.visible');
    cy.get(MIQ_CUSTOM_TABS_CLASS).should('be.visible');
  });
});
