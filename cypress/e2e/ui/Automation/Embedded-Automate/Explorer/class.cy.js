/* eslint-disable no-undef */

describe('Automation > Embedded Automate > Explorer', () => {
  before(() => {
    // Create a Domain and Namespace before all the tests
    cy.login();
    cy.intercept('POST', '/ops/accordion_select?id=rbac_accord').as('accordion');
    cy.menu('Automation', 'Embedded Automate', 'Explorer');
    cy.get('#explorer_title_text');

    // Creates a Domain
    cy.get('[title="Datastore"]').click();
    cy.get('[title="Configuration"]').click();
    cy.get('[title="Add a New Domain"]').click();
    cy.get('[name="name"]').type('TestDomain', {force: true});
    cy.get('[name="description"]').type('This is a test domain');
    cy.get('#enabled').check();
    cy.get('[class="bx--btn bx--btn--primary"]').contains('Add').click();

    // Check for the success message
    cy.get('div.alert.alert-success.alert-dismissable').should('exist').and('contain', 'Automate Domain "TestDomain" was added').find('button.close').should('exist');

    // Creates a Namespace
    cy.get('[title="Datastore"]').click();
    cy.get('[title="Automate Domain: TestDomain"]').click(); // Click on Domain
    cy.get('[title="Configuration"]').click();
    cy.get('[title="Add a New Namespace"]').click();
    cy.get('[name="name"]').type('TestNameSpace', {force: true});
    cy.get('[name="description"]').type('This is a test NameSpace');
    cy.get('.bx--btn--primary').contains('Add').click();

    cy.wait(1000); // Need this wait or else namespace doesn't get added properly
  });

  beforeEach(() => {
    cy.login();
    cy.intercept('POST', '/ops/accordion_select?id=rbac_accord').as('accordion');
    cy.menu('Automation', 'Embedded Automate', 'Explorer');
    cy.get('#explorer_title_text');
  });

  describe('Class Form', () => {
    it('Cancel button works on the form', () => {
      // Clicks the Cancel button on the create class form
      cy.get('[title="Datastore"]').click();
      cy.get('[title="Automate Domain: TestDomain"]').click();
      cy.get('[title="Automate Namespace: TestNameSpace"]').click();
      cy.get('[title="Configuration"]').click();
      cy.get('[title="Add a New Class"]').click();
      cy.get('[class="bx--btn bx--btn--secondary"]').contains('Cancel').click(); // clicks Cancel button

      // Make sure that the cancel button redirects back to the namespace page
      cy.get('[id="explorer_title_text"]').contains('Automate Namespace "TestNameSpace"');
      cy.get('.flash_text_div > .alert').contains('Add of new Class was cancelled by the user');
      cy.get('#ns_details_div > .alert').contains('The selected Namespace is empty');
    });

    it('Reset button works on the form', () => {
      // Creates a Class
      cy.get('[title="Datastore"]').click();
      cy.get('[title="Automate Domain: TestDomain"]').click(); // clicks on Domain
      cy.get('[title="Automate Namespace: TestNameSpace"]').click(); // clicks on Namespace
      cy.get('[title="Configuration"]').click();
      cy.get('[title="Add a New Class"]').click();
      cy.get('[name="name"]').type('TestClass', {force: true});
      cy.get('[name="display_name"]').type('Test Class 0');
      cy.get('[name="description"').type('This is a test class description');
      cy.get('.bx--btn--primary').contains('Add').click();

      // Check for the success message
      cy.get('#flash_msg_div .alert.alert-success').should('exist').and('be.visible').and('contain', 'Class "TestClass" was added');

      // Navigate to the Properties tab of the class just created
      cy.get('.clickable-row').contains('Test Class 0').click();
      cy.get('#props_tab > a').click();

      // Edits the class
      cy.get('[title="Configuration"]').click();
      cy.get('[title="Edit this Class"]').click();
      cy.get('[name="name"]').type('Edit', {force: true});
      cy.get('[name="display_name"]').clear().type('Edited Test Class');
      cy.get('[name="description"').clear().type('Edited test class description');

      // Click Reset Button
      cy.get('.btnRight.bx--btn--secondary').contains('Reset').click();

      // Verify that the form was reset
      cy.get('.flash_text_div > .alert').contains('All changes have been reset');
      cy.get('[name="name"]').should('have.value', 'TestClass');
      cy.get('[name="display_name"]').should('have.value', 'Test Class 0');
      cy.get('[name="description"]').should('have.value', 'This is a test class description');

      // Click Cancel button
      cy.get('[class="bx--btn bx--btn--secondary"]').contains('Cancel').click();

      // Removes class
      cy.get('[title="Configuration"]').click();
      cy.get('[title="Remove this Class"]').click();

      // Verify that the class was removed
      cy.get('div.alert.alert-success.alert-dismissable').should('exist').and('contain', 'Automate Class "TestClass": Delete successful');
      cy.get('#ns_details_div > .alert').contains('The selected Namespace is empty');
    });

    it('Form validation works', () => {
      // Try to create a Class with an invalid name
      cy.get('[title="Datastore"]').click();
      cy.get('[title="Automate Domain: TestDomain"]').click(); // clicks on Domain
      cy.get('[title="Automate Namespace: TestNameSpace"]').click(); // clicks on Namespace

      cy.get('[title="Configuration"]').click();
      cy.get('[title="Add a New Class"]').click();
      cy.get('[name="name"]').type('Test Class', {force: true});
      cy.get('[name="display_name"]').type('Test Class 0');
      cy.get('[name="description"').type('This is a test class description');

      // Verify that error message appears
      cy.get('#name-error-msg').contains('Name may contain only alphanumeric and _ . - characters');
      cy.get('.btnRight').should('be.disabled');

      // Enter a valid name
      cy.get('[name="name"]').clear({force: true}).type('TestClass');
      cy.get('.btnRight').click();

      cy.get('#flash_msg_div .alert.alert-success').should('exist').and('be.visible').and('contain', 'Class "TestClass" was added');

      // Navigate to the Properties tab of the class just created
      cy.get('.clickable-row').contains('Test Class 0').click();
      cy.get('#props_tab > a').click();

      // Verify that the class created correctly
      cy.get(':nth-child(1) > .label_header').contains('Fully Qualified Name');
      cy.get(':nth-child(1) > .content_value').contains('/ TestDomain / TestNameSpace / TestClass');
      cy.get(':nth-child(2) > .label_header').contains('Name');
      cy.get(':nth-child(2) > .content_value').contains('TestClass');
      cy.get(':nth-child(3) > .label_header').contains('Display Name');
      cy.get(':nth-child(3) > .content_value').contains('Test Class 0');
      cy.get(':nth-child(4) > .label_header').contains('Description');
      cy.get(':nth-child(4) > .content_value').contains('This is a test class description');
      cy.get(':nth-child(5) > .label_header').contains('Instances');
      cy.get(':nth-child(5) > .content_value').contains('0');

      cy.get('.list-group-item').then((listItems) => {
        const nums = [...Array(listItems.length).keys()];
        nums.forEach((index) => {
          if (listItems[index].innerText === 'TestNameSpace') {
            cy.get(listItems[index]).click();
          }
        });
      });

      // Try to create a Class with the same name
      cy.get('[title="Configuration"]').click();
      cy.get('[title="Add a New Class"]').click();
      cy.get('[name="name"]').type('TestClass', {force: true});
      cy.get('[name="display_name"]').type('Test Class 1');
      cy.get('[name="description"').type('This is a test class description');
      cy.get('.btnRight').click();

      // Verify that error message appears
      cy.get('.alert').contains('Name has already been taken');

      // Enter a new name
      cy.get('[name="name"]').clear({force: true}).type('NewTestClass', {force: true});
      cy.get('.btnRight').click();

      // Check for the success message
      cy.get('#flash_msg_div .alert.alert-success').should('exist').and('be.visible').and('contain', 'Class "NewTestClass" was added');

      // Navigate to the Properties tab of the class just created
      cy.get('.clickable-row').contains('Test Class 1').click();
      cy.get('#props_tab > a').click();

      // Verify that the class created correctly
      cy.get(':nth-child(1) > .label_header').contains('Fully Qualified Name');
      cy.get(':nth-child(1) > .content_value').contains('/ TestDomain / TestNameSpace / NewTestClass');
      cy.get(':nth-child(2) > .label_header').contains('Name');
      cy.get(':nth-child(2) > .content_value').contains('NewTestClass');
      cy.get(':nth-child(3) > .label_header').contains('Display Name');
      cy.get(':nth-child(3) > .content_value').contains('Test Class 1');
      cy.get(':nth-child(4) > .label_header').contains('Description');
      cy.get(':nth-child(4) > .content_value').contains('This is a test class description');
      cy.get(':nth-child(5) > .label_header').contains('Instances');
      cy.get(':nth-child(5) > .content_value').contains('0');

      // Removes class
      cy.get('[title="Configuration"]').click();
      cy.get('[title="Remove this Class"]').click();

      // Verify that the class was removed
      cy.get('div.alert.alert-success.alert-dismissable').should('exist').and('contain', 'Automate Class "NewTestClass": Delete successful');

      // Navigate to the Properties tab of the first class just created
      cy.get('.clickable-row').contains('Test Class 0').click();

      // Removes class
      cy.get('[title="Configuration"]').click();
      cy.get('[title="Remove this Class"]').click();

      // Verify that the class was removed
      cy.get('div.alert.alert-success.alert-dismissable').should('exist').and('contain', 'Automate Class "TestClass": Delete successful');
      cy.get('#ns_details_div > .alert').contains('The selected Namespace is empty');
    });

    it('Creates and edits an automate class', () => {
      // Creates a Class
      cy.get('[title="Datastore"]').click({force: true});
      cy.get('[title="Automate Domain: TestDomain"]').click({force: true}); // clicks on Domain
      cy.get('[title="Automate Namespace: TestNameSpace"]').click({force: true}); // clicks on Namespace
      cy.get('[title="Configuration"]').click({force: true});
      cy.get('[title="Add a New Class"]').click({force: true});
      cy.get('[name="name"]').type('TestClass', {force: true});
      cy.get('[name="display_name"]').type('Test Class 0');
      cy.get('[name="description"').type('This is a test class description');
      cy.get('.bx--btn--primary').contains('Add').click();

      // Check for the success message
      cy.get('#flash_msg_div .alert.alert-success').should('exist').and('be.visible').and('contain', 'Class "TestClass" was added');

      // Navigate to the Properties tab of the class just created
      cy.get('.clickable-row').contains('Test Class 0').click();
      cy.get('#props_tab > a').click();

      // Verify that the class created correctly
      cy.get(':nth-child(1) > .label_header').contains('Fully Qualified Name');
      cy.get(':nth-child(1) > .content_value').contains('/ TestDomain / TestNameSpace / TestClass');
      cy.get(':nth-child(2) > .label_header').contains('Name');
      cy.get(':nth-child(2) > .content_value').contains('TestClass');
      cy.get(':nth-child(3) > .label_header').contains('Display Name');
      cy.get(':nth-child(3) > .content_value').contains('Test Class 0');
      cy.get(':nth-child(4) > .label_header').contains('Description');
      cy.get(':nth-child(4) > .content_value').contains('This is a test class description');
      cy.get(':nth-child(5) > .label_header').contains('Instances');
      cy.get(':nth-child(5) > .content_value').contains('0');

      // Edits the class
      cy.get('[title="Configuration"]').click({force: true});
      cy.get('[title="Edit this Class"]').click({force: true});
      cy.get('[name="name"]').type('Edit', {force: true});
      cy.get('[name="display_name"]').clear().type('Edited Test Class', {force: true});
      cy.get('[name="description"').clear().type('Edited test class description');
      cy.get('[class="btnRight bx--btn bx--btn--primary"]').contains('Save').click({force: true});

      // Navigate to the Properties tab of the class just edited
      cy.get('#props_tab a').click();

      // Verify that the class edited correctly
      cy.get(':nth-child(1) > .label_header').contains('Fully Qualified Name');
      cy.get(':nth-child(1) > .content_value').contains('/ TestDomain / TestNameSpace / TestClassEdit');
      cy.get(':nth-child(2) > .label_header').contains('Name');
      cy.get(':nth-child(2) > .content_value').contains('TestClassEdit');
      cy.get(':nth-child(3) > .label_header').contains('Display Name');
      cy.get(':nth-child(3) > .content_value').contains('Edited Test Class');
      cy.get(':nth-child(4) > .label_header').contains('Description');
      cy.get(':nth-child(4) > .content_value').contains('Edited test class description');
      cy.get(':nth-child(5) > .label_header').contains('Instances');
      cy.get(':nth-child(5) > .content_value').contains('0');

      // Removes class
      cy.get('[title="Configuration"]').click({force: true});
      cy.get('[title="Remove this Class"]').click({force: true});

      // Verify that the class was removed
      cy.get('div.alert.alert-success.alert-dismissable')
        .should('exist')
        .and('contain', 'Automate Class "TestClassEdit": Delete successful');
      cy.get('#ns_details_div > .alert').contains('The selected Namespace is empty');
    });
  });

  after(() => {
    // Remove the Domain after all the tests
    cy.menu('Automation', 'Embedded Automate', 'Explorer');
    cy.get('[title="Datastore"]').click({force: true});
    cy.get('[title="Automate Domain: TestDomain"]').click({force: true});
    cy.get('[title="Configuration"]').click({force: true});
    cy.get('[title="Remove this Domain"]').click({force: true});

    cy.get('.bx--data-table-content tbody tr').should('not.contain', 'Automate Domain: TestDomain');
  });
});
