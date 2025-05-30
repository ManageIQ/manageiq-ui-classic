// /* eslint-disable no-undef */

// describe('Automation > Embedded Automate > Explorer > Domain > Namespace > Class > Schema', () => {
//   before(() => {
//     // Create a Domain and Namespace before all the tests
//     cy.login();
//     cy.intercept('POST', '/ops/accordion_select?id=rbac_accord').as('accordion');
//     cy.menu('Automation', 'Embedded Automate', 'Explorer');
//     cy.get('#explorer_title_text');

//     // Creates a Domain
//     cy.get('[title="Datastore"]').click();
//     cy.get('[title="Configuration"]').click();
//     cy.get('[title="Add a New Domain"]').click();
//     cy.get('[name="name"]').type('ABCDomain', {force: true});
//     cy.get('[name="description"]').type('This is a test domain');
//     cy.get('#enabled').check();
//     cy.get('[class="bx--btn bx--btn--primary"]').contains('Add').click();

//     // Check for the success message
//     cy.get('div.alert.alert-success.alert-dismissable').should('exist').and('contain', 'Automate Domain "ABCDomain" was added').find('button.close').should('exist');

//     // Creates a Namespace
//     cy.get('[title="Datastore"]').click();
//     cy.get('[title="Automate Domain: ABCDomain"]').click(); // Click on Domain
//     cy.get('[title="Configuration"]').click();
//     cy.get('[title="Add a New Namespace"]').click();
//     cy.get('[name="name"]').type('TestNameSpace', {force: true});
//     cy.get('[name="description"]').type('This is a test NameSpace');
//     cy.get('.bx--btn--primary').contains('Add').click();

//     // Wait for namespace to be visible
//     cy.get('[title="Automate Namespace: TestNameSpace"]', {timeout: 1000}).should('be.visible');

//     // Creates a Class
//     cy.get('[title="Datastore"]').click();
//     cy.get('[title="Automate Domain: ABCDomain"]').click(); // clicks on Domain
//     cy.get('[title="Automate Namespace: TestNameSpace"]').click(); // clicks on Namespace
//     cy.get('[title="Configuration"]').click();
//     cy.get('[title="Add a New Class"]').click();
//     cy.get('[name="name"]').type('TestClass', {force: true});
//     cy.get('.bx--btn--primary').contains('Add').click();

//     cy.get('[title="Automate Class "TestClass"]', {timeout: 1000}).should('be.visible');
   
//     // Navigate to the Schema tab of the class just created
//     cy.get('.clickable-row').contains('TestClass').click();
//     cy.get('#schema_tab > a').click();
//   });

//   // beforeEach(() => {
//   //   cy.login();
//   //   cy.intercept('POST', '/ops/accordion_select?id=rbac_accord').as('accordion');
//   //   cy.menu('Automation', 'Embedded Automate', 'Explorer');
//   //   cy.get('#explorer_title_text');
//   // });

//   describe('Schema Tab', () => {
//     it('Get edit schema configuration page', () => {
//       cy.get('[title="Configuration"]').click({force: true});
//       cy.get('[title="Edit selected Schema"]').click({force: true});
//       cy.get('[id="explorer_title_text"]').contains('Editing Class Schema "TestClass"');
//     });
//   });

//   after(() => {
//     // Remove the Domain after all the tests
//     cy.menu('Automation', 'Embedded Automate', 'Explorer');
//     cy.get('[title="Datastore"]').click({force: true});
//     cy.get('[title="Automate Domain: ABCDomain"]').click({force: true});
//     cy.get('[title="Configuration"]').click({force: true});
//     cy.get('[title="Remove this Domain"]').click({force: true});

//     cy.get('.bx--data-table-content tbody tr').should('not.contain', 'Automate Domain: ABCDomain');
//   });
// });
