import { flashClassMap } from '../../../../../support/assertions/assertion_constants';

// Menu options
const AUTOMATION_MENU_OPTION = 'Automation';
const EMBEDDED_AUTOMATION_MENU_OPTION = 'Embedded Automate';
const EXPLORER_MENU_OPTION = 'Explorer';
// Labels
const DATA_STORE_ACCORDION_LABEL = 'Datastore';
const DOMAIN_LABEL = 'Test_Domain';
const NAMESPACE_LABEL = 'Test_Namespace';
const CLASS_LABEL = 'Test_Class';
const NONE_OPTION_LABEL = 'None';
const MIQ_OPTION_LABEL = 'ManageIQ';
// Toolbar options
const TOOLBAR_CONFIGURATION = 'Configuration';
const TOOLBAR_ADD_NEW_METHOD = 'Add a New Method';
// Buttons
const ADD_METHOD_BUTTON_TEXT = 'Add Method';
// Selectors
const SELECT_METHODS_TABLE_ROW =
  '.cds--modal-content .miq-data-table.miq-inline-method-list tbody tr';

describe(`Automate operations on Namespaces: Automation -> Embedded Automate -> Explorer -> Methods`, () => {
  beforeEach(() => {
    cy.appFactories([['create', 'miq_ae_domain', { name: DOMAIN_LABEL }]]).then(
      (domainData) => {
        expect(domainData.length).to.equal(1);
        cy.appFactories([
          [
            'create',
            'miq_ae_namespace',
            { name: NAMESPACE_LABEL, domain_id: domainData?.[0].id },
          ],
        ]).then((namespaceData) => {
          expect(namespaceData.length).to.equal(1);
          cy.appFactories([
            [
              'create',
              'miq_ae_class',
              { name: CLASS_LABEL, namespace_id: namespaceData?.[0].id },
            ],
          ]).then((classData) => {
            expect(classData.length).to.equal(1);
          });
        });
      }
    );

    cy.login();
    cy.menu(
      AUTOMATION_MENU_OPTION,
      EMBEDDED_AUTOMATION_MENU_OPTION,
      EXPLORER_MENU_OPTION
    );
    cy.selectAccordionItem([
      DATA_STORE_ACCORDION_LABEL,
      DOMAIN_LABEL,
      NAMESPACE_LABEL,
      CLASS_LABEL,
    ]);
    cy.tabs({ tabLabel: 'Methods' });
    cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_ADD_NEW_METHOD);
    cy.get('.bootstrap-select').click();
    cy.contains('ul.dropdown-menu li', 'Inline').click();
    cy.contains(
      '#embedded_methods_div button.cds--accordion__heading',
      'Embedded Methods'
    ).should('be.visible');
  });

  it('Verifies API caching for modal load, search, and domain filter operations', () => {
    // Verify initial modal load caching:
    // 1. First modal open - triggers API calls for domains and methods (count: 1 each)
    // 2. Close and reopen modal within 60s - uses cached data, no new API calls (count: still 1 each)
    cy.intercept('GET', '/miq_ae_class/ae_domains').as('getDomainsData');
    cy.intercept('GET', '/miq_ae_class/ae_methods').as('getMethodsData');
    // First modal open - should trigger initial API calls
    cy.getFormButtonByTypeWithText({
      buttonText: ADD_METHOD_BUTTON_TEXT,
    }).click();
    cy.wait('@getDomainsData');
    cy.wait('@getMethodsData');
    cy.get('@getDomainsData.all').should('have.length', 1);
    cy.get('@getMethodsData.all').should('have.length', 1);
    cy.get('.cds--loading').should('not.exist');
    cy.expect_modal({
      modalHeaderText: 'Select methods',
      targetFooterButtonText: 'Cancel',
    });
    // Reopen modal within 60s - should use cached data, no new API calls
    cy.getFormButtonByTypeWithText({
      buttonText: ADD_METHOD_BUTTON_TEXT,
    }).click();
    cy.get('@getDomainsData.all').should('have.length', 1);
    cy.get('@getMethodsData.all').should('have.length', 1);

    // Verify search API caching and search functionality:
    // 1. First search for 'im' - triggers API call (count: 1)
    // 2. Re-search for 'im' - uses cache, no new API call (count: still 1)
    // 3. Search for 'vm' - different query, triggers new API call (count: 2)
    // 4. Search for 'unknown' - triggers API call, shows "No methods" message (count: 3)
    cy.intercept('GET', '/miq_ae_class/ae_methods?search=*').as(
      'searchMatchedMethods'
    );
    // First search: 'im' - should trigger API call and return results
    cy.get('input#search-method').type('im');
    cy.wait('@searchMatchedMethods');
    cy.get('@searchMatchedMethods.all').should('have.length', 1);
    cy.get(SELECT_METHODS_TABLE_ROW).should('have.length.greaterThan', 0);
    cy.get('.cds--modal-content .cds--search-close').click();
    // Re-search: 'im' - should use cached results, no new API call
    cy.get('input#search-method').type('im');
    cy.get('@searchMatchedMethods.all').should('have.length', 1);
    cy.get(SELECT_METHODS_TABLE_ROW).should('have.length.greaterThan', 0);
    cy.get('.cds--modal-content .cds--search-close').click();
    // New search: 'vm' - different query, should trigger new API call
    cy.get('input#search-method').type('vm');
    cy.wait('@searchMatchedMethods');
    cy.get('@searchMatchedMethods.all').should('have.length', 2);
    cy.get(SELECT_METHODS_TABLE_ROW).should('have.length.greaterThan', 0);
    cy.get('.cds--modal-content .cds--search-close').click();
    // Search with no results: 'unknown' - should trigger API call and show info message
    cy.get('input#search-method').type('unknown');
    cy.wait('@searchMatchedMethods');
    cy.expect_flash(flashClassMap.info, 'No methods');
    cy.get('.cds--modal-content .cds--search-close').click();

    // Verify domain filter API caching and filter functionality:
    // 1. Select 'Test_Domain' - triggers API call, shows "No methods" (count: 1)
    // 2. Select 'None' then re-select 'Test_Domain' - uses cache, no new API call (count: still 1)
    // 3. Select 'ManageIQ' domain - different domain, triggers new API call with results (count: 2)
    cy.intercept('GET', '/miq_ae_class/ae_methods?domain_id=*').as(
      'domainMatchedMethods'
    );
    // First domain filter: 'Test_Domain' - should trigger API call with no results
    cy.get('select#domain_id').select(DOMAIN_LABEL);
    cy.wait('@domainMatchedMethods');
    cy.get('@domainMatchedMethods.all').should('have.length', 1);
    cy.expect_flash(flashClassMap.info, 'No methods');
    // Re-select same domain: 'None' -> 'Test_Domain' - should use cached results, no new API call
    cy.get('select#domain_id').select(NONE_OPTION_LABEL);
    cy.get('select#domain_id').select(DOMAIN_LABEL);
    cy.get('@domainMatchedMethods.all').should('have.length', 1);
    // New domain filter: 'ManageIQ' - different domain, should trigger new API call with results
    cy.get('select#domain_id').select(MIQ_OPTION_LABEL);
    cy.wait('@domainMatchedMethods');
    cy.get('@domainMatchedMethods.all').should('have.length', 2);
    cy.get(SELECT_METHODS_TABLE_ROW).should('have.length.greaterThan', 0);
  });

  it('Verifies method selection and persistence in embedded methods table', () => {
    // Verify method selection workflow and state persistence:
    // 1. Open modal and select a method from the list
    // 2. Confirm selection - method should appear in embedded methods table
    // 3. Reopen modal - previously selected method should remain checked
    // Open modal and select first method
    cy.getFormButtonByTypeWithText({
      buttonText: ADD_METHOD_BUTTON_TEXT,
    }).click();
    cy.get('.cds--loading').should('not.exist');
    cy.get(
      `${SELECT_METHODS_TABLE_ROW} .cds--table-column-checkbox input`
    )
      .eq(0)
      .scrollIntoView()
      .check({ force: true });
    // Confirm selection
    cy.get('#embedded_methods_div .miq-data-table tbody tr').should(
      'have.length.greaterThan',
      0
    );
    cy.expect_modal({
      modalHeaderText: 'Selected methods',
      targetFooterButtonText: 'OK',
    });
    // Reopen modal and verify previously selected method remains checked
    cy.getFormButtonByTypeWithText({
      buttonText: ADD_METHOD_BUTTON_TEXT,
    }).click();
    cy.get(`${SELECT_METHODS_TABLE_ROW} .cds--table-column-checkbox input`)
      .eq(0)
      .scrollIntoView()
      .should('be.checked');
  });

  afterEach(() => {
    cy.appDbState('restore');
  });
});
