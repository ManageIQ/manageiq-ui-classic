/* eslint-disable no-undef */

describe('Automation > Embedded Automate > Explorer', () => {
  beforeEach(() => {
    cy.login();
    cy.intercept('POST', '/ops/accordion_select?id=rbac_accord').as('accordion');
    cy.menu('Automation', 'Embedded Automate', 'Explorer');
    cy.get('#explorer_title_text');
  });

  afterEach(() => {
    // Remove Domain after each tests
    cy.get('[title="Datastore"]').click({force: true});
    cy.get('[title="Automate Domain: TestDomain"]').click({force: true});
    cy.get('[title="Configuration"]').click({force: true});
    cy.get('[title="Remove this Domain"]').click({force: true});

    cy.get('.bx--data-table-content tbody tr').should('not.contain', 'Automate Domain: TestDomain');
  });

  describe('Class Form', () => {
    it('Creates and edits an automate class', () => {
      // Creates a Domain
      cy.get('[title="Datastore"]').click({force: true});
      cy.get('[title="Configuration"]').click({force: true});
      cy.get('[title="Add a New Domain"]').click({force: true});
      cy.get('[name="name"]').type('TestDomain');
      cy.get('[name="description"]').type('This is a test domain');
      cy.get('#enabled').check();
      cy.get('[class="bx--btn bx--btn--primary"]').contains('Add').click(); // submits Domain
      // checks for the success message
      cy.get('div.alert.alert-success.alert-dismissable')
        .should('exist')
        .and('contain', 'Automate Domain "TestDomain" was added')
        .find('button.close').should('exist');

      // Creates a Namespace
      cy.get('[title="Datastore"]').click({force: true});
      cy.get('[title="Automate Domain: TestDomain"]').click({force: true}); // clicks on Domain
      cy.get('[title="Configuration"]').click({force: true});
      cy.get('[title="Add a New Namespace"]').click({force: true});
      cy.get('[name="name"]').type('TestNS');
      cy.get('[name="description"]').type('This is a test NS');
      cy.get('.bx--btn--primary').contains('Add').click(); // submits Namespace

      // Creates a Class
      cy.get('[title="Datastore"]').click({force: true});
      cy.get('[title="Automate Domain: TestDomain"]').click({force: true}); // clicks on Domain
      cy.get('[title="Automate Namespace: TestNS"]').click({force: true}); // clicks on Namespace
      cy.get('[title="Configuration"]').click({force: true});
      cy.get('[title="Add a New Class"]').click({force: true});
      cy.get('[name="name"]').type('TestClass');
      cy.get('[name="display_name"]').type('TC');
      cy.get('[name="description"').type('This is a test class desc');
      cy.get('.bx--btn--primary').contains('Add').click(); // submits class
      // checks for the success message
      cy.get('#flash_msg_div .alert.alert-success').should('exist')
        .and('be.visible').and('contain', 'Class "TestClass" was added');

      // Edits a class
      cy.get('[title="Automate Class: TC (TestClass)"]').click({force: true}); // clicks on the class
      cy.get('[title="Configuration"]').click({force: true});
      cy.get('[title="Edit this Class"]').click({force: true});
      cy.get('[name="display_name"]').clear({force: true});
      cy.get('[name="display_name"]').type('Edited TC', {force: true});
      cy.get('[name="description"').clear({force: true});
      cy.get('[name="description"').type('Edited Test Class Description');
      cy.get('[class="btnRight bx--btn bx--btn--primary"]').contains('Save').click({force: true});
      // Checks if class data was updated
      cy.get('#props_tab a').click(); // Navigate to the Properties tab
      cy.get('div.label_header:contains("Name")').siblings('.content_value')
        .should('contain', 'TestClass');
      cy.get('div.label_header:contains("Display Name")').siblings('.content_value')
        .should('contain', 'Edited TC');
      cy.get('div.label_header:contains("Description")').siblings('.content_value')
        .should('contain', 'Edited Test Class Description');

      // Clicks the Cancel button during class creation
      cy.get('[title="Datastore"]').click({force: true});
      cy.get('[title="Automate Domain: TestDomain"]').click({force: true});
      cy.get('[title="Automate Namespace: TestNS"]').click({force: true});
      cy.get('[title="Configuration"]').click({force: true});
      cy.get('[title="Add a New Class"]').click({force: true});
      cy.get('[class="bx--btn bx--btn--secondary"]')
        .contains('Cancel').click({force: true}); // clicks Cancel button
      cy.get('[id="explorer_title_text"]').contains('Automate Namespace "TestNS"');

      // Clicks the Cancel button during class update
      cy.get('[title="Automate Class: Edited TC (TestClass)"]').click({force: true}); // clicks on the class
      cy.get('[title="Configuration"]').click({force: true});
      cy.get('[title="Edit this Class"]').click({force: true});
      cy.get('[name="description"]').clear({force: true});
      cy.get('[name="description"]').type('New description for class', {force: true});
      cy.get('[class="bx--btn bx--btn--secondary"]').contains('Cancel').click({force: true});
      // Checks if class data was updated
      cy.get('#props_tab a').click(); // Navigate to the Properties tab
      cy.get('div.label_header:contains("Description")').siblings('.content_value')
        .should('not.contain', 'New description for class')
        .should('contain', 'Edited Test Class Description');

      // Clicks the Reset button during class update
      cy.get('[title="Automate Class: Edited TC (TestClass)"]').click({force: true}); // clicks on the class
      cy.get('[title="Configuration"]').click({force: true});
      cy.get('[title="Edit this Class"]').click({force: true});
      cy.get('[name="description"]').clear({force: true});
      cy.get('[name="description"]').type('New description for class', {force: true});
      cy.get('[class="btnRight bx--btn bx--btn--secondary"]').contains('Reset').click({force: true});
      // Check for the flash message div
      cy.get('#flash_msg_div .alert.alert-warning').should('exist')
        .and('be.visible').and('contain', 'All changes have been reset');
      // Checks if class data was updated
      cy.get('[name="description"]').should('have.value', 'Edited Test Class Description');
      cy.get('[class="bx--btn bx--btn--secondary"]').contains('Cancel').click({force: true});

      // Removes class
      cy.get('[title="Automate Class: Edited TC (TestClass)"]').click({force: true}); // clicks on the class
      cy.get('[title="Configuration"]').click({force: true});
      cy.get('[title="Remove this Class"]').click({force: true});
      // checks for the success message
      cy.get('div.alert.alert-success.alert-dismissable')
        .should('exist')
        .and('contain', 'Automate Class "TestClass": Delete successful');
    });
  });
});
