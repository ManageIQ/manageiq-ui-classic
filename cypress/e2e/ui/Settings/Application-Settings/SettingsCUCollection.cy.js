/* eslint-disable no-undef */

describe('Settings > Application Settings > Settings', () => {
  beforeEach(() => {
    cy.login();
    cy.intercept('POST', '/ops/accordion_select?id=rbac_accord').as('accordion');
    cy.menu('Settings', 'Application Settings');
  });

  describe('C&U Collection', () => {
    beforeEach(() => {
      cy.contains('ManageIQ Region').click();
      cy.contains('C & U Collection').click();
      cy.wait(500);
    });

    it('Reset clusters and datastores', () => {
      cy.get('.clusters-box').find('[class="rct-checkbox"]').first().click({ force: true });
      cy.get('.datastores-box').find('[class="rct-checkbox"]').first().click({ force: true });
      cy.get('[class="btnRight bx--btn bx--btn--secondary"]').click({force: true});
      cy.get('.react-checkbox-tree').find('input[type="checkbox"]').first().should('not.be.checked');
      cy.get('.react-checkbox-tree').find('input[type="checkbox"]').first().should('not.be.checked');
    });

    it('Save clusters and datastores', () => {
      cy.get('.clusters-box').find('[class="rct-checkbox"]').first().click({ force: true });
      cy.get('.datastores-box').find('[class="rct-checkbox"]').first().click({ force: true });
      cy.get('[class="btnRight bx--btn bx--btn--primary"]').click({force: true});
      cy.get('.react-checkbox-tree').find('input[type="checkbox"]').first().should('be.checked');
      cy.get('.react-checkbox-tree').find('input[type="checkbox"]').first().should('be.checked');
    });

    it('Collect all clusters', () => {
      cy.get('.bx--toggle__switch').first().click({ force: true });
      cy.get('[class="btnRight bx--btn bx--btn--primary"]').click({force: true});
      cy.get('.bx--toggle-input').first().should('be.checked');
      cy.wait(500);

      // cleanup
      cy.get('.bx--toggle__switch').first().click({ force: true });
      cy.get('[class="btnRight bx--btn bx--btn--primary"]').click({force: true});
      cy.get('.bx--toggle-input').first().should('not.be.checked');
    });

    it('Collect all datastores', () => {
      cy.get('.bx--toggle__switch').last().click({ force: true });
      cy.get('[class="btnRight bx--btn bx--btn--primary"]').click({ force: true });
      cy.get('.bx--toggle-input').last().should('be.checked');

      cy.wait(500);

      // cleanup
      cy.get('.bx--toggle__switch').last().click({ force: true });
      cy.get('[class="btnRight bx--btn bx--btn--primary"]').click({force: true});
      cy.get('.bx--toggle-input').last().should('not.be.checked');
    });
  });
});
