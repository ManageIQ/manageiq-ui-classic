/* eslint-disable no-undef */

describe('Automation > Embedded Automate > Customization', () => {
  beforeEach(() => {
    cy.login();
    cy.intercept('POST', '/ops/accordion_select?id=rbac_accord').as('accordion');
    cy.menu('Automation', 'Embedded Automate', 'Customization');
    cy.get('#explorer_title_text');
  });

  describe('Dialog Form', () => {
    it('Clicks the cancel button', () => {
      cy.get('[title="Configuration"]').click({force: true});
      cy.get('[title="Add a new Dialog"]').click({force: true});
      cy.get('[class="bx--btn bx--btn--secondary"]').contains('Cancel').click({force: true});
      cy.get('[id="explorer_title_text"]').contains('All Dialogs');
    });

    it('Clicks on a sample dialog', () => {
      cy.get('[title="Sample Configuration Management Provisioning Dialog"]').click({force: true});
      cy.get('.miq_ae_customization_summary').contains('miq_provision_configured_system_foreman_dialogs');
      cy.get('.miq_ae_customization_summary').contains('Sample Configuration Management Provisioning Dialog');
      cy.get('[class="CodeMirror-code"]').contains('---');
      cy.get('[class="CodeMirror-code"]').contains(':buttons:');
    });

    it('Resets a dialog being edited', () => {
      // creates a dialog
      cy.get('[title="Configuration"]').click({force: true});
      cy.get('[title="Add a new Dialog"]').click({force: true});
      cy.get('[name="name"]').type('Test User', {force: true});
      cy.get('[name="description"').type('Test Description');
      cy.get('[name="dialog_type"]').select('Configured System Provision');
      cy.get('[class="CodeMirror-lines"]').type(':Buttons:');
      cy.get('[class="btnRight bx--btn bx--btn--primary"]').click({force: true});
      cy.get('.miq_ae_customization_summary').contains('Test Description');

      // check correct data is displaying
      cy.contains('Test Description').click({force: true});
      cy.get('.miq_ae_customization_summary').contains('Test User');
      cy.get('.miq_ae_customization_summary').contains('Test Description');
      cy.get('[class="CodeMirror-code"]').contains('---');
      cy.get('[class="CodeMirror-code"]').contains(':Buttons:');

      // edits a dialog
      cy.get('[title="Configuration"]').click({force: true});
      cy.get('[title="Edit this Dialog"]').click({force: true});
      cy.get('[name="name"]').clear({force: true});
      cy.get('[name="name"]').clear({force: true}); // need to clear twice
      cy.get('[name="name"]').type('Edited Test User', {force: true});
      cy.get('[name="description"').clear({force: true});
      cy.get('[name="description"').type('Edited Test Description');
      cy.get('[name="dialog_type"]').select('Physical Server Provision');
      cy.get('[class="CodeMirror-lines"]').type('\n :submit:\n:cancel:');
      cy.get('[class="btnRight bx--btn bx--btn--secondary"]').contains('Reset').click({force: true});

      // check it was reset
      cy.get('[name="name"]').should('have.value', 'Test User');
      cy.get('[name="description"]').should('have.value', 'Test Description');
      cy.get('[class="CodeMirror-code"]').contains('---');
      cy.get('[class="CodeMirror-code"]').contains(':Buttons:');
      cy.get('[class="bx--btn bx--btn--secondary"]').contains('Cancel').click({force: true});

      // clean up
      cy.get('[title="Configuration"]').click({force: true});
      cy.get('[title="Remove this Dialog"]').click({force: true});

      cy.get('[class="list-group"]').should('not.contain', 'Test Description');
    });

    it('Creates, edits, deletes a dialog', () => {
      // creates a dialog
      cy.get('[title="Configuration"]').click({force: true});
      cy.get('[title="Add a new Dialog"]').click({force: true});
      cy.get('[name="name"]').type('Test User', {force: true});
      cy.get('[name="description"').type('Test Description', {force: true});
      cy.get('[name="dialog_type"]').select('Configured System Provision');
      cy.get('[class="CodeMirror-lines"]').type(':Buttons:');
      cy.get('[class="btnRight bx--btn bx--btn--primary"]').click({force: true});

      // check correct data is displaying
      // cy.get('[id="main_div"]').contains('Test Description');
      cy.contains('Test Description').click({force: true});
      cy.get('.miq_ae_customization_summary').contains('Test User');
      cy.get('.miq_ae_customization_summary').contains('Test Description');
      cy.get('[class="CodeMirror-code"]').contains('---');
      cy.get('[class="CodeMirror-code"]').contains(':Buttons:');

      // edits a dialog
      cy.get('[title="Configuration"]').click({force: true});
      cy.get('[title="Edit this Dialog"]').click({force: true});
      cy.get('[name="name"]').clear({force: true});
      cy.get('[name="name"]').clear({force: true}); // need to clear twice
      cy.get('[name="name"]').type('Edited Test User', {force: true});
      cy.get('[name="description"').clear({force: true});
      cy.get('[name="description"').type('Edited Test Description');
      cy.get('[name="dialog_type"]').select('Physical Server Provision');
      cy.get('[class="CodeMirror-lines"]').type('\n :submit:\n:cancel:');
      cy.get('[class="btnRight bx--btn bx--btn--primary"]').click({force: true});
      cy.get('[class="col-md-12"]').contains('Edited Test Description');

      // check correct data after editing
      cy.contains('Edited Test Description').click({force: true});
      cy.get('.miq_ae_customization_summary').contains('Edited Test User');
      cy.get('.miq_ae_customization_summary').contains('Edited Test Description');
      cy.get('[class="CodeMirror-code"]').contains('---');
      cy.get('[class="CodeMirror-code"]').contains(':Buttons:');
      cy.get('[class="CodeMirror-code"]').contains(':submit:');
      cy.get('[class="CodeMirror-code"]').contains(':cancel:');

      // check correct data after copying
      cy.contains('Edited Test Description').click({force: true});
      cy.get('.miq_ae_customization_summary').contains('Edited Test Description');
      cy.get('[class="CodeMirror-code"]').contains('---');
      cy.get('[class="CodeMirror-code"]').contains(':Buttons:');
      cy.get('[class="CodeMirror-code"]').contains(':submit:');
      cy.get('[class="CodeMirror-code"]').contains(':cancel:');

      cy.contains('Edited Test Description').click({force: true});
      cy.get('[title="Configuration"]').click({force: true});
      cy.get('[title="Remove this Dialog"]').click({force: true});

      cy.get('[class="list-group"]').should('not.contain', 'Test Description');
    });

    it('Creates, copies, and deletes a dialog', () => {
      // creates a dialog
      cy.get('[title="Configuration"]').click({force: true});
      cy.get('[title="Add a new Dialog"]').click({force: true});
      cy.get('[name="name"]').type('Test User', {force: true});
      cy.get('[name="description"').type('Test Description');
      cy.get('[name="dialog_type"]').select('Configured System Provision');
      cy.get('[class="CodeMirror-lines"]').type(':Buttons:');
      cy.get('[class="btnRight bx--btn bx--btn--primary"]').click({force: true});
      cy.get('[class="col-md-12"]').contains('Test Description');

      // check correct data is displaying
      cy.contains('Test Description').click({force: true});
      cy.get('.miq_ae_customization_summary').contains('Test User');
      cy.get('.miq_ae_customization_summary').contains('Test Description');
      cy.get('[class="CodeMirror-code"]').contains('---');
      cy.get('[class="CodeMirror-code"]').contains(':Buttons:');

      // copies a dialog
      cy.get('[title="Configuration"]').click({force: true});
      cy.get('[title="Copy this Dialog"]').click({force: true});
      cy.get('[class="btnRight bx--btn bx--btn--primary"]').click({force: true});
      cy.get('[class="col-md-12"]').contains('Test Description');

      cy.contains('Test Description').click({force: true});

      // clean up
      cy.get('[title="Configuration"]').click({force: true});
      cy.get('[title="Remove this Dialog"]').click({force: true});

      cy.get('[id="explorer_title_text"]').contains('Configured System Provision Dialogs');
      cy.get('[class="list-group"]').contains('Test Description').should('be.visible').click({force: true});
      cy.get('[id="main_div"]').contains('Test Description');
      cy.get('[title="Configuration"]').click({force: true});
      cy.get('[title="Remove this Dialog"]').click({force: true});

      cy.get('[class="list-group"]').should('not.contain', 'Test Description');
    });
  });
});
