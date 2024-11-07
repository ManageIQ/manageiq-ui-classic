/* eslint-disable no-undef */

describe('Settings > Application Settings > Access Control > Roles', () => {
  beforeEach(() => {
    cy.login();
    cy.intercept('POST', '/ops/accordion_select?id=rbac_accord').as('accordion');
    cy.menu('Settings', 'Application Settings');
    cy.contains('Access Control').click();
  });

  describe('Rbac Role Form', () => {
    beforeEach(() => {
      cy.get('[title="Roles"]').click();
    });

    it('Clicks the cancel button', () => {
      cy.get('[title="Configuration"]').click({force: true});
      cy.get('[title="Add a new Role"]').click({force: true});
      cy.get('[class="bx--btn bx--btn--secondary"]').contains('Cancel').click({force: true});
      cy.get('[id="explorer_title_text"]').contains('Access Control Roles');
    });

    it('Clicks on a sample role', () => {
      cy.get('[title="EvmRole-administrator"]').click({force: true});
      cy.get('.miq_summary').contains('EvmRole-administrator');
      cy.get('.miq_summary').contains('2');
      cy.get('.miq_summary').contains('None');
    });

    it('Resets a role being edited', () => {
      // creates a dialog
      cy.get('[title="Configuration"]').click({force: true});
      cy.get('[title="Add a new Role"]').click({force: true});
      cy.get('[name="name"]').type('Test Role', { force: true });
      cy.get('[name="vm_restriction"]').select('Only User Owned', { force: true });
      cy.get('[name="service_template_restriction"]').select('Only User Owned', { force: true });
      cy.get('span.rct-title').contains('Common Features in UI').parents('span.rct-text')
        .find('input[type="checkbox"]')
        .check({force: true});
      cy.get('[class="btnRight bx--btn bx--btn--primary"]').click({force: true});
      cy.get('[id="explorer_title_text"]').contains('Access Control Roles');

      // check correct data is displaying
      cy.contains('Test Role').click({force: true});
      cy.get('.miq_summary').contains('Test Role');
      cy.get('.miq_summary').contains('Only User Owned');
      cy.get('li[data-id="0.12"]')
        .find('i.checkbox-button')
        .should('have.class', 'fa-check-square-o');

      // edits a dialog
      cy.get('[title="Configuration"]').click({ force: true });
      cy.get('[title="Edit this Role"]').click({ force: true });
      cy.get('[name="name"]').clear({force: true});
      cy.get('[name="name"]').clear({force: true}); // need to clear twice
      cy.get('[name="name"]').type('Edited Test Role', { force: true});
      cy.get('[name="vm_restriction"]').select('Only User or Group Owned', { force: true });
      cy.get('[name="service_template_restriction"]').select('Only User or Group Owned', { force: true });
      cy.get('[class="btnRight bx--btn bx--btn--secondary"]').contains('Reset').click({ force: true });

      // check it was reset
      cy.get('[name="name"]').should('have.value', 'Test Role');
      cy.get('[name="vm_restriction"]').contains('Only User Owned');
      cy.get('[name="service_template_restriction"]').contains('Only User Owned');
      cy.get('[class="bx--btn bx--btn--secondary"]').contains('Cancel').click({force: true});

      // clean up
      cy.get('[title="Configuration"]').click({force: true});
      cy.get('[title="Delete this Role"]').click({force: true});

      cy.get('[class="list-group"]').should('not.contain', 'Test Role');
    });

    it('Creates, edits, deletes a role', () => {
      // creates a dialog
      cy.get('[title="Configuration"]').click({force: true});
      cy.get('[title="Add a new Role"]').click({force: true});
      cy.get('[name="name"]').type('Test Role', { force: true });
      cy.get('[name="vm_restriction"]').select('Only User Owned', { force: true });
      cy.get('[name="service_template_restriction"]').select('Only User Owned', { force: true });
      cy.get('span.rct-title').contains('Common Features in UI').parents('span.rct-text')
        .find('input[type="checkbox"]')
        .check({force: true});
      cy.get('[class="btnRight bx--btn bx--btn--primary"]').click({force: true});
      cy.get('[id="explorer_title_text"]').contains('Access Control Roles');

      // check correct data is displaying
      cy.contains('Test Role').click({force: true});
      cy.get('.miq_summary').contains('Test Role');
      cy.get('.miq_summary').contains('Only User Owned');
      cy.get('li[data-id="0.12"]')
        .find('i.checkbox-button')
        .should('have.class', 'fa-check-square-o');

      // edits a dialog
      cy.get('[title="Configuration"]').click({ force: true });
      cy.get('[title="Edit this Role"]').click({ force: true });
      cy.get('[name="name"]').clear({force: true});
      cy.get('[name="name"]').clear({force: true}); // need to clear twice
      cy.get('[name="name"]').type('Edited Test Role', { force: true});
      cy.get('[name="vm_restriction"]').select('Only User or Group Owned', { force: true });
      cy.get('[name="service_template_restriction"]').select('Only User or Group Owned', { force: true });
      cy.get('span.rct-title').contains('Main Configuration').parents('span.rct-text')
        .find('input[type="checkbox"]')
        .check({force: true});
      cy.get('[class="btnRight bx--btn bx--btn--primary"]').click({force: true});

      // check edited info
      cy.contains('Edited Test Role').click({force: true});
      cy.get('.miq_summary').contains('Edited Test Role');
      cy.get('.miq_summary').contains('Only User or Group Owned');
      cy.get('li[data-id="0.12"]')
        .find('i.checkbox-button')
        .should('have.class', 'fa-check-square-o');

      cy.get('li[data-id="0.11"]')
        .find('i.checkbox-button')
        .should('have.class', 'fa-check-square-o');

      // clean up
      cy.get('[title="Configuration"]').click({force: true});
      cy.get('[title="Delete this Role"]').click({force: true});

      cy.get('[class="list-group"]').should('not.contain', 'Test Role');
    });

    it('Creates, copies, and deletes a role', () => {
      // creates a dialog
      cy.get('[title="Configuration"]').click({force: true});
      cy.get('[title="Add a new Role"]').click({force: true});
      cy.get('[name="name"]').type('Test Role', { force: true });
      cy.get('[name="vm_restriction"]').select('Only User Owned', { force: true });
      cy.get('[name="service_template_restriction"]').select('Only User Owned', { force: true });
      cy.get('span.rct-title').contains('Common Features in UI').parents('span.rct-text')
        .find('input[type="checkbox"]')
        .check({force: true});
      cy.get('[class="btnRight bx--btn bx--btn--primary"]').click({force: true});
      cy.get('[id="explorer_title_text"]').contains('Access Control Roles');

      // check correct data is displaying
      cy.contains('Test Role').click({force: true});
      cy.get('.miq_summary').contains('Test Role');
      cy.get('.miq_summary').contains('Only User Owned');
      cy.get('li[data-id="0.12"]')
        .find('i.checkbox-button')
        .should('have.class', 'fa-check-square-o');

      // edits a dialog
      cy.get('[title="Configuration"]').click({ force: true });
      cy.get('[title="Copy this Role to a new Role"]').click({ force: true });
      cy.get('[class="btnRight bx--btn bx--btn--primary"]').click({force: true});

      cy.contains('Copy of Test Role').click({force: true});
      cy.get('.miq_summary').contains('Copy of Test Role');
      cy.get('.miq_summary').contains('Only User Owned');

      cy.get('li[data-id="0.12"]')
        .find('i.checkbox-button')
        .should('have.class', 'fa-check-square-o');

      // clean up
      cy.get('[title="Configuration"]').click({force: true});
      cy.get('[title="Delete this Role"]').click({force: true});

      cy.get('[class="list-group"]').should('not.contain', 'Copy of Test Role');

      cy.get('[id="explorer_title_text"]').contains('Access Control Roles');
      cy.get('[class="list-group"]').contains('Test Role').click({force: true});
      cy.get('[title="Configuration"]').click({force: true});
      cy.get('[title="Delete this Role"]').click({force: true});

      cy.get('[class="list-group"]').should('not.contain', 'Test Role');
    });
  });
});
